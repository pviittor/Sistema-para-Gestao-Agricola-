import { QueryInterface, DataTypes, QueryTypes } from 'sequelize';

/**
 * Migration: Criar tabela C050_itemBaixaPedidoCompra
 *
 * Esta migration cria a tabela C050_itemBaixaPedidoCompra para itens da baixa
 * de pedido de compra, vinculando itens do pedido aos itens da nota fiscal.
 */
export async function up(queryInterface: QueryInterface): Promise<void> {
  // Verificar se a tabela ja existe
  const tables = await queryInterface.sequelize.query(`
    SELECT TABLE_NAME
    FROM INFORMATION_SCHEMA.TABLES
    WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME = 'C050_itemBaixaPedidoCompra';
  `, {
    type: QueryTypes.SELECT,
  }) as any[];

  const tableExists = tables && tables.length > 0;

  if (!tableExists) {
    await queryInterface.createTable('C050_itemBaixaPedidoCompra', {
      id_item_baixa_ped: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        comment: 'ID unico do item da baixa de pedido de compra (auto-increment)',
      },
      tenantId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        comment: 'ID do tenant ao qual o item da baixa pertence',
      },
      baixaPedidoCompraId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        comment: 'ID da baixa de pedido de compra',
        references: {
          model: 'C049_baixaPedidoCompra',
          key: 'id_baixa_ped',
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
      itemNotaFiscalId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        comment: 'ID do item da nota fiscal',
        references: {
          model: 'C046_itemNotaFiscal',
          key: 'id_item_nf',
        },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT',
      },
      quantidade: {
        type: DataTypes.DECIMAL(15, 4),
        allowNull: false,
        comment: 'Quantidade baixada',
      },
      vl_unitario_pedido: {
        type: DataTypes.DECIMAL(15, 10),
        allowNull: false,
        defaultValue: 0,
        comment: 'Valor unitario do pedido de compra',
      },
      vl_unitario_nf: {
        type: DataTypes.DECIMAL(15, 10),
        allowNull: false,
        defaultValue: 0,
        comment: 'Valor unitario da nota fiscal',
      },
      vl_divergencia: {
        type: DataTypes.DECIMAL(15, 2),
        allowNull: false,
        defaultValue: 0,
        comment: 'Valor da divergencia entre pedido e NF',
      },
      divergencia_aprovada: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
        comment: 'Indica se a divergencia foi aprovada',
      },
      usercreation: {
        type: DataTypes.INTEGER,
        allowNull: false,
        comment: 'ID do usuario que criou o registro',
        references: {
          model: 'usuarios',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT',
      },
      datecreation: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
        comment: 'Data de criacao do registro',
      },
    });

    // Criar indices
    await queryInterface.addIndex('C050_itemBaixaPedidoCompra', ['tenantId'], {
      name: 'idx_itemBaixaPed_tenantId',
    });

    await queryInterface.addIndex('C050_itemBaixaPedidoCompra', ['baixaPedidoCompraId'], {
      name: 'idx_itemBaixaPed_baixaPedidoCompraId',
    });

    await queryInterface.addIndex('C050_itemBaixaPedidoCompra', ['itemPedidoCompraId'], {
      name: 'idx_itemBaixaPed_itemPedidoCompraId',
    });

    await queryInterface.addIndex('C050_itemBaixaPedidoCompra', ['itemNotaFiscalId'], {
      name: 'idx_itemBaixaPed_itemNotaFiscalId',
    });

    await queryInterface.addIndex('C050_itemBaixaPedidoCompra', ['usercreation'], {
      name: 'idx_itemBaixaPed_usercreation',
    });
  }
}

export async function down(queryInterface: QueryInterface): Promise<void> {
  await queryInterface.dropTable('C050_itemBaixaPedidoCompra');
}
