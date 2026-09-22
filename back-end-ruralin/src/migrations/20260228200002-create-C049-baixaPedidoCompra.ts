import { QueryInterface, DataTypes, QueryTypes } from 'sequelize';

/**
 * Migration: Criar tabela C049_baixaPedidoCompra
 *
 * Esta migration cria a tabela C049_baixaPedidoCompra para registro de baixas
 * (recebimentos) de pedidos de compra vinculados a notas fiscais.
 */
export async function up(queryInterface: QueryInterface): Promise<void> {
  // Verificar se a tabela ja existe
  const tables = await queryInterface.sequelize.query(`
    SELECT TABLE_NAME
    FROM INFORMATION_SCHEMA.TABLES
    WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME = 'C049_baixaPedidoCompra';
  `, {
    type: QueryTypes.SELECT,
  }) as any[];

  const tableExists = tables && tables.length > 0;

  if (!tableExists) {
    await queryInterface.createTable('C049_baixaPedidoCompra', {
      id_baixa_ped: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        comment: 'ID unico da baixa de pedido de compra (auto-increment)',
      },
      tenantId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        comment: 'ID do tenant ao qual a baixa pertence',
      },
      empresaId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        comment: 'ID da empresa (pessoa)',
        references: {
          model: 'C001_PESSOA',
          key: 'id_pessoa',
        },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT',
      },
      notaFiscalId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        comment: 'ID da nota fiscal vinculada',
        references: {
          model: 'C045_notaFiscal',
          key: 'id_nf',
        },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT',
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
        onDelete: 'RESTRICT',
      },
      usuarioId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        comment: 'ID do usuario que realizou a baixa',
        references: {
          model: 'usuarios',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT',
      },
      status: {
        type: DataTypes.ENUM('pendente', 'processada', 'cancelada'),
        allowNull: false,
        defaultValue: 'pendente',
        comment: 'Status da baixa (pendente, processada, cancelada)',
      },
      data_baixa: {
        type: DataTypes.DATEONLY,
        allowNull: false,
        comment: 'Data da baixa/recebimento',
      },
      vl_total_baixa: {
        type: DataTypes.DECIMAL(15, 2),
        allowNull: false,
        defaultValue: 0,
        comment: 'Valor total da baixa',
      },
      vl_divergencia: {
        type: DataTypes.DECIMAL(15, 2),
        allowNull: false,
        defaultValue: 0,
        comment: 'Valor da divergencia entre pedido e NF',
      },
      percentual_divergencia: {
        type: DataTypes.DECIMAL(5, 2),
        allowNull: false,
        defaultValue: 0,
        comment: 'Percentual de divergencia entre pedido e NF',
      },
      estoque_movimentado: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
        comment: 'Indica se o estoque ja foi movimentado',
      },
      financeiro_gerado: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
        comment: 'Indica se o financeiro ja foi gerado',
      },
      xml_importado: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
        comment: 'Indica se a baixa foi originada de importacao de XML',
      },
      observacoes: {
        type: DataTypes.TEXT,
        allowNull: true,
        comment: 'Observacoes gerais sobre a baixa',
      },
      motivo_cancelamento: {
        type: DataTypes.TEXT,
        allowNull: true,
        comment: 'Motivo do cancelamento da baixa',
      },
      data_cancelamento: {
        type: DataTypes.DATEONLY,
        allowNull: true,
        comment: 'Data do cancelamento da baixa',
      },
      ativo: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true,
        comment: 'Soft delete - indica se o registro esta ativo',
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
    await queryInterface.addIndex('C049_baixaPedidoCompra', ['tenantId'], {
      name: 'idx_baixaPed_tenantId',
    });

    await queryInterface.addIndex('C049_baixaPedidoCompra', ['empresaId'], {
      name: 'idx_baixaPed_empresaId',
    });

    await queryInterface.addIndex('C049_baixaPedidoCompra', ['notaFiscalId'], {
      name: 'idx_baixaPed_notaFiscalId',
    });

    await queryInterface.addIndex('C049_baixaPedidoCompra', ['pedidoCompraId'], {
      name: 'idx_baixaPed_pedidoCompraId',
    });

    await queryInterface.addIndex('C049_baixaPedidoCompra', ['usuarioId'], {
      name: 'idx_baixaPed_usuarioId',
    });

    await queryInterface.addIndex('C049_baixaPedidoCompra', ['status'], {
      name: 'idx_baixaPed_status',
    });

    await queryInterface.addIndex('C049_baixaPedidoCompra', ['data_baixa'], {
      name: 'idx_baixaPed_data_baixa',
    });

    await queryInterface.addIndex('C049_baixaPedidoCompra', ['ativo'], {
      name: 'idx_baixaPed_ativo',
    });

    await queryInterface.addIndex('C049_baixaPedidoCompra', ['usercreation'], {
      name: 'idx_baixaPed_usercreation',
    });

    await queryInterface.addIndex('C049_baixaPedidoCompra', ['notaFiscalId', 'pedidoCompraId', 'tenantId'], {
      unique: true,
      name: 'idx_baixaPed_nf_pedido_tenant',
    });
  }
}

export async function down(queryInterface: QueryInterface): Promise<void> {
  await queryInterface.dropTable('C049_baixaPedidoCompra');
}
