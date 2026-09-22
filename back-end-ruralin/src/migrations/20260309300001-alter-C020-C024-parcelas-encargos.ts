import { QueryInterface, DataTypes } from 'sequelize';

/**
 * Migration 2 — Extensão de C020_parcelaTituloPagar e C024_parcelaTituloReceber
 * Adiciona campos de encargos, baixa parcial, conta e status PARCIAL
 */
export async function up(queryInterface: QueryInterface): Promise<void> {
    // === C020_parcelaTituloPagar ===
    // Alterar ENUM status para incluir PARCIAL
    await queryInterface.changeColumn('C020_parcelaTituloPagar', 'status', {
      type: DataTypes.ENUM('ABERTA', 'PARCIAL', 'BAIXADA', 'CANCELADA'),
      allowNull: false,
      defaultValue: 'ABERTA',
      comment: 'Status da parcela (ABERTA, PARCIAL, BAIXADA, CANCELADA)',
    });

    await queryInterface.addColumn('C020_parcelaTituloPagar', 'taxaJuros', {
      type: DataTypes.DECIMAL(5, 4),
      allowNull: true,
      defaultValue: 0,
      comment: 'Taxa de juros aplicada nesta parcela',
    });
    await queryInterface.addColumn('C020_parcelaTituloPagar', 'valorJuros', {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: false,
      defaultValue: 0.00,
      comment: 'Valor monetário de juros',
    });
    await queryInterface.addColumn('C020_parcelaTituloPagar', 'valorCorrecao', {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: false,
      defaultValue: 0.00,
      comment: 'Valor de correção monetária',
    });
    await queryInterface.addColumn('C020_parcelaTituloPagar', 'taxaMulta', {
      type: DataTypes.DECIMAL(5, 4),
      allowNull: true,
      defaultValue: 0,
      comment: 'Taxa de multa por atraso',
    });
    await queryInterface.addColumn('C020_parcelaTituloPagar', 'valorMulta', {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: false,
      defaultValue: 0.00,
      comment: 'Valor monetário de multa',
    });
    await queryInterface.addColumn('C020_parcelaTituloPagar', 'valorDesconto', {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: false,
      defaultValue: 0.00,
      comment: 'Desconto concedido no momento da baixa',
    });
    await queryInterface.addColumn('C020_parcelaTituloPagar', 'valorTotal', {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: false,
      defaultValue: 0.00,
      comment: 'valorParcela + valorJuros + valorCorrecao + valorMulta - valorDesconto',
    });
    await queryInterface.addColumn('C020_parcelaTituloPagar', 'valorPago', {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: false,
      defaultValue: 0.00,
      comment: 'Total já pago (acumulado de MovimentoFinanceiro)',
    });
    await queryInterface.addColumn('C020_parcelaTituloPagar', 'valorSaldo', {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: false,
      defaultValue: 0.00,
      comment: 'valorTotal - valorPago',
    });
    await queryInterface.addColumn('C020_parcelaTituloPagar', 'idConta', {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: null,
      comment: 'FK para conta bancária/caixa utilizada na baixa',
      references: {
        model: 'contas',
        key: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL',
    });
    await queryInterface.addColumn('C020_parcelaTituloPagar', 'numeroTotalParcelas', {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 1,
      comment: 'Total de parcelas do título pai',
    });

    // === C024_parcelaTituloReceber ===
    await queryInterface.changeColumn('C024_parcelaTituloReceber', 'status', {
      type: DataTypes.ENUM('ABERTA', 'PARCIAL', 'BAIXADA', 'CANCELADA'),
      allowNull: false,
      defaultValue: 'ABERTA',
      comment: 'Status da parcela (ABERTA, PARCIAL, BAIXADA, CANCELADA)',
    });

    await queryInterface.addColumn('C024_parcelaTituloReceber', 'taxaJuros', {
      type: DataTypes.DECIMAL(5, 4),
      allowNull: true,
      defaultValue: 0,
      comment: 'Taxa de juros aplicada nesta parcela',
    });
    await queryInterface.addColumn('C024_parcelaTituloReceber', 'valorJuros', {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: false,
      defaultValue: 0.00,
      comment: 'Valor monetário de juros',
    });
    await queryInterface.addColumn('C024_parcelaTituloReceber', 'valorCorrecao', {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: false,
      defaultValue: 0.00,
      comment: 'Valor de correção monetária',
    });
    await queryInterface.addColumn('C024_parcelaTituloReceber', 'taxaMulta', {
      type: DataTypes.DECIMAL(5, 4),
      allowNull: true,
      defaultValue: 0,
      comment: 'Taxa de multa por atraso',
    });
    await queryInterface.addColumn('C024_parcelaTituloReceber', 'valorMulta', {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: false,
      defaultValue: 0.00,
      comment: 'Valor monetário de multa',
    });
    await queryInterface.addColumn('C024_parcelaTituloReceber', 'valorDesconto', {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: false,
      defaultValue: 0.00,
      comment: 'Desconto concedido no momento da baixa',
    });
    await queryInterface.addColumn('C024_parcelaTituloReceber', 'valorTotal', {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: false,
      defaultValue: 0.00,
      comment: 'valorParcela + valorJuros + valorCorrecao + valorMulta - valorDesconto',
    });
    await queryInterface.addColumn('C024_parcelaTituloReceber', 'valorPago', {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: false,
      defaultValue: 0.00,
      comment: 'Total já pago (acumulado de MovimentoFinanceiro)',
    });
    await queryInterface.addColumn('C024_parcelaTituloReceber', 'valorSaldo', {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: false,
      defaultValue: 0.00,
      comment: 'valorTotal - valorPago',
    });
    await queryInterface.addColumn('C024_parcelaTituloReceber', 'idConta', {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: null,
      comment: 'FK para conta bancária/caixa utilizada na baixa',
      references: {
        model: 'contas',
        key: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL',
    });
    await queryInterface.addColumn('C024_parcelaTituloReceber', 'numeroTotalParcelas', {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 1,
      comment: 'Total de parcelas do título pai',
    });

    // Índices para aging
    await queryInterface.addIndex('C020_parcelaTituloPagar', ['tenantId', 'status', 'dataVencimento'], { name: 'idx_parcelaPagar_aging' });
    await queryInterface.addIndex('C020_parcelaTituloPagar', ['idConta'], { name: 'idx_parcelaPagar_idConta' });
    await queryInterface.addIndex('C024_parcelaTituloReceber', ['tenantId', 'status', 'dataVencimento'], { name: 'idx_parcelaReceber_aging' });
    await queryInterface.addIndex('C024_parcelaTituloReceber', ['idConta'], { name: 'idx_parcelaReceber_idConta' });
}

export async function down(queryInterface: QueryInterface): Promise<void> {
    await queryInterface.removeIndex('C024_parcelaTituloReceber', 'idx_parcelaReceber_idConta');
    await queryInterface.removeIndex('C024_parcelaTituloReceber', 'idx_parcelaReceber_aging');
    await queryInterface.removeIndex('C020_parcelaTituloPagar', 'idx_parcelaPagar_idConta');
    await queryInterface.removeIndex('C020_parcelaTituloPagar', 'idx_parcelaPagar_aging');

    const cols = ['taxaJuros', 'valorJuros', 'valorCorrecao', 'taxaMulta', 'valorMulta', 'valorDesconto', 'valorTotal', 'valorPago', 'valorSaldo', 'idConta', 'numeroTotalParcelas'];
    for (const col of cols) {
      await queryInterface.removeColumn('C024_parcelaTituloReceber', col);
      await queryInterface.removeColumn('C020_parcelaTituloPagar', col);
    }

    await queryInterface.changeColumn('C024_parcelaTituloReceber', 'status', {
      type: DataTypes.ENUM('ABERTA', 'BAIXADA', 'CANCELADA'),
      allowNull: false,
      defaultValue: 'ABERTA',
    });
    await queryInterface.changeColumn('C020_parcelaTituloPagar', 'status', {
      type: DataTypes.ENUM('ABERTA', 'BAIXADA', 'CANCELADA'),
      allowNull: false,
      defaultValue: 'ABERTA',
    });
}
