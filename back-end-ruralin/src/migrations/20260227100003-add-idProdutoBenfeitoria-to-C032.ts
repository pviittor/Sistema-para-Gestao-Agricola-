import { QueryInterface, DataTypes } from 'sequelize';

/**
 * Migration: Adicionar coluna idProdutoBenfeitoria à tabela C032_movimentoEstoque
 *
 * Adiciona FK para vincular movimentos de estoque a produtos de benfeitoria.
 */
export async function up(queryInterface: QueryInterface): Promise<void> {
  // Verificar se a coluna já existe
  const tableDesc = await queryInterface.describeTable('C032_movimentoEstoque');
  if (!tableDesc['idProdutoBenfeitoria']) {
    await queryInterface.addColumn('C032_movimentoEstoque', 'idProdutoBenfeitoria', {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'C043_produtoBenfeitoria',
        key: 'id_prodbenf',
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL',
    });
    await queryInterface.addIndex('C032_movimentoEstoque', ['idProdutoBenfeitoria'], {
      name: 'idx_movEstoque_idProdutoBenfeitoria',
    });
  }
}

export async function down(queryInterface: QueryInterface): Promise<void> {
  await queryInterface.removeColumn('C032_movimentoEstoque', 'idProdutoBenfeitoria');
}
