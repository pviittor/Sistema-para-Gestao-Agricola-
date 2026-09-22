import { QueryInterface, DataTypes } from 'sequelize';

/**
 * Migration 1 — Extensão de C019_tituloPagar e C023_tituloReceber
 * Adiciona campos de parcelamento, recorrência e rastreabilidade por talhão
 */
export async function up(queryInterface: QueryInterface): Promise<void> {
    // === C019_tituloPagar ===
    await queryInterface.addColumn('C019_tituloPagar', 'tipoGeracao', {
      type: DataTypes.ENUM('MANUAL', 'PARCELADO', 'RECORRENTE'),
      allowNull: false,
      defaultValue: 'MANUAL',
      comment: 'Origem do lançamento',
    });
    await queryInterface.addColumn('C019_tituloPagar', 'recorrenciaFinanceiraId', {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: null,
      comment: 'FK para recorrencia_financeira.id (constraint adicionada em migration posterior)',
    });
    await queryInterface.addColumn('C019_tituloPagar', 'taxaJurosAm', {
      type: DataTypes.DECIMAL(5, 4),
      allowNull: true,
      defaultValue: null,
      comment: 'Taxa de juros ao mês (ex: 0.015 = 1,5%)',
    });
    await queryInterface.addColumn('C019_tituloPagar', 'indiceCorrecao', {
      type: DataTypes.ENUM('NENHUM', 'IPCA', 'IGPM', 'FIXO'),
      allowNull: false,
      defaultValue: 'NENHUM',
      comment: 'Índice de correção monetária',
    });
    await queryInterface.addColumn('C019_tituloPagar', 'taxaCorrecaoFixaAm', {
      type: DataTypes.DECIMAL(5, 4),
      allowNull: true,
      defaultValue: null,
      comment: 'Taxa fixa ao mês quando indiceCorrecao = FIXO',
    });
    await queryInterface.addColumn('C019_tituloPagar', 'taxaMulta', {
      type: DataTypes.DECIMAL(5, 4),
      allowNull: true,
      defaultValue: null,
      comment: 'Taxa de multa por atraso (ex: 0.02 = 2%)',
    });
    await queryInterface.addColumn('C019_tituloPagar', 'intervaloParcelasDias', {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: 30,
      comment: 'Intervalo em dias entre parcelas',
    });
    await queryInterface.addColumn('C019_tituloPagar', 'dataPrimeiraParcela', {
      type: DataTypes.DATEONLY,
      allowNull: true,
      defaultValue: null,
      comment: 'Data de vencimento da primeira parcela',
    });
    await queryInterface.addColumn('C019_tituloPagar', 'modeloJuros', {
      type: DataTypes.ENUM('SIMPLES', 'PRICE'),
      allowNull: false,
      defaultValue: 'SIMPLES',
      comment: 'Modelo de juros: SIMPLES ou PRICE (Tabela Price)',
    });
    await queryInterface.addColumn('C019_tituloPagar', 'idTalhao', {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: null,
      comment: 'FK para talhão (rastreabilidade)',
      references: {
        model: 'C002_talhao',
        key: 'id_talhao',
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL',
    });

    // === C023_tituloReceber ===
    await queryInterface.addColumn('C023_tituloReceber', 'tipoGeracao', {
      type: DataTypes.ENUM('MANUAL', 'PARCELADO', 'RECORRENTE'),
      allowNull: false,
      defaultValue: 'MANUAL',
      comment: 'Origem do lançamento',
    });
    await queryInterface.addColumn('C023_tituloReceber', 'recorrenciaFinanceiraId', {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: null,
      comment: 'FK para recorrencia_financeira.id (constraint adicionada em migration posterior)',
    });
    await queryInterface.addColumn('C023_tituloReceber', 'taxaJurosAm', {
      type: DataTypes.DECIMAL(5, 4),
      allowNull: true,
      defaultValue: null,
      comment: 'Taxa de juros ao mês (ex: 0.015 = 1,5%)',
    });
    await queryInterface.addColumn('C023_tituloReceber', 'indiceCorrecao', {
      type: DataTypes.ENUM('NENHUM', 'IPCA', 'IGPM', 'FIXO'),
      allowNull: false,
      defaultValue: 'NENHUM',
      comment: 'Índice de correção monetária',
    });
    await queryInterface.addColumn('C023_tituloReceber', 'taxaCorrecaoFixaAm', {
      type: DataTypes.DECIMAL(5, 4),
      allowNull: true,
      defaultValue: null,
      comment: 'Taxa fixa ao mês quando indiceCorrecao = FIXO',
    });
    await queryInterface.addColumn('C023_tituloReceber', 'taxaMulta', {
      type: DataTypes.DECIMAL(5, 4),
      allowNull: true,
      defaultValue: null,
      comment: 'Taxa de multa por atraso (ex: 0.02 = 2%)',
    });
    await queryInterface.addColumn('C023_tituloReceber', 'intervaloParcelasDias', {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: 30,
      comment: 'Intervalo em dias entre parcelas',
    });
    await queryInterface.addColumn('C023_tituloReceber', 'dataPrimeiraParcela', {
      type: DataTypes.DATEONLY,
      allowNull: true,
      defaultValue: null,
      comment: 'Data de vencimento da primeira parcela',
    });
    await queryInterface.addColumn('C023_tituloReceber', 'modeloJuros', {
      type: DataTypes.ENUM('SIMPLES', 'PRICE'),
      allowNull: false,
      defaultValue: 'SIMPLES',
      comment: 'Modelo de juros: SIMPLES ou PRICE (Tabela Price)',
    });
    await queryInterface.addColumn('C023_tituloReceber', 'idTalhao', {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: null,
      comment: 'FK para talhão (rastreabilidade)',
      references: {
        model: 'C002_talhao',
        key: 'id_talhao',
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL',
    });

    // Índices
    await queryInterface.addIndex('C019_tituloPagar', ['tipoGeracao'], { name: 'idx_tituloPagar_tipoGeracao' });
    await queryInterface.addIndex('C019_tituloPagar', ['recorrenciaFinanceiraId'], { name: 'idx_tituloPagar_recorrenciaId' });
    await queryInterface.addIndex('C019_tituloPagar', ['idTalhao'], { name: 'idx_tituloPagar_idTalhao' });
    await queryInterface.addIndex('C023_tituloReceber', ['tipoGeracao'], { name: 'idx_tituloReceber_tipoGeracao' });
    await queryInterface.addIndex('C023_tituloReceber', ['recorrenciaFinanceiraId'], { name: 'idx_tituloReceber_recorrenciaId' });
    await queryInterface.addIndex('C023_tituloReceber', ['idTalhao'], { name: 'idx_tituloReceber_idTalhao' });
}

export async function down(queryInterface: QueryInterface): Promise<void> {
    // Remove indexes
    await queryInterface.removeIndex('C023_tituloReceber', 'idx_tituloReceber_idTalhao');
    await queryInterface.removeIndex('C023_tituloReceber', 'idx_tituloReceber_recorrenciaId');
    await queryInterface.removeIndex('C023_tituloReceber', 'idx_tituloReceber_tipoGeracao');
    await queryInterface.removeIndex('C019_tituloPagar', 'idx_tituloPagar_idTalhao');
    await queryInterface.removeIndex('C019_tituloPagar', 'idx_tituloPagar_recorrenciaId');
    await queryInterface.removeIndex('C019_tituloPagar', 'idx_tituloPagar_tipoGeracao');

    // Remove columns from C023
    const c023Cols = ['tipoGeracao', 'recorrenciaFinanceiraId', 'taxaJurosAm', 'indiceCorrecao', 'taxaCorrecaoFixaAm', 'taxaMulta', 'intervaloParcelasDias', 'dataPrimeiraParcela', 'modeloJuros', 'idTalhao'];
    for (const col of c023Cols) {
      await queryInterface.removeColumn('C023_tituloReceber', col);
    }

    // Remove columns from C019
    const c019Cols = ['tipoGeracao', 'recorrenciaFinanceiraId', 'taxaJurosAm', 'indiceCorrecao', 'taxaCorrecaoFixaAm', 'taxaMulta', 'intervaloParcelasDias', 'dataPrimeiraParcela', 'modeloJuros', 'idTalhao'];
    for (const col of c019Cols) {
      await queryInterface.removeColumn('C019_tituloPagar', col);
    }
}
