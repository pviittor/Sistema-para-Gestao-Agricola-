import { QueryInterface, QueryTypes } from 'sequelize'

const PERMISSOES = [
  'numeracaoRecibo.create',
  'numeracaoRecibo.read',
  'numeracaoRecibo.update',
  'numeracaoRecibo.delete',
]

function toMySQLDatetime(d: Date): string {
  return d.toISOString().slice(0, 19).replace('T', ' ')
}

export async function up(queryInterface: QueryInterface): Promise<void> {
  const now = new Date()

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

  const adminRoles = await queryInterface.sequelize.query(
    `SELECT id FROM roles WHERE nome = 'ADMIN' LIMIT 1`,
    { type: QueryTypes.SELECT }
  ) as Array<{ id: number }>

  if (adminRoles.length > 0) {
    const adminRoleId = adminRoles[0]!.id

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
}

export async function down(queryInterface: QueryInterface): Promise<void> {
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

  const nomes = PERMISSOES.map(n => `'${n}'`).join(', ')
  await queryInterface.sequelize.query(
    `DELETE FROM permissoes WHERE nome IN (${nomes})`,
    { type: QueryTypes.RAW }
  )
}
