import { QueryInterface, DataTypes, QueryTypes } from 'sequelize';

/**
 * Migration: Criar tabela C014_estado
 * 
 * Esta migration cria a tabela C014_estado para gerenciamento de estados brasileiros.
 * Dados globais - não vinculados a tenant.
 */
export async function up(queryInterface: QueryInterface): Promise<void> {
  // Verificar se a tabela já existe
  const tables = await queryInterface.sequelize.query(`
    SELECT TABLE_NAME 
    FROM INFORMATION_SCHEMA.TABLES 
    WHERE TABLE_SCHEMA = DATABASE() 
    AND TABLE_NAME = 'C014_estado';
  `, {
    type: QueryTypes.SELECT,
  }) as any[];

  const tableExists = tables && tables.length > 0;

  if (!tableExists) {
    await queryInterface.createTable('C014_estado', {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        comment: 'ID único do estado (auto-increment)',
      },
      sigla: {
        type: DataTypes.STRING(2),
        allowNull: false,
        unique: true,
        comment: 'Sigla do estado (ex: SP, RJ, MG)',
      },
      nome: {
        type: DataTypes.STRING(100),
        allowNull: false,
        comment: 'Nome completo do estado',
      },
      codigoIBGE: {
        type: DataTypes.INTEGER,
        allowNull: true,
        unique: true,
        comment: 'Código do estado no IBGE',
      },
      ativo: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true,
        comment: 'Se o estado está ativo',
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
    await queryInterface.addIndex('C014_estado', ['sigla'], {
      unique: true,
      name: 'idx_estado_sigla',
    });

    await queryInterface.addIndex('C014_estado', ['codigoIBGE'], {
      unique: true,
      name: 'idx_estado_codigoIBGE',
    });

    await queryInterface.addIndex('C014_estado', ['ativo'], {
      name: 'idx_estado_ativo',
    });

    await queryInterface.addIndex('C014_estado', ['usercreation'], {
      name: 'idx_estado_usercreation',
    });
  }
}

export async function down(queryInterface: QueryInterface): Promise<void> {
  await queryInterface.dropTable('C014_estado');
}
