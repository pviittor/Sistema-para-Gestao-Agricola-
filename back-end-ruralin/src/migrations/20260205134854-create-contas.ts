import { QueryInterface, DataTypes, QueryTypes } from 'sequelize';

/**
 * Migration: Criar tabela contas
 * 
 * Esta migration cria a tabela contas para gerenciamento de contas bancárias e caixas.
 */
export async function up(queryInterface: QueryInterface): Promise<void> {
  // Verificar se a tabela já existe
  const tables = await queryInterface.sequelize.query(`
    SELECT TABLE_NAME 
    FROM INFORMATION_SCHEMA.TABLES 
    WHERE TABLE_SCHEMA = DATABASE() 
    AND TABLE_NAME = 'contas';
  `, {
    type: QueryTypes.SELECT,
  }) as any[];

  const tableExists = tables && tables.length > 0;

  if (!tableExists) {
    await queryInterface.createTable('contas', {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        comment: 'ID único da conta (auto-increment)',
      },
      tenantId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        comment: 'ID do tenant ao qual a conta pertence',
      },
      bancoId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        comment: 'ID do banco',
        references: {
          model: 'lista_bancos',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT',
      },
      nome: {
        type: DataTypes.STRING(255),
        allowNull: false,
        comment: 'Nome da conta',
      },
      agencia: {
        type: DataTypes.STRING(50),
        allowNull: true,
        comment: 'Agência da conta',
      },
      conta: {
        type: DataTypes.STRING(50),
        allowNull: true,
        comment: 'Número da conta',
      },
      tipo: {
        type: DataTypes.ENUM('BANCO', 'CAIXA'),
        allowNull: false,
        comment: 'Tipo de conta (BANCO, CAIXA)',
      },
      saldoInicial: {
        type: DataTypes.DECIMAL(15, 2),
        allowNull: false,
        defaultValue: 0,
        comment: 'Saldo inicial da conta',
      },
      ativo: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true,
        comment: 'Se a conta está ativa',
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
    await queryInterface.addIndex('contas', ['tenantId'], {
      name: 'idx_contas_tenantId',
    });

    await queryInterface.addIndex('contas', ['bancoId'], {
      name: 'idx_contas_bancoId',
    });

    await queryInterface.addIndex('contas', ['tipo'], {
      name: 'idx_contas_tipo',
    });

    await queryInterface.addIndex('contas', ['ativo'], {
      name: 'idx_contas_ativo',
    });

    await queryInterface.addIndex('contas', ['usercreation'], {
      name: 'idx_contas_usercreation',
    });
  }
}

export async function down(queryInterface: QueryInterface): Promise<void> {
  await queryInterface.dropTable('contas');
}
