import { QueryInterface, DataTypes } from 'sequelize';

/**
 * Migration: Adiciona coluna idOrdemServicoInsumo à tabela C032_movimentoEstoque
 *
 * Permite vincular movimentos de estoque a insumos de ordens de serviço.
 */

export async function up(queryInterface: QueryInterface): Promise<void> {
  await queryInterface.addColumn('C032_movimentoEstoque', 'idOrdemServicoInsumo', {
    type: DataTypes.INTEGER,
    allowNull: true,
    comment: 'ID do insumo de ordem de serviço relacionado',
    references: {
      model: 'C070_ordemServicoInsumo',
      key: 'id',
    },
    onUpdate: 'CASCADE',
    onDelete: 'SET NULL',
  });

  await queryInterface.addIndex('C032_movimentoEstoque', ['idOrdemServicoInsumo'], {
    name: 'idx_movEstoque_idOrdemServicoInsumo',
  });
}

export async function down(queryInterface: QueryInterface): Promise<void> {
  await queryInterface.removeIndex('C032_movimentoEstoque', 'idx_movEstoque_idOrdemServicoInsumo');
  await queryInterface.removeColumn('C032_movimentoEstoque', 'idOrdemServicoInsumo');
}
