import { QueryInterface, DataTypes } from 'sequelize'

/**
 * Migration para adicionar campos SEFAZ, contingência e parcelamento à NotaFiscal
 *
 * Prepara a tabela C045_notaFiscal para integração com SEFAZ (Sprint 9).
 */
export async function up(queryInterface: QueryInterface): Promise<void> {
    await queryInterface.addColumn('C045_notaFiscal', 'certificadoDigitalId', {
      type: DataTypes.INTEGER,
      allowNull: true,
      comment: 'FK para certificado digital A1 usado na emissão',
      references: {
        model: 'C052_certificadoDigital',
        key: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL',
    })

    await queryInterface.addColumn('C045_notaFiscal', 'ambiente_sefaz', {
      type: DataTypes.STRING(15),
      allowNull: true,
      comment: 'Ambiente SEFAZ: homologacao, producao',
    })

    await queryInterface.addColumn('C045_notaFiscal', 'contingencia_tipo', {
      type: DataTypes.STRING(20),
      allowNull: true,
      comment: 'Tipo de contingência: SCAN, SVC-AN, SVC-RS',
    })

    await queryInterface.addColumn('C045_notaFiscal', 'contingencia_justificativa', {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: 'Justificativa para entrada em contingência',
    })

    await queryInterface.addColumn('C045_notaFiscal', 'contingencia_data_inicio', {
      type: DataTypes.DATE,
      allowNull: true,
      comment: 'Data/hora de início da contingência',
    })

    await queryInterface.addColumn('C045_notaFiscal', 'numero_sequencial', {
      type: DataTypes.INTEGER,
      allowNull: true,
      comment: 'Número sequencial de controle por série/tenant',
    })

    await queryInterface.addColumn('C045_notaFiscal', 'condicao_pagamento', {
      type: DataTypes.STRING(50),
      allowNull: true,
      comment: 'Condição de pagamento (à vista, 30, 30/60, 30/60/90, etc.)',
    })

    await queryInterface.addColumn('C045_notaFiscal', 'parcelas_qtd', {
      type: DataTypes.INTEGER,
      allowNull: true,
      comment: 'Quantidade de parcelas para geração financeira',
    })

    await queryInterface.addIndex('C045_notaFiscal', ['certificadoDigitalId'], {
      name: 'idx_nf_certificadoDigitalId',
    })
}

export async function down(queryInterface: QueryInterface): Promise<void> {
  await queryInterface.removeIndex('C045_notaFiscal', 'idx_nf_certificadoDigitalId')
  await queryInterface.removeColumn('C045_notaFiscal', 'parcelas_qtd')
  await queryInterface.removeColumn('C045_notaFiscal', 'condicao_pagamento')
  await queryInterface.removeColumn('C045_notaFiscal', 'numero_sequencial')
  await queryInterface.removeColumn('C045_notaFiscal', 'contingencia_data_inicio')
  await queryInterface.removeColumn('C045_notaFiscal', 'contingencia_justificativa')
  await queryInterface.removeColumn('C045_notaFiscal', 'contingencia_tipo')
  await queryInterface.removeColumn('C045_notaFiscal', 'ambiente_sefaz')
  await queryInterface.removeColumn('C045_notaFiscal', 'certificadoDigitalId')
}
