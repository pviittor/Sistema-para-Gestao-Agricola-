import { QueryInterface, DataTypes } from 'sequelize'

/**
 * Migration para adicionar campos de cotação e parcelamento ao PedidoCompra
 *
 * Prepara a tabela C047_pedidoCompra para o fluxo de cotação (Sprint 8)
 * e geração financeira com parcelamento.
 */
export async function up(queryInterface: QueryInterface): Promise<void> {
    await queryInterface.addColumn('C047_pedidoCompra', 'condicao_pagamento', {
      type: DataTypes.STRING(50),
      allowNull: true,
      comment: 'Condição de pagamento (à vista, 30, 30/60, 30/60/90, etc.)',
    })

    await queryInterface.addColumn('C047_pedidoCompra', 'parcelas_qtd', {
      type: DataTypes.INTEGER,
      allowNull: true,
      comment: 'Quantidade de parcelas para geração financeira',
    })

    await queryInterface.addColumn('C047_pedidoCompra', 'cotacao_vencedora_id', {
      type: DataTypes.INTEGER,
      allowNull: true,
      comment: 'FK para cotação vencedora (C053 — será criada no Sprint 8, sem constraint por enquanto)',
    })
}

export async function down(queryInterface: QueryInterface): Promise<void> {
  await queryInterface.removeColumn('C047_pedidoCompra', 'cotacao_vencedora_id')
  await queryInterface.removeColumn('C047_pedidoCompra', 'parcelas_qtd')
  await queryInterface.removeColumn('C047_pedidoCompra', 'condicao_pagamento')
}
