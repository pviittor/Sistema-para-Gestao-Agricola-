import { DataTypes, QueryInterface, QueryTypes } from 'sequelize';
import sequelize from '../config/database';

export async function up(queryInterface: QueryInterface): Promise<void> {
  const tableExists = await sequelize.query(`
    SELECT TABLE_NAME FROM INFORMATION_SCHEMA.TABLES
    WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME = 'C063_numeracaoRecibo';
  `, { type: QueryTypes.SELECT }) as any[];

  if (!tableExists || tableExists.length === 0) {
    await queryInterface.createTable('C063_numeracaoRecibo', {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      tenantId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: 'C012_tenant',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      serie: {
        type: DataTypes.STRING(5),
        allowNull: false,
        comment: 'Série do recibo (ex: 001, REC)',
      },
      ultimoNumero: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
        comment: 'Último número utilizado na série',
      },
      ativo: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true,
        comment: 'Se a série está ativa para emissão',
      },
      createdAt: {
        type: DataTypes.DATE,
        allowNull: false,
      },
      updatedAt: {
        type: DataTypes.DATE,
        allowNull: false,
      },
    });

    // Índice único composto: tenantId + serie
    await queryInterface.addIndex('C063_numeracaoRecibo', ['tenantId', 'serie'], {
      unique: true,
      name: 'idx_numeracao_recibo_tenant_serie',
    });
  }
}

export async function down(queryInterface: QueryInterface): Promise<void> {
  await queryInterface.dropTable('C063_numeracaoRecibo');
}
