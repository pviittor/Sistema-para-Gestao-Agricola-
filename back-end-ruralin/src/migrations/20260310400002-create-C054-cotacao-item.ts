import { QueryInterface, DataTypes } from 'sequelize'

/**
 * Migration para criar tabela C054_cotacaoItem
 *
 * Itens da cotacao vinculados a itens do pedido de compra
 */
export async function up(queryInterface: QueryInterface): Promise<void> {
  await queryInterface.createTable('C054_cotacaoItem', {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
      comment: 'ID unico do item da cotacao',
    },
    tenantId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: 'ID do tenant ao qual o item pertence',
    },
    cotacaoId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: 'ID da cotacao',
      references: {
        model: 'C053_cotacao',
        key: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE',
    },
    itemPedidoCompraId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: 'ID do item do pedido de compra',
      references: {
        model: 'C048_itemPedidoCompra',
        key: 'id_item_ped',
      },
      onUpdate: 'CASCADE',
      onDelete: 'RESTRICT',
    },
    produtoId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: 'ID do produto',
      references: {
        model: 'C008_produto',
        key: 'id_prod',
      },
      onUpdate: 'CASCADE',
      onDelete: 'RESTRICT',
    },
    descricao: {
      type: DataTypes.STRING(120),
      allowNull: false,
      comment: 'Descricao do produto na cotacao',
    },
    quantidade: {
      type: DataTypes.DECIMAL(15, 4),
      allowNull: false,
      comment: 'Quantidade cotada',
    },
    vl_unitario: {
      type: DataTypes.DECIMAL(15, 4),
      allowNull: false,
      comment: 'Valor unitario cotado',
    },
    vl_total: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: true,
      comment: 'Valor total do item (quantidade x vl_unitario)',
    },
    observacao: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: 'Observacao do item',
    },
    createdAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
      comment: 'Data de criacao',
    },
    updatedAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
      comment: 'Data de atualizacao',
    },
  })

  // Indice para tenantId
  await queryInterface.addIndex('C054_cotacaoItem', ['tenantId'], {
    name: 'idx_cotacaoItem_tenantId',
  })

  // Indice para cotacaoId
  await queryInterface.addIndex('C054_cotacaoItem', ['cotacaoId'], {
    name: 'idx_cotacaoItem_cotacaoId',
  })
}

export async function down(queryInterface: QueryInterface): Promise<void> {
  await queryInterface.dropTable('C054_cotacaoItem')
}
