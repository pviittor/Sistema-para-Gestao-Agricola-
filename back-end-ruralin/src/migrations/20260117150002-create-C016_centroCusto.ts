import { QueryInterface, DataTypes, QueryTypes } from 'sequelize';

/**
 * Migration: Criar tabela C016_centroCusto
 * 
 * Esta migration cria a tabela C016_centroCusto para gerenciamento de centros de custo com hierarquia.
 */
export async function up(queryInterface: QueryInterface): Promise<void> {
  // Verificar se a tabela já existe
  const tables = await queryInterface.sequelize.query(`
    SELECT TABLE_NAME 
    FROM INFORMATION_SCHEMA.TABLES 
    WHERE TABLE_SCHEMA = DATABASE() 
    AND TABLE_NAME = 'C016_centroCusto';
  `, {
    type: QueryTypes.SELECT,
  }) as any[];

  const tableExists = tables && tables.length > 0;

  if (!tableExists) {
    await queryInterface.createTable('C016_centroCusto', {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        comment: 'ID único do centro de custo (auto-increment)',
      },
      tenantId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        comment: 'ID do tenant ao qual o centro de custo pertence',
      },
      codigo: {
        type: DataTypes.STRING(50),
        allowNull: false,
        unique: true,
        comment: 'Código do centro de custo',
      },
      nome: {
        type: DataTypes.STRING(255),
        allowNull: false,
        comment: 'Nome do centro de custo',
      },
      centroCustoPaiId: {
        type: DataTypes.INTEGER,
        allowNull: true,
        comment: 'ID do centro de custo pai (para hierarquia). NULL para centros de custo de primeiro nível',
        references: {
          model: 'C016_centroCusto',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
      },
      ativo: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true,
        comment: 'Se o centro de custo está ativo',
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
    await queryInterface.addIndex('C016_centroCusto', ['tenantId'], {
      name: 'idx_centroCusto_tenantId',
    });

    await queryInterface.addIndex('C016_centroCusto', ['codigo'], {
      unique: true,
      name: 'idx_centroCusto_codigo',
    });

    await queryInterface.addIndex('C016_centroCusto', ['centroCustoPaiId'], {
      name: 'idx_centroCusto_centroCustoPaiId',
    });

    await queryInterface.addIndex('C016_centroCusto', ['ativo'], {
      name: 'idx_centroCusto_ativo',
    });

    await queryInterface.addIndex('C016_centroCusto', ['usercreation'], {
      name: 'idx_centroCusto_usercreation',
    });
  }
}

export async function down(queryInterface: QueryInterface): Promise<void> {
  await queryInterface.dropTable('C016_centroCusto');
}
