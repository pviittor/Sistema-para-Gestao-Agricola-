import { DataTypes, QueryInterface, QueryTypes } from 'sequelize';
import sequelize from '../config/database';

export async function up(queryInterface: QueryInterface): Promise<void> {
  const columnExists = await sequelize.query(`
    SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS
    WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME = 'C019_tituloPagar'
    AND COLUMN_NAME = 'contaBancariaId';
  `, { type: QueryTypes.SELECT }) as any[];

  if (!columnExists || columnExists.length === 0) {
    await queryInterface.addColumn('C019_tituloPagar', 'contaBancariaId', {
      type: DataTypes.INTEGER,
      allowNull: true,
      comment: 'FK para conta bancária associada ao título a pagar',
      references: {
        model: 'contas',
        key: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL',
    });

    await queryInterface.addIndex('C019_tituloPagar', ['contaBancariaId'], {
      name: 'idx_tituloPagar_contaBancariaId',
    });
  }
}

export async function down(queryInterface: QueryInterface): Promise<void> {
  await queryInterface.removeIndex('C019_tituloPagar', 'idx_tituloPagar_contaBancariaId');
  await queryInterface.removeColumn('C019_tituloPagar', 'contaBancariaId');
}
