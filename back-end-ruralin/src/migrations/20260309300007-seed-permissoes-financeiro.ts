import { QueryInterface, QueryTypes } from 'sequelize'

/**
 * Seed de permissões para os módulos financeiros:
 * - tituloPagar (contas a pagar)
 * - tituloReceber (contas a receber)
 * - recorrenciaFinanceira (lançamentos recorrentes)
 * - alertaVencimentoConfig (alertas de vencimento)
 *
 * Também vincula todas as permissões à role ADMIN.
 */

const PERMISSOES = [
  // Contas a Pagar
  'tituloPagar.read',
  'tituloPagar.create',
  'tituloPagar.update',
  'tituloPagar.delete',
  'tituloPagar.baixar',
  'tituloPagar.estornar',

  // Contas a Receber
  'tituloReceber.read',
  'tituloReceber.create',
  'tituloReceber.update',
  'tituloReceber.delete',
  'tituloReceber.baixar',
  'tituloReceber.estornar',

  // Recorrência Financeira
  'recorrenciaFinanceira.read',
  'recorrenciaFinanceira.create',
  'recorrenciaFinanceira.update',
  'recorrenciaFinanceira.delete',

  // Alerta de Vencimento
  'alertaVencimentoConfig.read',
  'alertaVencimentoConfig.create',
  'alertaVencimentoConfig.update',
  'alertaVencimentoConfig.delete',
]

function toMySQLDatetime(d: Date): string {
  return d.toISOString().slice(0, 19).replace('T', ' ')
}

export async function up(queryInterface: QueryInterface): Promise<void> {
  const now = new Date()

  // 1. Inserir permissões que ainda não existem
  for (const nome of PERMISSOES) {
    const existing = await queryInterface.sequelize.query(
      `SELECT id FROM permissoes WHERE nome = :nome LIMIT 1`,
      { replacements: { nome }, type: QueryTypes.SELECT }
    ) as Array<{ id: number }>

    if (existing.length === 0) {
      await queryInterface.sequelize.query(
        `INSERT INTO permissoes (nome, createdAt, updatedAt) VALUES (:nome, :now, :now)`,
        { replacements: { nome, now: toMySQLDatetime(now) }, type: QueryTypes.RAW }
      )
    }
  }

  // 2. Garantir que a role ADMIN existe
  const adminRoles = await queryInterface.sequelize.query(
    `SELECT id FROM roles WHERE nome = 'ADMIN' LIMIT 1`,
    { type: QueryTypes.SELECT }
  ) as Array<{ id: number }>

  let adminRoleId: number

  if (adminRoles.length === 0) {
    await queryInterface.sequelize.query(
      `INSERT INTO roles (nome, createdAt, updatedAt) VALUES ('ADMIN', :now, :now)`,
      { replacements: { now: toMySQLDatetime(now) }, type: QueryTypes.RAW }
    )
    const newRole = await queryInterface.sequelize.query(
      `SELECT id FROM roles WHERE nome = 'ADMIN' LIMIT 1`,
      { type: QueryTypes.SELECT }
    ) as Array<{ id: number }>
    adminRoleId = newRole[0]!.id
  } else {
    adminRoleId = adminRoles[0]!.id
  }

  // 3. Vincular permissões à role ADMIN (se ainda não vinculadas)
  for (const nome of PERMISSOES) {
    const permRows = await queryInterface.sequelize.query(
      `SELECT id FROM permissoes WHERE nome = :nome LIMIT 1`,
      { replacements: { nome }, type: QueryTypes.SELECT }
    ) as Array<{ id: number }>

    if (permRows.length > 0) {
      const permId = permRows[0]!.id

      const existing = await queryInterface.sequelize.query(
        `SELECT roleId FROM role_has_permissao WHERE roleId = :roleId AND permissaoId = :permId LIMIT 1`,
        { replacements: { roleId: adminRoleId, permId }, type: QueryTypes.SELECT }
      ) as Array<{ roleId: number }>

      if (existing.length === 0) {
        await queryInterface.sequelize.query(
          `INSERT INTO role_has_permissao (roleId, permissaoId, createdAt, updatedAt) VALUES (:roleId, :permId, :now, :now)`,
          { replacements: { roleId: adminRoleId, permId, now: toMySQLDatetime(now) }, type: QueryTypes.RAW }
        )
      }
    }
  }
}

export async function down(queryInterface: QueryInterface): Promise<void> {
  // 1. Remover vínculos role_has_permissao para as permissões criadas
  for (const nome of PERMISSOES) {
    const permRows = await queryInterface.sequelize.query(
      `SELECT id FROM permissoes WHERE nome = :nome LIMIT 1`,
      { replacements: { nome }, type: QueryTypes.SELECT }
    ) as Array<{ id: number }>

    if (permRows.length > 0) {
      await queryInterface.sequelize.query(
        `DELETE FROM role_has_permissao WHERE permissaoId = :permId`,
        { replacements: { permId: permRows[0]!.id }, type: QueryTypes.RAW }
      )
    }
  }

  // 2. Remover permissões
  const nomes = PERMISSOES.map(n => `'${n}'`).join(', ')
  await queryInterface.sequelize.query(
    `DELETE FROM permissoes WHERE nome IN (${nomes})`,
    { type: QueryTypes.RAW }
  )
}
