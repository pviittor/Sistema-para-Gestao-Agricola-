import { QueryInterface, DataTypes, QueryTypes } from 'sequelize';

/**
 * Migration: Criar tabela C011_consultoria
 * 
 * Esta migration cria a tabela C011_consultoria para gerenciamento de consultorias
 * no sistema WhiteLabel.
 */
export async function up(queryInterface: QueryInterface): Promise<void> {
  // Verificar se a tabela já existe
  const tables = await queryInterface.sequelize.query(`
    SELECT TABLE_NAME 
    FROM INFORMATION_SCHEMA.TABLES 
    WHERE TABLE_SCHEMA = DATABASE() 
    AND TABLE_NAME = 'C011_consultoria';
  `, {
    type: QueryTypes.SELECT,
  }) as any[];

  const tableExists = tables && tables.length > 0;

  if (!tableExists) {
    await queryInterface.createTable('C011_consultoria', {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        comment: 'ID único da consultoria (auto-increment)',
      },
      tenantId: {
        type: DataTypes.INTEGER,
        allowNull: true,
        comment: 'ID do tenant da consultoria (opcional)',
      },
      razaoSocial: {
        type: DataTypes.STRING(255),
        allowNull: false,
        comment: 'Razão social da consultoria',
      },
      nomeFantasia: {
        type: DataTypes.STRING(255),
        allowNull: true,
        comment: 'Nome fantasia da consultoria',
      },
      cnpj: {
        type: DataTypes.STRING(18),
        allowNull: false,
        unique: true,
        comment: 'CNPJ da consultoria (único)',
      },
      email: {
        type: DataTypes.STRING(255),
        allowNull: false,
        comment: 'Email de contato da consultoria',
      },
      telefone: {
        type: DataTypes.STRING(20),
        allowNull: true,
        comment: 'Telefone de contato da consultoria',
      },
      ativo: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true,
        comment: 'Indica se a consultoria está ativa',
      },
      dataAtivacao: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
        comment: 'Data de ativação da consultoria',
      },
      dataDesativacao: {
        type: DataTypes.DATE,
        allowNull: true,
        comment: 'Data de desativação da consultoria',
      },
      limiteTenants: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 10,
        comment: 'Limite de tenants permitidos para esta consultoria',
      },
      tenantCount: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
        comment: 'Quantidade atual de tenants (calculado)',
      },
      usercreation: {
        type: DataTypes.INTEGER,
        allowNull: false,
        comment: 'ID do usuário que criou a consultoria',
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
        comment: 'Data de criação da consultoria',
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
    await queryInterface.addIndex('C011_consultoria', ['cnpj'], {
      unique: true,
      name: 'idx_consultoria_cnpj_unique',
    });

    await queryInterface.addIndex('C011_consultoria', ['ativo'], {
      name: 'idx_consultoria_ativo',
    });

    await queryInterface.addIndex('C011_consultoria', ['usercreation'], {
      name: 'idx_consultoria_usercreation',
    });
  }
}

export async function down(queryInterface: QueryInterface): Promise<void> {
  await queryInterface.dropTable('C011_consultoria');
}
