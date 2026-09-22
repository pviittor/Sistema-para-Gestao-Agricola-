import { QueryInterface, DataTypes, QueryTypes } from 'sequelize';

/**
 * Migration: Criar tabela C025_rateioPlanoContaTituloReceber
 * 
 * Esta migration cria a tabela C025_rateioPlanoContaTituloReceber para gerenciamento de rateios
 * do valor do título a receber por planos de contas gerenciais.
 */
export async function up(queryInterface: QueryInterface): Promise<void> {
  // Verificar se a tabela já existe
  const tables = await queryInterface.sequelize.query(`
    SELECT TABLE_NAME 
    FROM INFORMATION_SCHEMA.TABLES 
    WHERE TABLE_SCHEMA = DATABASE() 
    AND TABLE_NAME = 'C025_rateioPlanoContaTituloReceber';
  `, {
    type: QueryTypes.SELECT,
  }) as any[];

  const tableExists = tables && tables.length > 0;

  if (!tableExists) {
    await queryInterface.createTable('C025_rateioPlanoContaTituloReceber', {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        comment: 'ID único do rateio (auto-increment)',
      },
      tenantId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        comment: 'ID do tenant ao qual o rateio pertence',
      },
      idTituloReceber: {
        type: DataTypes.INTEGER,
        allowNull: false,
        comment: 'ID do título a receber ao qual o rateio pertence',
        references: {
          model: 'C023_tituloReceber',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      idPlanoContaGerencial: {
        type: DataTypes.INTEGER,
        allowNull: false,
        comment: 'ID do plano de contas gerencial',
        references: {
          model: 'C013_planoContaGerencial',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT',
      },
      valorRateio: {
        type: DataTypes.DECIMAL(15, 2),
        allowNull: false,
        comment: 'Valor do rateio',
      },
      percentualRateio: {
        type: DataTypes.DECIMAL(5, 2),
        allowNull: false,
        comment: 'Percentual do rateio em relação ao valor do título (calculado automaticamente)',
      },
      observacao: {
        type: DataTypes.TEXT,
        allowNull: true,
        comment: 'Observações sobre o rateio',
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
    await queryInterface.addIndex('C025_rateioPlanoContaTituloReceber', ['tenantId'], {
      name: 'idx_rateioPlanoContaTituloReceber_tenantId',
    });

    await queryInterface.addIndex('C025_rateioPlanoContaTituloReceber', ['idTituloReceber'], {
      name: 'idx_rateioPlanoContaTituloReceber_idTituloReceber',
    });

    await queryInterface.addIndex('C025_rateioPlanoContaTituloReceber', ['idPlanoContaGerencial'], {
      name: 'idx_rateioPlanoContaTituloReceber_idPlanoContaGerencial',
    });

    await queryInterface.addIndex('C025_rateioPlanoContaTituloReceber', ['usercreation'], {
      name: 'idx_rateioPlanoContaTituloReceber_usercreation',
    });
  }
}

export async function down(queryInterface: QueryInterface): Promise<void> {
  await queryInterface.dropTable('C025_rateioPlanoContaTituloReceber');
}
