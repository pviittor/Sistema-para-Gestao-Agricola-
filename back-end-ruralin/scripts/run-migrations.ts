/**
 * Script para executar migrations do Sequelize
 * 
 * Este script executa todas as migrations pendentes usando o Sequelize diretamente,
 * sem depender do Sequelize CLI.
 * 
 * Uso:
 *   ts-node scripts/run-migrations.ts
 * 
 * Para executar uma migration específica:
 *   ts-node scripts/run-migrations.ts --name 20260116120346
 * 
 * Para fazer rollback da última migration:
 *   ts-node scripts/run-migrations.ts --undo
 */

import { Sequelize, QueryTypes } from 'sequelize';
import { QueryInterface } from 'sequelize';
import dotenv from 'dotenv';
import * as fs from 'fs';
import * as path from 'path';

dotenv.config();

const dbName = process.env.DB_NAME || 'gmpr_qas';
const dbUser = process.env.DB_USER || 'root';
const dbPassword = process.env.DB_PASSWORD || 'x1Qa#D&xkgIEDUA/2Zr&';
const dbHost = process.env.DB_HOST || '72.61.56.64';
const dbPort = process.env.DB_PORT || '3306';

const sequelize = new Sequelize(dbName, dbUser, dbPassword, {
  host: dbHost,
  port: Number(dbPort),
  dialect: 'mariadb',
  logging: console.log,
});

interface MigrationFile {
  name: string;
  path: string;
  timestamp: string;
}

/**
 * Carrega todas as migrations disponíveis
 */
function loadMigrations(): MigrationFile[] {
  const migrationsPath = path.join(__dirname, '../src/migrations');
  const files = fs.readdirSync(migrationsPath)
    .filter(file => file.endsWith('.ts') && !file.endsWith('.map'))
    .map(file => {
      const match = file.match(/^(\d+)-(.+)\.ts$/);
      if (match) {
        return {
          name: file,
          path: path.join(migrationsPath, file),
          timestamp: match[1],
        };
      }
      return null;
    })
    .filter((m): m is MigrationFile => m !== null)
    .sort((a, b) => a.timestamp.localeCompare(b.timestamp));

  return files;
}

/**
 * Verifica quais migrations já foram executadas
 */
async function getExecutedMigrations(queryInterface: QueryInterface): Promise<string[]> {
  // Criar tabela de migrations se não existir
  await queryInterface.sequelize.query(`
    CREATE TABLE IF NOT EXISTS SequelizeMeta (
      name VARCHAR(255) NOT NULL PRIMARY KEY
    ) ENGINE=InnoDB;
  `);

  try {
    const [results] = await queryInterface.sequelize.query(`
      SELECT name FROM SequelizeMeta ORDER BY name;
    `, {
      type: QueryTypes.SELECT,
    }) as any[];

    return Array.isArray(results) ? results.map((row: any) => row.name) : [];
  } catch (error) {
    // Se a tabela não existir ou estiver vazia, retornar array vazio
    return [];
  }
}

/**
 * Executa uma migration
 */
async function runMigration(migration: MigrationFile, queryInterface: QueryInterface): Promise<void> {
  console.log(`Executando migration: ${migration.name}`);
  
  // Remover cache do require se existir
  delete require.cache[require.resolve(migration.path)];
  
  const migrationModule = require(migration.path);
  
  if (typeof migrationModule.up !== 'function') {
    throw new Error(`Migration ${migration.name} não possui método 'up'`);
  }

  try {
    await migrationModule.up(queryInterface);
  } catch (error: any) {
    // Se o erro for de coluna/tabela já existente, considerar como sucesso (idempotência)
    if (error?.original?.code === 'ER_DUP_FIELDNAME' || 
        error?.original?.code === 'ER_DUP_KEYNAME' ||
        error?.original?.code === 'ER_TABLE_EXISTS_ERROR' ||
        error?.message?.includes('already exists') ||
        error?.message?.includes('Duplicate')) {
      console.log(`⚠ Migration ${migration.name} já foi executada parcialmente (coluna/tabela já existe).`);
    } else {
      throw error;
    }
  }
  
  // Registrar migration como executada
  await queryInterface.sequelize.query(`
    INSERT INTO SequelizeMeta (name) VALUES (?)
    ON DUPLICATE KEY UPDATE name = name;
  `, {
    replacements: [migration.name],
    type: QueryTypes.INSERT,
  });

  console.log(`✓ Migration ${migration.name} executada com sucesso`);
}

/**
 * Faz rollback de uma migration
 */
async function undoMigration(migration: MigrationFile, queryInterface: QueryInterface): Promise<void> {
  console.log(`Revertendo migration: ${migration.name}`);
  
  delete require.cache[require.resolve(migration.path)];
  
  const migrationModule = require(migration.path);
  
  if (typeof migrationModule.down !== 'function') {
    throw new Error(`Migration ${migration.name} não possui método 'down'`);
  }

  await migrationModule.down(queryInterface);
  
  // Remover registro da migration
  await queryInterface.sequelize.query(`
    DELETE FROM SequelizeMeta WHERE name = ?;
  `, {
    replacements: [migration.name],
    type: QueryTypes.DELETE,
  });

  console.log(`✓ Migration ${migration.name} revertida com sucesso`);
}

/**
 * Função principal
 */
async function main() {
  const args = process.argv.slice(2);
  const undo = args.includes('--undo');
  const nameArg = args.find(arg => arg.startsWith('--name='));
  const migrationName = nameArg ? nameArg.split('=')[1] : null;

  try {
    await sequelize.authenticate();
    console.log('Conexão com banco de dados estabelecida com sucesso.\n');

    const queryInterface = sequelize.getQueryInterface();
    const allMigrations = loadMigrations();
    const executedMigrations = await getExecutedMigrations(queryInterface);

    if (undo) {
      // Rollback: reverter última migration executada
      const executed = allMigrations.filter(m => executedMigrations.includes(m.name));
      if (executed.length === 0) {
        console.log('Nenhuma migration para reverter.');
        return;
      }

      const lastMigration = executed[executed.length - 1];
      await undoMigration(lastMigration, queryInterface);
    } else if (migrationName) {
      // Executar migration específica
      const migration = allMigrations.find(m => m.timestamp === migrationName || m.name.includes(migrationName));
      if (!migration) {
        console.error(`Migration não encontrada: ${migrationName}`);
        process.exit(1);
      }

      if (executedMigrations.includes(migration.name)) {
        console.log(`Migration ${migration.name} já foi executada.`);
        return;
      }

      await runMigration(migration, queryInterface);
    } else {
      // Executar todas as migrations pendentes
      const pendingMigrations = allMigrations.filter(m => !executedMigrations.includes(m.name));

      if (pendingMigrations.length === 0) {
        console.log('Nenhuma migration pendente.');
        return;
      }

      console.log(`Encontradas ${pendingMigrations.length} migration(s) pendente(s):\n`);
      for (const migration of pendingMigrations) {
        console.log(`  - ${migration.name}`);
      }
      console.log('');

      for (const migration of pendingMigrations) {
        await runMigration(migration, queryInterface);
      }

      console.log(`\n✓ Todas as migrations foram executadas com sucesso!`);
    }
  } catch (error) {
    console.error('Erro ao executar migrations:', error);
    process.exit(1);
  } finally {
    await sequelize.close();
  }
}

main();
