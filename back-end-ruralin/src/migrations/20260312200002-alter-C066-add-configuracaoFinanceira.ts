import { QueryInterface, QueryTypes } from 'sequelize';

/**
 * Migration: Adiciona colunas de configuração financeira padrão à tabela C066_tipoAtividadeOS
 *
 * - planoContaIdPadrao: plano de conta padrão para geração financeira
 * - centroCustoIdPadrao: centro de custo padrão para geração financeira
 *
 * FK constraints não são adicionadas aqui pois pode haver incompatibilidade de engine/charset
 * entre tabelas criadas via sync() e via migration. A integridade referencial é garantida
 * pela validação @IsExists no DTO do Application Service.
 */

export async function up(queryInterface: QueryInterface): Promise<void> {
  const seq = queryInterface.sequelize;

  // Descobre o tipo exato da PK de C009_planoContaGerencial
  const planoRows = await seq.query(
    `SELECT COLUMN_TYPE FROM INFORMATION_SCHEMA.COLUMNS
     WHERE TABLE_SCHEMA = DATABASE()
       AND TABLE_NAME = 'C009_planoContaGerencial'
       AND COLUMN_NAME = 'id'`,
    { type: QueryTypes.SELECT }
  ) as any[];
  const planoIdType = planoRows[0]?.COLUMN_TYPE || 'int(11)';

  // Descobre o tipo exato da PK de C010_centroCusto
  const custoRows = await seq.query(
    `SELECT COLUMN_TYPE FROM INFORMATION_SCHEMA.COLUMNS
     WHERE TABLE_SCHEMA = DATABASE()
       AND TABLE_NAME = 'C010_centroCusto'
       AND COLUMN_NAME = 'id'`,
    { type: QueryTypes.SELECT }
  ) as any[];
  const custoIdType = custoRows[0]?.COLUMN_TYPE || 'int(11)';

  // Adiciona colunas sem FK constraint (validação via @IsExists no DTO)
  await seq.query(
    `ALTER TABLE C066_tipoAtividadeOS
     ADD COLUMN IF NOT EXISTS planoContaIdPadrao ${planoIdType} NULL
       COMMENT 'Plano de conta gerencial padrão para custeio'`
  );

  await seq.query(
    `ALTER TABLE C066_tipoAtividadeOS
     ADD COLUMN IF NOT EXISTS centroCustoIdPadrao ${custoIdType} NULL
       COMMENT 'Centro de custo padrão para custeio'`
  );

  // Adiciona índices para performance de queries
  try {
    await seq.query(
      `ALTER TABLE C066_tipoAtividadeOS ADD INDEX idx_planoContaIdPadrao (planoContaIdPadrao)`
    );
  } catch { /* index may already exist */ }

  try {
    await seq.query(
      `ALTER TABLE C066_tipoAtividadeOS ADD INDEX idx_centroCustoIdPadrao (centroCustoIdPadrao)`
    );
  } catch { /* index may already exist */ }
}

export async function down(queryInterface: QueryInterface): Promise<void> {
  await queryInterface.removeColumn('C066_tipoAtividadeOS', 'centroCustoIdPadrao');
  await queryInterface.removeColumn('C066_tipoAtividadeOS', 'planoContaIdPadrao');
}
