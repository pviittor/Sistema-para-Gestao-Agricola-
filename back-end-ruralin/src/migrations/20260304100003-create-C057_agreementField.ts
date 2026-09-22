import { QueryInterface, DataTypes, QueryTypes } from 'sequelize';

/**
 * Migration: Criar tabela C057_agreementField
 *
 * Esta migration cria a tabela C057_agreementField (pivot) que vincula
 * agreements a talhões (fields).
 */
export async function up(queryInterface: QueryInterface): Promise<void> {
  // Verificar se a tabela já existe
  const tables = await queryInterface.sequelize.query(`
    SELECT TABLE_NAME
    FROM INFORMATION_SCHEMA.TABLES
    WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME = 'C057_agreementField';
  `, {
    type: QueryTypes.SELECT,
  }) as any[];

  const tableExists = tables && tables.length > 0;

  if (!tableExists) {
    await queryInterface.createTable('C057_agreementField', {
      agreementId: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        allowNull: false,
        comment: 'ID do agreement (FK, parte da PK composta)',
        references: {
          model: 'C054_agreement',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      fieldId: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        allowNull: false,
        comment: 'ID do talhão (FK, parte da PK composta)',
        references: {
          model: 'C034_talhao',
          key: 'id_talhao',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      tenantId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        comment: 'ID do tenant ao qual o registro pertence',
      },
    });

    // Criar índices
    await queryInterface.addIndex('C057_agreementField', ['tenantId'], {
      name: 'idx_agreementField_tenantId',
    });

    await queryInterface.addIndex('C057_agreementField', ['fieldId'], {
      name: 'idx_agreementField_fieldId',
    });
  }
}

export async function down(queryInterface: QueryInterface): Promise<void> {
  await queryInterface.dropTable('C057_agreementField');
}
