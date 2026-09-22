import { QueryInterface, DataTypes, QueryTypes } from 'sequelize';

/**
 * Migration: Criar tabela C034_talhao
 *
 * Esta migration cria a tabela C034_talhao para cadastro de talhões (subdivisões de fazendas).
 */
export async function up(queryInterface: QueryInterface): Promise<void> {
  // Verificar se a tabela já existe
  const tables = await queryInterface.sequelize.query(`
    SELECT TABLE_NAME
    FROM INFORMATION_SCHEMA.TABLES
    WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME = 'C034_talhao';
  `, {
    type: QueryTypes.SELECT,
  }) as any[];

  const tableExists = tables && tables.length > 0;

  if (!tableExists) {
    await queryInterface.createTable('C034_talhao', {
      id_talhao: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        comment: 'ID único do talhão (auto-increment)',
      },
      tenantId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        comment: 'ID do tenant ao qual o talhão pertence',
      },
      descricao: {
        type: DataTypes.STRING(255),
        allowNull: false,
        comment: 'Descrição do talhão',
      },
      idFazenda: {
        type: DataTypes.INTEGER,
        allowNull: false,
        comment: 'ID da fazenda',
        references: {
          model: 'C018_fazenda',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT',
      },
      area: {
        type: DataTypes.DECIMAL(18, 4),
        allowNull: false,
        comment: 'Área do talhão',
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
    await queryInterface.addIndex('C034_talhao', ['tenantId'], {
      name: 'idx_talhao_tenantId',
    });

    await queryInterface.addIndex('C034_talhao', ['idFazenda'], {
      name: 'idx_talhao_idFazenda',
    });

    await queryInterface.addIndex('C034_talhao', ['usercreation'], {
      name: 'idx_talhao_usercreation',
    });
  }
}

export async function down(queryInterface: QueryInterface): Promise<void> {
  await queryInterface.dropTable('C034_talhao');
}
