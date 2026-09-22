import { QueryInterface, DataTypes } from 'sequelize'

/**
 * Migration para criar tabela C053_cotacao
 *
 * Cotações de fornecedores vinculadas a pedidos de compra
 */
export async function up(queryInterface: QueryInterface): Promise<void> {
  await queryInterface.createTable('C053_cotacao', {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
      comment: 'ID unico da cotacao',
    },
    tenantId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: 'ID do tenant ao qual a cotacao pertence',
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
    fornecedorId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: 'ID do fornecedor (Pessoa)',
      references: {
        model: 'C001_PESSOA',
        key: 'id_pessoa',
      },
      onUpdate: 'CASCADE',
      onDelete: 'RESTRICT',
    },
    numero: {
      type: DataTypes.STRING(20),
      allowNull: false,
      comment: 'Numero da cotacao',
    },
    data_cotacao: {
      type: DataTypes.DATEONLY,
      allowNull: false,
      comment: 'Data da cotacao',
    },
    data_validade: {
      type: DataTypes.DATEONLY,
      allowNull: true,
      comment: 'Data de validade da cotacao',
    },
    prazo_entrega_dias: {
      type: DataTypes.INTEGER,
      allowNull: true,
      comment: 'Prazo de entrega em dias',
    },
    condicao_pagamento: {
      type: DataTypes.STRING(100),
      allowNull: true,
      comment: 'Condicao de pagamento (ex: 30/60/90)',
    },
    vl_total: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: false,
      defaultValue: 0,
      comment: 'Valor total da cotacao (soma dos itens)',
    },
    ranking_posicao: {
      type: DataTypes.INTEGER,
      allowNull: true,
      comment: 'Posicao no ranking (1=menor preco)',
    },
    status: {
      type: DataTypes.STRING(20),
      allowNull: false,
      defaultValue: 'pendente',
      comment: 'Status da cotacao (pendente, selecionada, rejeitada)',
    },
    observacoes: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: 'Observacoes da cotacao',
    },
    ativo: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
      comment: 'Soft delete - indica se o registro esta ativo',
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

  // Indice para tenantId (multi-tenancy)
  await queryInterface.addIndex('C053_cotacao', ['tenantId'], {
    name: 'idx_cotacao_tenantId',
  })

  // Indice composto UNIQUE (pedidoCompraId, fornecedorId, tenantId)
  await queryInterface.addIndex('C053_cotacao', ['pedidoCompraId', 'fornecedorId', 'tenantId'], {
    unique: true,
    name: 'idx_cotacao_pedido_fornecedor_tenant',
  })

  // Indice em status
  await queryInterface.addIndex('C053_cotacao', ['status'], {
    name: 'idx_cotacao_status',
  })
}

export async function down(queryInterface: QueryInterface): Promise<void> {
  await queryInterface.dropTable('C053_cotacao')
}
