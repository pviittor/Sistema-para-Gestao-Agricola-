import { QueryInterface, DataTypes, QueryTypes } from 'sequelize';

/**
 * Migration: Criar tabela C015_municipio
 * 
 * Esta migration cria a tabela C015_municipio para gerenciamento de municípios brasileiros.
 * Dados globais - não vinculados a tenant.
 */
export async function up(queryInterface: QueryInterface): Promise<void> {
  // Verificar se a tabela já existe
  const tables = await queryInterface.sequelize.query(`
    SELECT TABLE_NAME 
    FROM INFORMATION_SCHEMA.TABLES 
    WHERE TABLE_SCHEMA = DATABASE() 
    AND TABLE_NAME = 'C015_municipio';
  `, {
    type: QueryTypes.SELECT,
  }) as any[];

  const tableExists = tables && tables.length > 0;

  if (!tableExists) {
    await queryInterface.createTable('C015_municipio', {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        comment: 'ID único do município (auto-increment)',
      },
      nome: {
        type: DataTypes.STRING(255),
        allowNull: false,
        comment: 'Nome do município',
      },
      idEstado: {
        type: DataTypes.INTEGER,
        allowNull: false,
        comment: 'ID do estado ao qual o município pertence',
        references: {
          model: 'C014_estado',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT',
      },
      codigoIBGE: {
        type: DataTypes.INTEGER,
        allowNull: true,
        unique: true,
        comment: 'Código do município no IBGE',
      },
      ativo: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true,
        comment: 'Se o município está ativo',
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
    await queryInterface.addIndex('C015_municipio', ['idEstado'], {
      name: 'idx_municipio_idEstado',
    });

    await queryInterface.addIndex('C015_municipio', ['codigoIBGE'], {
      unique: true,
      name: 'idx_municipio_codigoIBGE',
    });

    await queryInterface.addIndex('C015_municipio', ['ativo'], {
      name: 'idx_municipio_ativo',
    });

    await queryInterface.addIndex('C015_municipio', ['nome'], {
      name: 'idx_municipio_nome',
    });

    await queryInterface.addIndex('C015_municipio', ['usercreation'], {
      name: 'idx_municipio_usercreation',
    });
  }
}

export async function down(queryInterface: QueryInterface): Promise<void> {
  await queryInterface.dropTable('C015_municipio');
}
