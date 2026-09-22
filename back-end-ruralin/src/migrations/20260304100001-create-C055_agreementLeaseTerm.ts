import { QueryInterface, DataTypes, QueryTypes } from 'sequelize';

/**
 * Migration: Criar tabela C055_agreementLeaseTerm
 *
 * Esta migration cria a tabela C055_agreementLeaseTerm para registro de
 * termos de arrendamento vinculados a agreements do tipo RENT_LEASE.
 */
export async function up(queryInterface: QueryInterface): Promise<void> {
  // Verificar se a tabela já existe
  const tables = await queryInterface.sequelize.query(`
    SELECT TABLE_NAME
    FROM INFORMATION_SCHEMA.TABLES
    WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME = 'C055_agreementLeaseTerm';
  `, {
    type: QueryTypes.SELECT,
  }) as any[];

  const tableExists = tables && tables.length > 0;

  if (!tableExists) {
    await queryInterface.createTable('C055_agreementLeaseTerm', {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        comment: 'ID único do lease term',
      },
      tenantId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        comment: 'ID do tenant ao qual o registro pertence',
      },
      agreementId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        comment: 'ID do agreement (FK)',
        references: {
          model: 'C054_agreement',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      termType: {
        type: DataTypes.ENUM('BASE_RENT', 'CROP_SHARE', 'YIELD_ADJUSTMENT', 'EXPENSE_SHARE'),
        allowNull: false,
        comment: 'Tipo do termo: BASE_RENT, CROP_SHARE, YIELD_ADJUSTMENT ou EXPENSE_SHARE',
      },
      expenseCategory: {
        type: DataTypes.ENUM('ALL', 'INPUTS', 'FERTILIZER'),
        allowNull: true,
        comment: 'Categoria de despesa (somente para EXPENSE_SHARE)',
      },
      tenantCostAllocation: {
        type: DataTypes.DECIMAL(5, 2),
        allowNull: true,
        comment: 'Alocação de custo do arrendatário (somente para EXPENSE_SHARE)',
      },
      usercreation: {
        type: DataTypes.INTEGER,
        allowNull: false,
        comment: 'ID do usuário que criou o registro',
        references: {
          model: 'usuarios',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT',
      },
      datecreation: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
        comment: 'Data de criação do registro',
      },
    });

    // Criar índices
    await queryInterface.addIndex('C055_agreementLeaseTerm', ['tenantId'], {
      name: 'idx_agreementLeaseTerm_tenantId',
    });

    await queryInterface.addIndex('C055_agreementLeaseTerm', ['agreementId'], {
      name: 'idx_agreementLeaseTerm_agreementId',
    });

    await queryInterface.addIndex('C055_agreementLeaseTerm', ['usercreation'], {
      name: 'idx_agreementLeaseTerm_usercreation',
    });
  }
}

export async function down(queryInterface: QueryInterface): Promise<void> {
  await queryInterface.dropTable('C055_agreementLeaseTerm');
}
