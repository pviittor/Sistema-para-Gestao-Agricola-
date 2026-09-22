import { QueryInterface, DataTypes, QueryTypes } from 'sequelize';

/**
 * Migration: Criar tabela C047_pedidoCompra
 *
 * Esta migration cria a tabela C047_pedidoCompra para cabecalho de pedidos de compra
 * de mercadorias/insumos.
 */
export async function up(queryInterface: QueryInterface): Promise<void> {
  // Verificar se a tabela ja existe
  const tables = await queryInterface.sequelize.query(`
    SELECT TABLE_NAME
    FROM INFORMATION_SCHEMA.TABLES
    WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME = 'C047_pedidoCompra';
  `, {
    type: QueryTypes.SELECT,
  }) as any[];

  const tableExists = tables && tables.length > 0;

  if (!tableExists) {
    await queryInterface.createTable('C047_pedidoCompra', {
      id_ped_compra: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        comment: 'ID unico do pedido de compra (auto-increment)',
      },
      tenantId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        comment: 'ID do tenant ao qual o pedido pertence',
      },
      numero: {
        type: DataTypes.STRING(20),
        allowNull: false,
        comment: 'Numero do pedido de compra',
      },
      empresaId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        comment: 'ID da empresa compradora',
        references: {
          model: 'C001_PESSOA',
          key: 'id_pessoa',
        },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT',
      },
      fornecedorId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        comment: 'ID do fornecedor',
        references: {
          model: 'C001_PESSOA',
          key: 'id_pessoa',
        },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT',
      },
      compradorId: {
        type: DataTypes.INTEGER,
        allowNull: true,
        comment: 'ID do usuario comprador responsavel',
        references: {
          model: 'usuarios',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
      },
      status: {
        type: DataTypes.ENUM(
          'rascunho',
          'aguardando_aprovacao',
          'aprovado',
          'parcialmente_atendido',
          'atendido',
          'cancelado'
        ),
        allowNull: false,
        defaultValue: 'rascunho',
        comment: 'Status do pedido de compra',
      },
      data_emissao: {
        type: DataTypes.DATEONLY,
        allowNull: false,
        comment: 'Data de emissao do pedido',
      },
      data_previsao_entrega: {
        type: DataTypes.DATEONLY,
        allowNull: true,
        comment: 'Data prevista para entrega',
      },
      data_aprovacao: {
        type: DataTypes.DATEONLY,
        allowNull: true,
        comment: 'Data de aprovacao do pedido',
      },
      aprovadoPorId: {
        type: DataTypes.INTEGER,
        allowNull: true,
        comment: 'ID do usuario que aprovou o pedido',
        references: {
          model: 'usuarios',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
      },
      condicaoPagamentoId: {
        type: DataTypes.INTEGER,
        allowNull: true,
        comment: 'ID da condicao de pagamento',
        // TODO: Adicionar FK quando CondicaoPagamento for implementado
      },
      forma_pagamento: {
        type: DataTypes.STRING(30),
        allowNull: true,
        comment: 'Forma de pagamento (boleto, transferencia, cheque, cartao, dinheiro, pix)',
      },
      prazo_pagamento_dias: {
        type: DataTypes.INTEGER,
        allowNull: true,
        comment: 'Prazo de pagamento em dias',
      },
      localEntregaId: {
        type: DataTypes.INTEGER,
        allowNull: true,
        comment: 'ID do local de entrega',
        // TODO: Adicionar FK quando Deposito for implementado
      },
      cfop: {
        type: DataTypes.STRING(4),
        allowNull: true,
        comment: 'Codigo Fiscal de Operacoes e Prestacoes',
      },
      vl_produtos: {
        type: DataTypes.DECIMAL(15, 2),
        allowNull: false,
        defaultValue: 0,
        comment: 'Valor total dos produtos (soma dos itens)',
      },
      vl_frete: {
        type: DataTypes.DECIMAL(15, 2),
        allowNull: false,
        defaultValue: 0,
        comment: 'Valor do frete',
      },
      vl_seguro: {
        type: DataTypes.DECIMAL(15, 2),
        allowNull: false,
        defaultValue: 0,
        comment: 'Valor do seguro',
      },
      vl_desconto: {
        type: DataTypes.DECIMAL(15, 2),
        allowNull: false,
        defaultValue: 0,
        comment: 'Valor do desconto',
      },
      vl_outros: {
        type: DataTypes.DECIMAL(15, 2),
        allowNull: false,
        defaultValue: 0,
        comment: 'Outras despesas acessorias',
      },
      vl_total: {
        type: DataTypes.DECIMAL(15, 2),
        allowNull: false,
        defaultValue: 0,
        comment: 'Valor total do pedido (calculado automaticamente)',
      },
      percentual_tolerancia: {
        type: DataTypes.DECIMAL(5, 2),
        allowNull: false,
        defaultValue: 0,
        comment: 'Percentual de tolerancia na entrega',
      },
      permite_entrega_parcial: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true,
        comment: 'Indica se permite entrega parcial dos itens',
      },
      observacoes: {
        type: DataTypes.TEXT,
        allowNull: true,
        comment: 'Observacoes internas do pedido',
      },
      observacoes_fornecedor: {
        type: DataTypes.TEXT,
        allowNull: true,
        comment: 'Observacoes para o fornecedor',
      },
      motivo_cancelamento: {
        type: DataTypes.TEXT,
        allowNull: true,
        comment: 'Motivo do cancelamento do pedido',
      },
      data_cancelamento: {
        type: DataTypes.DATEONLY,
        allowNull: true,
        comment: 'Data do cancelamento',
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
    await queryInterface.addIndex('C047_pedidoCompra', ['tenantId'], {
      name: 'idx_pedCompra_tenantId',
    });

    await queryInterface.addIndex('C047_pedidoCompra', ['empresaId'], {
      name: 'idx_pedCompra_empresaId',
    });

    await queryInterface.addIndex('C047_pedidoCompra', ['fornecedorId'], {
      name: 'idx_pedCompra_fornecedorId',
    });

    await queryInterface.addIndex('C047_pedidoCompra', ['compradorId'], {
      name: 'idx_pedCompra_compradorId',
    });

    await queryInterface.addIndex('C047_pedidoCompra', ['aprovadoPorId'], {
      name: 'idx_pedCompra_aprovadoPorId',
    });

    await queryInterface.addIndex('C047_pedidoCompra', ['status'], {
      name: 'idx_pedCompra_status',
    });

    await queryInterface.addIndex('C047_pedidoCompra', ['data_emissao'], {
      name: 'idx_pedCompra_data_emissao',
    });

    await queryInterface.addIndex('C047_pedidoCompra', ['ativo'], {
      name: 'idx_pedCompra_ativo',
    });

    await queryInterface.addIndex('C047_pedidoCompra', ['usercreation'], {
      name: 'idx_pedCompra_usercreation',
    });

    await queryInterface.addIndex('C047_pedidoCompra', ['numero', 'empresaId', 'tenantId'], {
      unique: true,
      name: 'idx_pedCompra_numero_empresa_tenant',
    });
  }
}

export async function down(queryInterface: QueryInterface): Promise<void> {
  await queryInterface.dropTable('C047_pedidoCompra');
}
