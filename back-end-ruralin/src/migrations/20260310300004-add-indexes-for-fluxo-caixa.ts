import { QueryInterface, QueryTypes } from 'sequelize';
import sequelize from '../config/database';

export async function up(queryInterface: QueryInterface): Promise<void> {
  // Índice composto em C020_parcelaTituloPagar(tenantId, dataVencimento, status)
  const idx1Exists = await sequelize.query(`
    SELECT INDEX_NAME FROM INFORMATION_SCHEMA.STATISTICS
    WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME = 'C020_parcelaTituloPagar'
    AND INDEX_NAME = 'idx_parcelaTituloPagar_tenant_vencimento_status';
  `, { type: QueryTypes.SELECT }) as any[];

  if (!idx1Exists || idx1Exists.length === 0) {
    await queryInterface.addIndex('C020_parcelaTituloPagar', ['tenantId', 'dataVencimento', 'status'], {
      name: 'idx_parcelaTituloPagar_tenant_vencimento_status',
    });
  }

  // Índice composto em C024_parcelaTituloReceber(tenantId, dataVencimento, status)
  const idx2Exists = await sequelize.query(`
    SELECT INDEX_NAME FROM INFORMATION_SCHEMA.STATISTICS
    WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME = 'C024_parcelaTituloReceber'
    AND INDEX_NAME = 'idx_parcelaTituloReceber_tenant_vencimento_status';
  `, { type: QueryTypes.SELECT }) as any[];

  if (!idx2Exists || idx2Exists.length === 0) {
    await queryInterface.addIndex('C024_parcelaTituloReceber', ['tenantId', 'dataVencimento', 'status'], {
      name: 'idx_parcelaTituloReceber_tenant_vencimento_status',
    });
  }

  // Índice composto em C056_agreementPaymentSchedule(tenantId, startDate, status)
  const idx3Exists = await sequelize.query(`
    SELECT INDEX_NAME FROM INFORMATION_SCHEMA.STATISTICS
    WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME = 'C056_agreementPaymentSchedule'
    AND INDEX_NAME = 'idx_agreementPaymentSchedule_tenant_startDate_status';
  `, { type: QueryTypes.SELECT }) as any[];

  if (!idx3Exists || idx3Exists.length === 0) {
    await queryInterface.addIndex('C056_agreementPaymentSchedule', ['tenantId', 'startDate', 'status'], {
      name: 'idx_agreementPaymentSchedule_tenant_startDate_status',
    });
  }

  // Índice composto em C019_tituloPagar(tenantId, contaBancariaId)
  const idx4Exists = await sequelize.query(`
    SELECT INDEX_NAME FROM INFORMATION_SCHEMA.STATISTICS
    WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME = 'C019_tituloPagar'
    AND INDEX_NAME = 'idx_tituloPagar_tenant_contaBancaria';
  `, { type: QueryTypes.SELECT }) as any[];

  if (!idx4Exists || idx4Exists.length === 0) {
    await queryInterface.addIndex('C019_tituloPagar', ['tenantId', 'contaBancariaId'], {
      name: 'idx_tituloPagar_tenant_contaBancaria',
    });
  }

  // Índice composto em C023_tituloReceber(tenantId, contaBancariaId)
  const idx5Exists = await sequelize.query(`
    SELECT INDEX_NAME FROM INFORMATION_SCHEMA.STATISTICS
    WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME = 'C023_tituloReceber'
    AND INDEX_NAME = 'idx_tituloReceber_tenant_contaBancaria';
  `, { type: QueryTypes.SELECT }) as any[];

  if (!idx5Exists || idx5Exists.length === 0) {
    await queryInterface.addIndex('C023_tituloReceber', ['tenantId', 'contaBancariaId'], {
      name: 'idx_tituloReceber_tenant_contaBancaria',
    });
  }
}

export async function down(queryInterface: QueryInterface): Promise<void> {
  await queryInterface.removeIndex('C023_tituloReceber', 'idx_tituloReceber_tenant_contaBancaria');
  await queryInterface.removeIndex('C019_tituloPagar', 'idx_tituloPagar_tenant_contaBancaria');
  await queryInterface.removeIndex('C056_agreementPaymentSchedule', 'idx_agreementPaymentSchedule_tenant_startDate_status');
  await queryInterface.removeIndex('C024_parcelaTituloReceber', 'idx_parcelaTituloReceber_tenant_vencimento_status');
  await queryInterface.removeIndex('C020_parcelaTituloPagar', 'idx_parcelaTituloPagar_tenant_vencimento_status');
}
