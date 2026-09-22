import { QueryInterface, DataTypes } from 'sequelize';

/**
 * Migration: Adicionar coluna idItemNotaFiscal a tabela C032_movimentoEstoque
 *
 * Adiciona FK para vincular movimentos de estoque a itens de nota fiscal.
 */
export async function up(queryInterface: QueryInterface): Promise<void> {
  // Verificar se a coluna ja existe
  const tableDesc = await queryInterface.describeTable('C032_movimentoEstoque');
  if (!tableDesc['idItemNotaFiscal']) {
    await queryInterface.addColumn('C032_movimentoEstoque', 'idItemNotaFiscal', {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'C046_itemNotaFiscal',
        key: 'id_item_nf',
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL',
    });
    await queryInterface.addIndex('C032_movimentoEstoque', ['idItemNotaFiscal'], {
      name: 'idx_movEstoque_idItemNotaFiscal',
    });
  }
}

export async function down(queryInterface: QueryInterface): Promise<void> {
  await queryInterface.removeColumn('C032_movimentoEstoque', 'idItemNotaFiscal');
}
