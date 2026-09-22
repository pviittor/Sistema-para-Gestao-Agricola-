import { QueryInterface, DataTypes } from 'sequelize';

/**
 * Migration: Adicionar colunas geometry e grupo à tabela C034_talhao
 *
 * - geometry: GeoJSON Polygon para representação espacial do talhão
 * - grupo: Agrupamento de talhões para organização
 */
export async function up(queryInterface: QueryInterface): Promise<void> {
  const tableDesc = await queryInterface.describeTable('C034_talhao');

  if (!tableDesc['geometry']) {
    await queryInterface.addColumn('C034_talhao', 'geometry', {
      type: DataTypes.JSON,
      allowNull: true,
      comment: 'GeoJSON Polygon do talhão',
    });
  }

  if (!tableDesc['grupo']) {
    await queryInterface.addColumn('C034_talhao', 'grupo', {
      type: DataTypes.STRING(100),
      allowNull: true,
      defaultValue: null,
      comment: 'Grupo do talhão para organização',
    });
  }
}

export async function down(queryInterface: QueryInterface): Promise<void> {
  await queryInterface.removeColumn('C034_talhao', 'geometry');
  await queryInterface.removeColumn('C034_talhao', 'grupo');
}
