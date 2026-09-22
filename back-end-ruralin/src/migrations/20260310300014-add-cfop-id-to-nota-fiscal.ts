import { QueryInterface, DataTypes } from 'sequelize'

/**
 * Migration para adicionar FK cfopId na NotaFiscal e ItemNotaFiscal
 *
 * Vincula NF e seus itens à entidade CFOP (C051).
 * Mantém campo cfop string existente para retrocompatibilidade.
 */
export async function up(queryInterface: QueryInterface): Promise<void> {
    // FK cfopId na tabela NotaFiscal
    await queryInterface.addColumn('C045_notaFiscal', 'cfopId', {
      type: DataTypes.INTEGER,
      allowNull: true,
      comment: 'FK para entidade CFOP (C051_cfop)',
      references: {
        model: 'C051_cfop',
        key: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL',
    })

    // FK cfopId na tabela ItemNotaFiscal
    await queryInterface.addColumn('C046_itemNotaFiscal', 'cfopId', {
      type: DataTypes.INTEGER,
      allowNull: true,
      comment: 'FK para entidade CFOP (C051_cfop)',
      references: {
        model: 'C051_cfop',
        key: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL',
    })

    await queryInterface.addIndex('C045_notaFiscal', ['cfopId'], {
      name: 'idx_nf_cfopId',
    })

    await queryInterface.addIndex('C046_itemNotaFiscal', ['cfopId'], {
      name: 'idx_itemNf_cfopId',
    })
}

export async function down(queryInterface: QueryInterface): Promise<void> {
  await queryInterface.removeIndex('C046_itemNotaFiscal', 'idx_itemNf_cfopId')
  await queryInterface.removeIndex('C045_notaFiscal', 'idx_nf_cfopId')
  await queryInterface.removeColumn('C046_itemNotaFiscal', 'cfopId')
  await queryInterface.removeColumn('C045_notaFiscal', 'cfopId')
}
