import { QueryInterface, DataTypes } from 'sequelize';

/**
 * Migration: Adicionar coluna itemPedidoCompraId a tabela C046_itemNotaFiscal
 *
 * Adiciona FK para vincular itens de nota fiscal a itens de pedido de compra.
 */
export async function up(queryInterface: QueryInterface): Promise<void> {
  // Verificar se a coluna ja existe
  const tableDesc = await queryInterface.describeTable('C046_itemNotaFiscal');
  if (!tableDesc['itemPedidoCompraId']) {
    await queryInterface.addColumn('C046_itemNotaFiscal', 'itemPedidoCompraId', {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'C048_itemPedidoCompra',
        key: 'id_item_ped',
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL',
    });
    await queryInterface.addIndex('C046_itemNotaFiscal', ['itemPedidoCompraId'], {
      name: 'idx_itemNF_itemPedidoCompraId',
    });
  }
}

export async function down(queryInterface: QueryInterface): Promise<void> {
  await queryInterface.removeColumn('C046_itemNotaFiscal', 'itemPedidoCompraId');
}
