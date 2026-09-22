/**
 * Script para criar permissões dos módulos financeiros e vincular à role ADMIN.
 *
 * Uso:
 *   npx ts-node scripts/seed-permissoes-financeiro.ts
 */

import dotenv from 'dotenv'
dotenv.config()

import { Sequelize, QueryTypes } from 'sequelize'

const dbName = process.env.DB_NAME || 'gmpr_qas'
const dbUser = process.env.DB_USER || 'root'
const dbPassword = process.env.DB_PASSWORD || ''
const dbHost = process.env.DB_HOST || 'localhost'
const dbPort = process.env.DB_PORT || '3306'

const sequelize = new Sequelize(dbName, dbUser, dbPassword, {
  host: dbHost,
  port: Number(dbPort),
  dialect: 'mariadb',
  logging: false,
})

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

async function main() {
  try {
    await sequelize.authenticate()
    console.log('Conexão com banco de dados estabelecida.\n')

    const now = new Date().toISOString().slice(0, 19).replace('T', ' ')
    let created = 0
    let skipped = 0

    // 1. Inserir permissões que ainda não existem
    console.log('=== Criando permissões ===')
    for (const nome of PERMISSOES) {
      const existing = await sequelize.query(
        `SELECT id FROM permissoes WHERE nome = ? LIMIT 1`,
        { replacements: [nome], type: QueryTypes.SELECT }
      ) as Array<{ id: number }>

      if (existing.length === 0) {
        await sequelize.query(
          `INSERT INTO permissoes (nome, createdAt, updatedAt) VALUES (?, ?, ?)`,
          { replacements: [nome, now, now], type: QueryTypes.INSERT }
        )
        console.log(`  + ${nome}`)
        created++
      } else {
        console.log(`  - ${nome} (já existe)`)
        skipped++
      }
    }
    console.log(`\n  Total: ${created} criadas, ${skipped} já existiam\n`)

    // 2. Garantir que a role ADMIN existe
    console.log('=== Verificando role ADMIN ===')
    const adminRoles = await sequelize.query(
      `SELECT id FROM roles WHERE nome = 'ADMIN' LIMIT 1`,
      { type: QueryTypes.SELECT }
    ) as Array<{ id: number }>

    let adminRoleId: number

    if (adminRoles.length === 0) {
      await sequelize.query(
        `INSERT INTO roles (nome, createdAt, updatedAt) VALUES ('ADMIN', ?, ?)`,
        { replacements: [now, now], type: QueryTypes.INSERT }
      )
      const newRole = await sequelize.query(
        `SELECT id FROM roles WHERE nome = 'ADMIN' LIMIT 1`,
        { type: QueryTypes.SELECT }
      ) as Array<{ id: number }>
      adminRoleId = newRole[0]!.id
      console.log(`  + Role ADMIN criada (id: ${adminRoleId})\n`)
    } else {
      adminRoleId = adminRoles[0]!.id
      console.log(`  - Role ADMIN já existe (id: ${adminRoleId})\n`)
    }

    // 3. Vincular permissões à role ADMIN
    console.log('=== Vinculando permissões à role ADMIN ===')
    let linked = 0
    let linkSkipped = 0

    for (const nome of PERMISSOES) {
      const permRows = await sequelize.query(
        `SELECT id FROM permissoes WHERE nome = ? LIMIT 1`,
        { replacements: [nome], type: QueryTypes.SELECT }
      ) as Array<{ id: number }>

      if (permRows.length > 0) {
        const permId = permRows[0]!.id

        const existing = await sequelize.query(
          `SELECT roleId FROM role_has_permissao WHERE roleId = ? AND permissaoId = ? LIMIT 1`,
          { replacements: [adminRoleId, permId], type: QueryTypes.SELECT }
        ) as Array<{ roleId: number }>

        if (existing.length === 0) {
          await sequelize.query(
            `INSERT INTO role_has_permissao (roleId, permissaoId, createdAt, updatedAt) VALUES (?, ?, ?, ?)`,
            { replacements: [adminRoleId, permId, now, now], type: QueryTypes.INSERT }
          )
          console.log(`  + ADMIN <- ${nome}`)
          linked++
        } else {
          console.log(`  - ADMIN <- ${nome} (já vinculada)`)
          linkSkipped++
        }
      }
    }
    console.log(`\n  Total: ${linked} vinculadas, ${linkSkipped} já existiam\n`)

    // 4. Resumo final
    console.log('=== Resumo ===')
    const totalPerms = await sequelize.query(
      `SELECT COUNT(*) as total FROM permissoes`,
      { type: QueryTypes.SELECT }
    ) as Array<{ total: number }>
    const totalRolePerms = await sequelize.query(
      `SELECT COUNT(*) as total FROM role_has_permissao WHERE roleId = ?`,
      { replacements: [adminRoleId], type: QueryTypes.SELECT }
    ) as Array<{ total: number }>

    console.log(`  Permissões totais no sistema: ${totalPerms[0]!.total}`)
    console.log(`  Permissões vinculadas à ADMIN: ${totalRolePerms[0]!.total}`)
    console.log('\nScript executado com sucesso!')

  } catch (error) {
    console.error('Erro ao executar script:', error)
    process.exit(1)
  } finally {
    await sequelize.close()
  }
}

main()
