import { QueryInterface, DataTypes } from 'sequelize'

/**
 * Migration para adicionar campos de rastreabilidade de origem em TituloReceber
 *
 * Campos polimórficos para vincular título financeiro ao documento de origem.
 * Valores de origem_tipo: nota_fiscal_entrada, nota_fiscal_saida, pedido_compra, emprestimo, manual
 */
export async function up(queryInterface: QueryInterface): Promise<void> {
    await queryInterface.addColumn('C023_tituloReceber', 'origem_tipo', {
      type: DataTypes.STRING(50),
      allowNull: true,
      comment: 'Tipo do documento de origem: nota_fiscal_entrada, nota_fiscal_saida, pedido_compra, emprestimo, manual',
    })

    await queryInterface.addColumn('C023_tituloReceber', 'origem_id', {
      type: DataTypes.INTEGER,
      allowNull: true,
      comment: 'ID do documento de origem (polimórfico)',
    })

    await queryInterface.addIndex('C023_tituloReceber', ['origem_tipo', 'origem_id'], {
      name: 'idx_tituloReceber_origem',
    })
}

export async function down(queryInterface: QueryInterface): Promise<void> {
  await queryInterface.removeIndex('C023_tituloReceber', 'idx_tituloReceber_origem')
  await queryInterface.removeColumn('C023_tituloReceber', 'origem_id')
  await queryInterface.removeColumn('C023_tituloReceber', 'origem_tipo')
}
