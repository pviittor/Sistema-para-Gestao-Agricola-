import { QueryInterface, DataTypes } from 'sequelize'

export async function up(queryInterface: QueryInterface) {
    await queryInterface.addColumn('emprestimos', 'prazo_dias', {
      type: DataTypes.INTEGER,
      allowNull: true,
      comment: 'Prazo em dias para devolução',
    })

    await queryInterface.addColumn('emprestimos', 'data_limite_devolucao', {
      type: DataTypes.DATEONLY,
      allowNull: true,
      comment: 'data_emp + prazo_dias, calculado pelo service',
    })

    await queryInterface.addColumn('emprestimos', 'multa_percentual', {
      type: DataTypes.DECIMAL(5, 2),
      allowNull: true,
      comment: '% de multa sobre valor total',
    })

    await queryInterface.addColumn('emprestimos', 'juros_diario_percentual', {
      type: DataTypes.DECIMAL(5, 4),
      allowNull: true,
      comment: '% de juros ao dia sobre valor total',
    })

    await queryInterface.addColumn('emprestimos', 'financeiro_gerado', {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
      comment: 'Se já gerou título financeiro de cobrança',
    })

    await queryInterface.addColumn('emprestimos', 'valor_custo_medio_total', {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: true,
      comment: 'Soma dos total_empi dos itens — custo total do empréstimo',
    })
}

export async function down(queryInterface: QueryInterface) {
  await queryInterface.removeColumn('emprestimos', 'valor_custo_medio_total')
  await queryInterface.removeColumn('emprestimos', 'financeiro_gerado')
  await queryInterface.removeColumn('emprestimos', 'juros_diario_percentual')
  await queryInterface.removeColumn('emprestimos', 'multa_percentual')
  await queryInterface.removeColumn('emprestimos', 'data_limite_devolucao')
  await queryInterface.removeColumn('emprestimos', 'prazo_dias')
}
