import { QueryInterface, DataTypes } from 'sequelize';

/**
 * Migration: Adicionar coluna notaFiscalId as tabelas C019_tituloPagar e C023_tituloReceber
 *
 * Adiciona FK para vincular titulos a pagar e receber a notas fiscais.
 */
export async function up(queryInterface: QueryInterface): Promise<void> {
  // Adicionar notaFiscalId a C019_tituloPagar
  const tituloPagarDesc = await queryInterface.describeTable('C019_tituloPagar');
  if (!tituloPagarDesc['notaFiscalId']) {
    await queryInterface.addColumn('C019_tituloPagar', 'notaFiscalId', {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'C045_notaFiscal',
        key: 'id_nf',
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL',
    });
    await queryInterface.addIndex('C019_tituloPagar', ['notaFiscalId'], {
      name: 'idx_tituloPagar_notaFiscalId',
    });
  }

  // Adicionar notaFiscalId a C023_tituloReceber
  const tituloReceberDesc = await queryInterface.describeTable('C023_tituloReceber');
  if (!tituloReceberDesc['notaFiscalId']) {
    await queryInterface.addColumn('C023_tituloReceber', 'notaFiscalId', {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'C045_notaFiscal',
        key: 'id_nf',
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL',
    });
    await queryInterface.addIndex('C023_tituloReceber', ['notaFiscalId'], {
      name: 'idx_tituloReceber_notaFiscalId',
    });
  }
}

export async function down(queryInterface: QueryInterface): Promise<void> {
  await queryInterface.removeColumn('C019_tituloPagar', 'notaFiscalId');
  await queryInterface.removeColumn('C023_tituloReceber', 'notaFiscalId');
}
