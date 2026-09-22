import { QueryInterface, DataTypes } from 'sequelize';

/**
 * Migration: Adicionar colunas placa, peso_bruto e peso_tara à tabela C053_registroArmazenagem
 *
 * Adiciona campos de placa do veículo, peso bruto e peso tara aos registros de armazenagem.
 */
export async function up(queryInterface: QueryInterface): Promise<void> {
  const tableDesc = await queryInterface.describeTable('C053_registroArmazenagem');

  if (!tableDesc['placa']) {
    await queryInterface.addColumn('C053_registroArmazenagem', 'placa', {
      type: DataTypes.STRING(20),
      allowNull: true,
    });
  }

  if (!tableDesc['peso_bruto']) {
    await queryInterface.addColumn('C053_registroArmazenagem', 'peso_bruto', {
      type: DataTypes.DECIMAL(18, 4),
      allowNull: true,
    });
  }

  if (!tableDesc['peso_tara']) {
    await queryInterface.addColumn('C053_registroArmazenagem', 'peso_tara', {
      type: DataTypes.DECIMAL(18, 4),
      allowNull: true,
    });
  }
}

export async function down(queryInterface: QueryInterface): Promise<void> {
  await queryInterface.removeColumn('C053_registroArmazenagem', 'placa');
  await queryInterface.removeColumn('C053_registroArmazenagem', 'peso_bruto');
  await queryInterface.removeColumn('C053_registroArmazenagem', 'peso_tara');
}
