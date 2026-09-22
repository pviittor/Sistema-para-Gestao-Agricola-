import { QueryInterface, DataTypes } from 'sequelize';

/**
 * Migration 3 — Extensão de C027_movimentoFinanceiroTituloPagar e C028_movimentoFinanceiroTituloReceber
 * Adiciona id_conta (opcional) e tipo_movimento
 */
export async function up(queryInterface: QueryInterface): Promise<void> {
    // === C027_movimentoFinanceiroTituloPagar ===
    await queryInterface.addColumn('C027_movimentoFinanceiroTituloPagar', 'idConta', {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: null,
      comment: 'FK para conta bancária/caixa do pagamento',
      references: {
        model: 'contas',
        key: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL',
    });
    await queryInterface.addColumn('C027_movimentoFinanceiroTituloPagar', 'tipoMovimento', {
      type: DataTypes.ENUM('BAIXA_TOTAL', 'BAIXA_PARCIAL'),
      allowNull: false,
      defaultValue: 'BAIXA_TOTAL',
      comment: 'Indica se foi uma baixa total ou parcial da parcela',
    });

    // === C028_movimentoFinanceiroTituloReceber ===
    await queryInterface.addColumn('C028_movimentoFinanceiroTituloReceber', 'idConta', {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: null,
      comment: 'FK para conta bancária/caixa do recebimento',
      references: {
        model: 'contas',
        key: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL',
    });
    await queryInterface.addColumn('C028_movimentoFinanceiroTituloReceber', 'tipoMovimento', {
      type: DataTypes.ENUM('BAIXA_TOTAL', 'BAIXA_PARCIAL'),
      allowNull: false,
      defaultValue: 'BAIXA_TOTAL',
      comment: 'Indica se foi uma baixa total ou parcial da parcela',
    });

    // Índices
    await queryInterface.addIndex('C027_movimentoFinanceiroTituloPagar', ['idConta'], { name: 'idx_movPagar_idConta' });
    await queryInterface.addIndex('C028_movimentoFinanceiroTituloReceber', ['idConta'], { name: 'idx_movReceber_idConta' });
}

export async function down(queryInterface: QueryInterface): Promise<void> {
    await queryInterface.removeIndex('C028_movimentoFinanceiroTituloReceber', 'idx_movReceber_idConta');
    await queryInterface.removeIndex('C027_movimentoFinanceiroTituloPagar', 'idx_movPagar_idConta');

    await queryInterface.removeColumn('C028_movimentoFinanceiroTituloReceber', 'tipoMovimento');
    await queryInterface.removeColumn('C028_movimentoFinanceiroTituloReceber', 'idConta');
    await queryInterface.removeColumn('C027_movimentoFinanceiroTituloPagar', 'tipoMovimento');
    await queryInterface.removeColumn('C027_movimentoFinanceiroTituloPagar', 'idConta');
}
