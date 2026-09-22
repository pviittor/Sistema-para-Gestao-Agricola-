import { QueryInterface, DataTypes } from 'sequelize'

/**
 * Migration para adicionar campos de rastreabilidade de origem em TituloPagar
 *
 * Campos polimórficos para vincular título financeiro ao documento de origem.
 * Valores de origem_tipo: nota_fiscal_entrada, nota_fiscal_saida, pedido_compra, emprestimo, manual
 */
export async function up(queryInterface: QueryInterface): Promise<void> {
    await queryInterface.addColumn('C019_tituloPagar', 'origem_tipo', {
      type: DataTypes.STRING(50),
      allowNull: true,
      comment: 'Tipo do documento de origem: nota_fiscal_entrada, nota_fiscal_saida, pedido_compra, emprestimo, manual',
    })

    await queryInterface.addColumn('C019_tituloPagar', 'origem_id', {
      type: DataTypes.INTEGER,
      allowNull: true,
      comment: 'ID do documento de origem (polimórfico)',
    })

    await queryInterface.addIndex('C019_tituloPagar', ['origem_tipo', 'origem_id'], {
      name: 'idx_tituloPagar_origem',
    })
}

export async function down(queryInterface: QueryInterface): Promise<void> {
  await queryInterface.removeIndex('C019_tituloPagar', 'idx_tituloPagar_origem')
  await queryInterface.removeColumn('C019_tituloPagar', 'origem_id')
  await queryInterface.removeColumn('C019_tituloPagar', 'origem_tipo')
}
