import { QueryInterface, DataTypes, QueryTypes } from 'sequelize';

/**
 * Migration: Criar tabela C012_tenant
 * 
 * Esta migration cria a tabela C012_tenant para gerenciamento de tenants
 * no sistema WhiteLabel.
 */
export async function up(queryInterface: QueryInterface): Promise<void> {
  // Verificar se a tabela já existe
  const tables = await queryInterface.sequelize.query(`
    SELECT TABLE_NAME 
    FROM INFORMATION_SCHEMA.TABLES 
    WHERE TABLE_SCHEMA = DATABASE() 
    AND TABLE_NAME = 'C012_tenant';
  `, {
    type: QueryTypes.SELECT,
  }) as any[];

  const tableExists = tables && tables.length > 0;

  if (!tableExists) {
    await queryInterface.createTable('C012_tenant', {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        comment: 'ID único do tenant (auto-increment)',
      },
      consultoriaId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        comment: 'ID da consultoria à qual o tenant pertence',
        references: {
          model: 'C011_consultoria',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT',
      },
      nome: {
        type: DataTypes.STRING(255),
        allowNull: false,
        comment: 'Nome do tenant',
      },
      slug: {
        type: DataTypes.STRING(255),
        allowNull: false,
        unique: true,
        comment: 'Slug único do tenant (para URLs/subdomínios)',
      },
      ativo: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true,
        comment: 'Indica se o tenant está ativo',
      },
      dataAtivacao: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
        comment: 'Data de ativação do tenant',
      },
      dataDesativacao: {
        type: DataTypes.DATE,
        allowNull: true,
        comment: 'Data de desativação do tenant',
      },
      configuracoes: {
        type: DataTypes.JSON,
        allowNull: true,
        comment: 'Configurações específicas do tenant',
      },
      limiteUsuarios: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 50,
        comment: 'Limite de usuários permitidos para este tenant',
      },
      usercreation: {
        type: DataTypes.INTEGER,
        allowNull: false,
        comment: 'ID do usuário que criou o tenant',
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
        comment: 'Data de criação do tenant',
      },
      createdAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
      },
      updatedAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
      },
    });

    // Criar índices
    await queryInterface.addIndex('C012_tenant', ['slug'], {
      unique: true,
      name: 'idx_tenant_slug_unique',
    });

    await queryInterface.addIndex('C012_tenant', ['ativo'], {
      name: 'idx_tenant_ativo',
    });

    await queryInterface.addIndex('C012_tenant', ['consultoriaId'], {
      name: 'idx_tenant_consultoriaId',
    });

    await queryInterface.addIndex('C012_tenant', ['consultoriaId', 'ativo'], {
      name: 'idx_tenant_consultoria_ativo',
    });

    await queryInterface.addIndex('C012_tenant', ['usercreation'], {
      name: 'idx_tenant_usercreation',
    });
  }
}

export async function down(queryInterface: QueryInterface): Promise<void> {
  await queryInterface.dropTable('C012_tenant');
}
