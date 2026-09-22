/**
 * Executa as migrações financeiras pendentes via SQL direto.
 * Idempotente — verifica existência antes de criar.
 *
 * Uso: npx ts-node scripts/run-pending-financial-migrations.ts
 */
import dotenv from 'dotenv'
dotenv.config()

import { Sequelize, QueryTypes } from 'sequelize'

const sequelize = new Sequelize(
  process.env.DB_NAME || 'ruralin',
  process.env.DB_USER || 'root',
  process.env.DB_PASSWORD || '',
  {
    host: process.env.DB_HOST || 'localhost',
    port: Number(process.env.DB_PORT) || 3306,
    dialect: 'mariadb',
    logging: false,
  }
)

async function colExists(table: string, col: string): Promise<boolean> {
  const r = await sequelize.query(
    `SELECT COUNT(*) as cnt FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = ? AND COLUMN_NAME = ?`,
    { replacements: [table, col], type: QueryTypes.SELECT }
  ) as any[]
  return Number(r[0]?.cnt) > 0
}

async function tblExists(table: string): Promise<boolean> {
  const r = await sequelize.query(
    `SELECT COUNT(*) as cnt FROM information_schema.TABLES WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = ?`,
    { replacements: [table], type: QueryTypes.SELECT }
  ) as any[]
  return Number(r[0]?.cnt) > 0
}

async function addCol(table: string, col: string, sql: string) {
  if (await colExists(table, col)) {
    console.log(`  [SKIP] ${table}.${col}`)
  } else {
    await sequelize.query(`ALTER TABLE \`${table}\` ADD COLUMN \`${col}\` ${sql}`)
    console.log(`  [ADD]  ${table}.${col}`)
  }
}

async function run() {
  await sequelize.authenticate()
  console.log('Conectado.\n')

  // === 1. C019_tituloPagar + C023_tituloReceber — campos de parcelamento/recorrência ===
  console.log('=== Campos de parcelamento/recorrência ===')
  const cols1 = [
    ['tipoGeracao', `ENUM('MANUAL','PARCELADO','RECORRENTE') NOT NULL DEFAULT 'MANUAL'`],
    ['recorrenciaFinanceiraId', `INT NULL DEFAULT NULL`],
    ['taxaJurosAm', `DECIMAL(5,4) NULL DEFAULT NULL`],
    ['indiceCorrecao', `ENUM('NENHUM','IPCA','IGPM','FIXO') NOT NULL DEFAULT 'NENHUM'`],
    ['taxaCorrecaoFixaAm', `DECIMAL(5,4) NULL DEFAULT NULL`],
    ['taxaMulta', `DECIMAL(5,4) NULL DEFAULT NULL`],
    ['intervaloParcelasDias', `INT NULL DEFAULT 30`],
    ['dataPrimeiraParcela', `DATE NULL DEFAULT NULL`],
    ['modeloJuros', `ENUM('SIMPLES','PRICE') NOT NULL DEFAULT 'SIMPLES'`],
    ['idTalhao', `INT NULL DEFAULT NULL`],
  ]
  for (const t of ['C019_tituloPagar', 'C023_tituloReceber']) {
    for (const [col, sql] of cols1) {
      await addCol(t, col!, sql!)
    }
  }

  // === 2. C020_parcelaTituloPagar + C024_parcelaTituloReceber — campos de encargos ===
  console.log('\n=== Campos de encargos nas parcelas ===')
  const cols2 = [
    ['valorParcelaMoedaOriginal', `DECIMAL(18,6) NULL DEFAULT NULL`],
    ['valorParcelaMoedaPadrao', `DECIMAL(18,6) NULL DEFAULT NULL`],
    ['valorBaixa', `DECIMAL(18,6) NULL DEFAULT NULL`],
  ]
  for (const t of ['C020_parcelaTituloPagar', 'C024_parcelaTituloReceber']) {
    for (const [col, sql] of cols2) {
      await addCol(t, col!, sql!)
    }
  }

  // === 3. C027/C028 movimentos financeiros ===
  console.log('\n=== Campos nos movimentos financeiros ===')
  const cols3 = [
    ['idConta', `INT NULL DEFAULT NULL`],
    ['tipoMovimento', `ENUM('BAIXA','ESTORNO','JUROS','MULTA','DESCONTO','CORRECAO') NOT NULL DEFAULT 'BAIXA'`],
  ]
  for (const t of ['C027_movimentoFinanceiroTituloPagar', 'C028_movimentoFinanceiroTituloReceber']) {
    for (const [col, sql] of cols3) {
      await addCol(t, col!, sql!)
    }
  }

  // === 4. recorrencia_financeira ===
  console.log('\n=== Tabela recorrencia_financeira ===')
  if (await tblExists('recorrencia_financeira')) {
    console.log('  [SKIP] já existe')
  } else {
    await sequelize.query(`
      CREATE TABLE recorrencia_financeira (
        id INT AUTO_INCREMENT PRIMARY KEY,
        tenantId INT NOT NULL,
        tipo ENUM('PAGAR','RECEBER') NOT NULL DEFAULT 'PAGAR',
        descricao VARCHAR(200) NOT NULL,
        idFornecedor INT NULL, idCliente INT NULL, idPortador INT NULL,
        idProdutor INT NULL, idFazenda INT NULL, idSafra INT NULL,
        idMoeda INT NULL, idPlanoContaGerencial INT NULL, idCentroCusto INT NULL,
        valorBase DECIMAL(18,6) NOT NULL,
        frequencia ENUM('DIARIA','SEMANAL','QUINZENAL','MENSAL','BIMESTRAL','TRIMESTRAL','SEMESTRAL','ANUAL') NOT NULL DEFAULT 'MENSAL',
        diaVencimento INT NULL, dataInicio DATE NOT NULL, dataFim DATE NULL,
        quantidadeGeracoes INT NULL, proximaGeracao DATE NULL,
        ativa TINYINT(1) NOT NULL DEFAULT 1, geracoesRealizadas INT NOT NULL DEFAULT 0,
        observacao TEXT NULL, usercreation INT NULL,
        datecreation DATETIME DEFAULT CURRENT_TIMESTAMP,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_recfin_tenant (tenantId), INDEX idx_recfin_tipo (tipo),
        INDEX idx_recfin_ativa (ativa), INDEX idx_recfin_proxGeracao (proximaGeracao)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `)
    console.log('  [CREATE]')
  }

  // === 5. lancamento_recorrente ===
  console.log('\n=== Tabela lancamento_recorrente ===')
  if (await tblExists('lancamento_recorrente')) {
    console.log('  [SKIP] já existe')
  } else {
    await sequelize.query(`
      CREATE TABLE lancamento_recorrente (
        id INT AUTO_INCREMENT PRIMARY KEY,
        tenantId INT NOT NULL,
        recorrenciaFinanceiraId INT NOT NULL,
        dataReferencia DATE NOT NULL, dataVencimento DATE NOT NULL,
        valorGerado DECIMAL(18,6) NOT NULL,
        idTituloPagar INT NULL, idTituloReceber INT NULL,
        status ENUM('GERADO','CANCELADO','ERRO') NOT NULL DEFAULT 'GERADO',
        observacao TEXT NULL, usercreation INT NULL,
        datecreation DATETIME DEFAULT CURRENT_TIMESTAMP,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_lancRecorr_tenant (tenantId),
        INDEX idx_lancRecorr_recorrencia (recorrenciaFinanceiraId),
        UNIQUE KEY uk_lancRecorr_ref (recorrenciaFinanceiraId, dataReferencia, status),
        CONSTRAINT fk_lancRecorr_recorrencia FOREIGN KEY (recorrenciaFinanceiraId)
          REFERENCES recorrencia_financeira(id) ON UPDATE CASCADE ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `)
    console.log('  [CREATE]')
  }

  // === 6. alerta_vencimento_config ===
  console.log('\n=== Tabela alerta_vencimento_config ===')
  if (await tblExists('alerta_vencimento_config')) {
    console.log('  [SKIP] já existe')
  } else {
    await sequelize.query(`
      CREATE TABLE alerta_vencimento_config (
        id INT AUTO_INCREMENT PRIMARY KEY,
        tenantId INT NOT NULL,
        tipo ENUM('PAGAR','RECEBER','AMBOS') NOT NULL DEFAULT 'AMBOS',
        diasAntecedencia INT NOT NULL DEFAULT 7,
        ativo TINYINT(1) NOT NULL DEFAULT 1,
        notificarEmail TINYINT(1) NOT NULL DEFAULT 0,
        notificarSistema TINYINT(1) NOT NULL DEFAULT 1,
        emailDestinatario VARCHAR(255) NULL,
        usercreation INT NULL,
        datecreation DATETIME DEFAULT CURRENT_TIMESTAMP,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_alertaConf_tenant (tenantId)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `)
    console.log('  [CREATE]')
  }

  // === 7. alerta_vencimento ===
  console.log('\n=== Tabela alerta_vencimento ===')
  if (await tblExists('alerta_vencimento')) {
    console.log('  [SKIP] já existe')
  } else {
    await sequelize.query(`
      CREATE TABLE alerta_vencimento (
        id INT AUTO_INCREMENT PRIMARY KEY,
        tenantId INT NOT NULL,
        configId INT NOT NULL,
        tipo ENUM('PAGAR','RECEBER') NOT NULL,
        idParcela INT NOT NULL,
        dataVencimento DATE NOT NULL, valorParcela DECIMAL(18,6) NOT NULL,
        diasParaVencimento INT NOT NULL,
        lido TINYINT(1) NOT NULL DEFAULT 0, dataLeitura DATETIME NULL,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_alerta_tenant (tenantId), INDEX idx_alerta_config (configId),
        INDEX idx_alerta_lido (lido),
        CONSTRAINT fk_alerta_config FOREIGN KEY (configId)
          REFERENCES alerta_vencimento_config(id) ON UPDATE CASCADE ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `)
    console.log('  [CREATE]')
  }

  // === 8. tipoFluxo em planoContaGerencial ===
  console.log('\n=== tipoFluxo em planoContaGerencial ===')
  await addCol('C013_planoContaGerencial', 'tipoFluxo', `ENUM('ENTRADA','SAIDA','AMBOS') NOT NULL DEFAULT 'AMBOS'`)

  console.log('\n✅ Migrações financeiras aplicadas com sucesso!')
  await sequelize.close()
}

run().catch((err) => {
  console.error('ERRO:', err.message || err)
  process.exit(1)
})
