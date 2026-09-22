import { QueryInterface, DataTypes, QueryTypes } from 'sequelize';

/**
 * Migration: Criar tabela C048_itemPedidoCompra
 *
 * Esta migration cria a tabela C048_itemPedidoCompra para registro de itens de pedidos de compra.
 */
export async function up(queryInterface: QueryInterface): Promise<void> {
  // Verificar se a tabela ja existe
  const tables = await queryInterface.sequelize.query(`
    SELECT TABLE_NAME
    FROM INFORMATION_SCHEMA.TABLES
    WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME = 'C048_itemPedidoCompra';
  `, {
    type: QueryTypes.SELECT,
  }) as any[];

  const tableExists = tables && tables.length > 0;

  if (!tableExists) {
    await queryInterface.createTable('C048_itemPedidoCompra', {
      id_item_ped: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        comment: 'ID unico do item do pedido de compra (auto-increment)',
      },
      tenantId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        comment: 'ID do tenant ao qual o item pertence',
      },
      pedidoCompraId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        comment: 'ID do pedido de compra',
        references: {
          model: 'C047_pedidoCompra',
          key: 'id_ped_compra',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      numero_item: {
        type: DataTypes.INTEGER,
        allowNull: false,
        comment: 'Numero sequencial do item dentro do pedido',
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
        comment: 'Descricao do produto no momento do pedido',
      },
      unidade: {
        type: DataTypes.STRING(6),
        allowNull: false,
        comment: 'Unidade de medida (UN, KG, CX, LT, etc)',
      },
      quantidade_solicitada: {
        type: DataTypes.DECIMAL(15, 4),
        allowNull: false,
        comment: 'Quantidade solicitada no pedido',
      },
      quantidade_atendida: {
        type: DataTypes.DECIMAL(15, 4),
        allowNull: false,
        defaultValue: 0,
        comment: 'Quantidade ja atendida/entregue',
      },
      quantidade_pendente: {
        type: DataTypes.DECIMAL(15, 4),
        allowNull: false,
        defaultValue: 0,
        comment: 'Quantidade pendente de entrega',
      },
      vl_unitario: {
        type: DataTypes.DECIMAL(15, 10),
        allowNull: false,
        comment: 'Valor unitario do item',
      },
      vl_desconto: {
        type: DataTypes.DECIMAL(15, 2),
        allowNull: false,
        defaultValue: 0,
        comment: 'Valor do desconto',
      },
      vl_bruto: {
        type: DataTypes.DECIMAL(15, 2),
        allowNull: false,
        defaultValue: 0,
        comment: 'Valor bruto (quantidade_solicitada x vl_unitario)',
      },
      vl_total: {
        type: DataTypes.DECIMAL(15, 2),
        allowNull: false,
        defaultValue: 0,
        comment: 'Valor total (vl_bruto - vl_desconto)',
      },
      status: {
        type: DataTypes.ENUM('pendente', 'parcialmente_atendido', 'atendido', 'cancelado'),
        allowNull: false,
        defaultValue: 'pendente',
        comment: 'Status do item do pedido',
      },
      depositoDestinoId: {
        type: DataTypes.INTEGER,
        allowNull: true,
        comment: 'ID do deposito de destino',
        // TODO: Adicionar FK quando Deposito for implementado
      },
      observacao: {
        type: DataTypes.TEXT,
        allowNull: true,
        comment: 'Observacao do item',
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
    await queryInterface.addIndex('C048_itemPedidoCompra', ['tenantId'], {
      name: 'idx_itemPedCompra_tenantId',
    });

    await queryInterface.addIndex('C048_itemPedidoCompra', ['pedidoCompraId'], {
      name: 'idx_itemPedCompra_pedidoCompraId',
    });

    await queryInterface.addIndex('C048_itemPedidoCompra', ['produtoId'], {
      name: 'idx_itemPedCompra_produtoId',
    });

    await queryInterface.addIndex('C048_itemPedidoCompra', ['status'], {
      name: 'idx_itemPedCompra_status',
    });

    await queryInterface.addIndex('C048_itemPedidoCompra', ['usercreation'], {
      name: 'idx_itemPedCompra_usercreation',
    });

    await queryInterface.addIndex('C048_itemPedidoCompra', ['pedidoCompraId', 'numero_item'], {
      unique: true,
      name: 'idx_itemPedCompra_pedido_numeroItem',
    });
  }
}

export async function down(queryInterface: QueryInterface): Promise<void> {
  await queryInterface.dropTable('C048_itemPedidoCompra');
}
