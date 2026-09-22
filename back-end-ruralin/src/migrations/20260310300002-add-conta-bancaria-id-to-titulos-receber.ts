import { DataTypes, QueryInterface, QueryTypes } from 'sequelize';
import sequelize from '../config/database';

export async function up(queryInterface: QueryInterface): Promise<void> {
  const columnExists = await sequelize.query(`
    SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS
    WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME = 'C023_tituloReceber'
    AND COLUMN_NAME = 'contaBancariaId';
  `, { type: QueryTypes.SELECT }) as any[];

  if (!columnExists || columnExists.length === 0) {
    await queryInterface.addColumn('C023_tituloReceber', 'contaBancariaId', {
      type: DataTypes.INTEGER,
      allowNull: true,
      comment: 'FK para conta bancária associada ao título a receber',
      references: {
        model: 'contas',
        key: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL',
    });

    await queryInterface.addIndex('C023_tituloReceber', ['contaBancariaId'], {
      name: 'idx_tituloReceber_contaBancariaId',
    });
  }
}

export async function down(queryInterface: QueryInterface): Promise<void> {
  await queryInterface.removeIndex('C023_tituloReceber', 'idx_tituloReceber_contaBancariaId');
  await queryInterface.removeColumn('C023_tituloReceber', 'contaBancariaId');
}
