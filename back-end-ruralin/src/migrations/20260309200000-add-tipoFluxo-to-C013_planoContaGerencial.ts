import { QueryInterface, DataTypes, QueryTypes } from 'sequelize';

/**
 * Migration: Adicionar campo tipoFluxo em C013_planoContaGerencial
 *
 * Classifica cada conta gerencial como RECEITA ou DESPESA,
 * permitindo filtrar contas por tipo de fluxo financeiro nos lançamentos.
 *
 * Critério de migração dos dados existentes:
 * - Contas cujo item começa com '1.' são classificadas como RECEITA
 * - Contas cujo item começa com '2.' são classificadas como DESPESA
 * - Demais contas recebem DESPESA como padrão
 */
export async function up(queryInterface: QueryInterface): Promise<void> {
  const sequelize = queryInterface.sequelize;

  // Verificar se a coluna já existe
  const columnExists = await sequelize.query(`
    SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS
    WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME = 'C013_planoContaGerencial'
    AND COLUMN_NAME = 'tipoFluxo';
  `, { type: QueryTypes.SELECT }) as any[];

  if (!columnExists || columnExists.length === 0) {
    // Adicionar coluna com default temporário para permitir NOT NULL
    await queryInterface.addColumn('C013_planoContaGerencial', 'tipoFluxo', {
      type: DataTypes.ENUM('RECEITA', 'DESPESA'),
      allowNull: false,
      defaultValue: 'DESPESA',
      comment: 'Tipo de fluxo financeiro: RECEITA ou DESPESA',
    });

    // Migrar dados existentes: contas com item começando por '1.' são RECEITA
    await sequelize.query(`
      UPDATE C013_planoContaGerencial SET tipoFluxo = 'RECEITA' WHERE item LIKE '1.%';
    `);
  }
}

export async function down(queryInterface: QueryInterface): Promise<void> {
  await queryInterface.removeColumn('C013_planoContaGerencial', 'tipoFluxo');
}
