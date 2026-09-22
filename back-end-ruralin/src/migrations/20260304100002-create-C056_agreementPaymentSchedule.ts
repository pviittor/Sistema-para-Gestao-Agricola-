import { QueryInterface, DataTypes, QueryTypes } from 'sequelize';

/**
 * Migration: Criar tabela C056_agreementPaymentSchedule
 *
 * Esta migration cria a tabela C056_agreementPaymentSchedule para registro de
 * cronogramas de pagamento vinculados a agreements.
 */
export async function up(queryInterface: QueryInterface): Promise<void> {
  // Verificar se a tabela já existe
  const tables = await queryInterface.sequelize.query(`
    SELECT TABLE_NAME
    FROM INFORMATION_SCHEMA.TABLES
    WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME = 'C056_agreementPaymentSchedule';
  `, {
    type: QueryTypes.SELECT,
  }) as any[];

  const tableExists = tables && tables.length > 0;

  if (!tableExists) {
    await queryInterface.createTable('C056_agreementPaymentSchedule', {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        comment: 'ID único do payment schedule',
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
      paymentInterval: {
        type: DataTypes.INTEGER,
        allowNull: false,
        comment: 'Intervalo de pagamento',
      },
      paymentPeriod: {
        type: DataTypes.ENUM('MONTH', 'YEAR'),
        allowNull: false,
        comment: 'Período de pagamento: MONTH ou YEAR',
      },
      paymentDay: {
        type: DataTypes.INTEGER,
        allowNull: false,
        comment: 'Dia do pagamento',
      },
      amount: {
        type: DataTypes.DECIMAL(18, 2),
        allowNull: false,
        comment: 'Valor do pagamento',
      },
      amountRate: {
        type: DataTypes.ENUM('TOTAL', 'PER_HECTARE'),
        allowNull: false,
        comment: 'Tipo do valor: TOTAL ou PER_HECTARE',
      },
      startDate: {
        type: DataTypes.DATEONLY,
        allowNull: false,
        comment: 'Data de início do cronograma',
      },
      endDate: {
        type: DataTypes.DATEONLY,
        allowNull: true,
        comment: 'Data de término do cronograma',
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
    await queryInterface.addIndex('C056_agreementPaymentSchedule', ['tenantId'], {
      name: 'idx_agreementPaymentSchedule_tenantId',
    });

    await queryInterface.addIndex('C056_agreementPaymentSchedule', ['agreementId'], {
      name: 'idx_agreementPaymentSchedule_agreementId',
    });

    await queryInterface.addIndex('C056_agreementPaymentSchedule', ['usercreation'], {
      name: 'idx_agreementPaymentSchedule_usercreation',
    });
  }
}

export async function down(queryInterface: QueryInterface): Promise<void> {
  await queryInterface.dropTable('C056_agreementPaymentSchedule');
}
