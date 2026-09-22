import { QueryInterface, DataTypes, QueryTypes } from 'sequelize';

/**
 * Migration: Criar tabela C017_safra
 * 
 * Esta migration cria a tabela C017_safra para gerenciamento de safras agrícolas.
 */
export async function up(queryInterface: QueryInterface): Promise<void> {
  // Verificar se a tabela já existe
  const tables = await queryInterface.sequelize.query(`
    SELECT TABLE_NAME 
    FROM INFORMATION_SCHEMA.TABLES 
    WHERE TABLE_SCHEMA = DATABASE() 
    AND TABLE_NAME = 'C017_safra';
  `, {
    type: QueryTypes.SELECT,
  }) as any[];

  const tableExists = tables && tables.length > 0;

  if (!tableExists) {
    await queryInterface.createTable('C017_safra', {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        comment: 'ID único da safra (auto-increment)',
      },
      tenantId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        comment: 'ID do tenant ao qual a safra pertence',
      },
      culturaId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        comment: 'ID da cultura',
        references: {
          model: 'C009_cultura',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT',
      },
      nome: {
        type: DataTypes.STRING(255),
        allowNull: false,
        comment: 'Nome da safra',
      },
      dataInicio: {
        type: DataTypes.DATEONLY,
        allowNull: false,
        comment: 'Data de início da safra',
      },
      dataFim: {
        type: DataTypes.DATEONLY,
        allowNull: true,
        comment: 'Data de fim da safra',
      },
      status: {
        type: DataTypes.ENUM('PLANEJADA', 'EM_ANDAMENTO', 'CONCLUIDA', 'CANCELADA'),
        allowNull: false,
        defaultValue: 'PLANEJADA',
        comment: 'Status da safra',
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
    await queryInterface.addIndex('C017_safra', ['tenantId'], {
      name: 'idx_safra_tenantId',
    });

    await queryInterface.addIndex('C017_safra', ['culturaId'], {
      name: 'idx_safra_culturaId',
    });

    await queryInterface.addIndex('C017_safra', ['status'], {
      name: 'idx_safra_status',
    });

    await queryInterface.addIndex('C017_safra', ['dataInicio'], {
      name: 'idx_safra_dataInicio',
    });

    await queryInterface.addIndex('C017_safra', ['dataFim'], {
      name: 'idx_safra_dataFim',
    });

    await queryInterface.addIndex('C017_safra', ['usercreation'], {
      name: 'idx_safra_usercreation',
    });
  }
}

export async function down(queryInterface: QueryInterface): Promise<void> {
  await queryInterface.dropTable('C017_safra');
}
