import { DataTypes, QueryInterface, QueryTypes } from 'sequelize';
import sequelize from '../config/database';

export async function up(queryInterface: QueryInterface): Promise<void> {
  const statusExists = await sequelize.query(`
    SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS
    WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME = 'C056_agreementPaymentSchedule'
    AND COLUMN_NAME = 'status';
  `, { type: QueryTypes.SELECT }) as any[];

  if (!statusExists || statusExists.length === 0) {
    await queryInterface.addColumn('C056_agreementPaymentSchedule', 'status', {
      type: DataTypes.ENUM('pendente', 'liquidado'),
      allowNull: false,
      defaultValue: 'pendente',
      comment: 'Status da parcela do acordo: pendente ou liquidado',
    });
  }

  const dataLiquidacaoExists = await sequelize.query(`
    SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS
    WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME = 'C056_agreementPaymentSchedule'
    AND COLUMN_NAME = 'dataLiquidacao';
  `, { type: QueryTypes.SELECT }) as any[];

  if (!dataLiquidacaoExists || dataLiquidacaoExists.length === 0) {
    await queryInterface.addColumn('C056_agreementPaymentSchedule', 'dataLiquidacao', {
      type: DataTypes.DATEONLY,
      allowNull: true,
      comment: 'Data em que a parcela foi liquidada',
    });
  }

  await queryInterface.addIndex('C056_agreementPaymentSchedule', ['tenantId', 'status'], {
    name: 'idx_agreementPaymentSchedule_tenant_status',
  });
}

export async function down(queryInterface: QueryInterface): Promise<void> {
  await queryInterface.removeIndex('C056_agreementPaymentSchedule', 'idx_agreementPaymentSchedule_tenant_status');
  await queryInterface.removeColumn('C056_agreementPaymentSchedule', 'dataLiquidacao');
  await queryInterface.removeColumn('C056_agreementPaymentSchedule', 'status');
}
