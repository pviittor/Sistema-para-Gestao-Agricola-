import { QueryInterface, DataTypes } from 'sequelize';

/**
 * Adiciona campos de sincronização mobile à tabela C068_ordemServico:
 * - syncedAt: Data/hora da última sincronização
 * - localCreatedAt: Data/hora de criação local no dispositivo
 * - deviceId: Identificador do dispositivo que criou/sincronizou
 * - Índice composto (tenantId, syncedAt) para queries de sync
 */

export async function up(queryInterface: QueryInterface): Promise<void> {
  await queryInterface.addColumn('C068_ordemServico', 'syncedAt', {
    type: DataTypes.DATE,
    allowNull: true,
    comment: 'Data/hora da última sincronização com dispositivo mobile',
  });

  await queryInterface.addColumn('C068_ordemServico', 'localCreatedAt', {
    type: DataTypes.DATE,
    allowNull: true,
    comment: 'Data/hora de criação local no dispositivo mobile',
  });

  await queryInterface.addColumn('C068_ordemServico', 'deviceId', {
    type: DataTypes.STRING(100),
    allowNull: true,
    comment: 'Identificador do dispositivo que criou/sincronizou a OS',
  });

  await queryInterface.addIndex('C068_ordemServico', ['tenantId', 'syncedAt'], {
    name: 'idx_ordemServico_tenant_syncedAt',
  });
}

export async function down(queryInterface: QueryInterface): Promise<void> {
  await queryInterface.removeIndex('C068_ordemServico', 'idx_ordemServico_tenant_syncedAt');
  await queryInterface.removeColumn('C068_ordemServico', 'deviceId');
  await queryInterface.removeColumn('C068_ordemServico', 'localCreatedAt');
  await queryInterface.removeColumn('C068_ordemServico', 'syncedAt');
}
