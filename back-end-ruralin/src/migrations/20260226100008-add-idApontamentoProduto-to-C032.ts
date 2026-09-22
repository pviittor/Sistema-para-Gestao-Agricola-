import { QueryInterface, DataTypes } from 'sequelize';

/**
 * Migration: Adicionar coluna idApontamentoProduto à tabela C032_movimentoEstoque
 *
 * Adiciona FK para vincular movimentos de estoque a apontamentos de produto.
 */
export async function up(queryInterface: QueryInterface): Promise<void> {
  // Verificar se a coluna já existe
  const tableDesc = await queryInterface.describeTable('C032_movimentoEstoque');
  if (!tableDesc['idApontamentoProduto']) {
    await queryInterface.addColumn('C032_movimentoEstoque', 'idApontamentoProduto', {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'C040_apontamentoProduto',
        key: 'id_aptprod',
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL',
    });
    await queryInterface.addIndex('C032_movimentoEstoque', ['idApontamentoProduto'], {
      name: 'idx_movEstoque_idApontamentoProduto',
    });
  }
}

export async function down(queryInterface: QueryInterface): Promise<void> {
  await queryInterface.removeColumn('C032_movimentoEstoque', 'idApontamentoProduto');
}
