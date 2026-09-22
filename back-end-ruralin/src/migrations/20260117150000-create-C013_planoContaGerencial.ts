import { QueryInterface, DataTypes, QueryTypes } from 'sequelize';

/**
 * Migration: Criar tabela C013_planoContaGerencial
 * 
 * Esta migration cria a tabela C013_planoContaGerencial para o plano de contas gerencial
 * com estrutura hierárquica de 4 níveis.
 */
export async function up(queryInterface: QueryInterface): Promise<void> {
  // Verificar se a tabela já existe
  const tables = await queryInterface.sequelize.query(`
    SELECT TABLE_NAME 
    FROM INFORMATION_SCHEMA.TABLES 
    WHERE TABLE_SCHEMA = DATABASE() 
    AND TABLE_NAME = 'C013_planoContaGerencial';
  `, {
    type: QueryTypes.SELECT,
  }) as any[];

  const tableExists = tables && tables.length > 0;

  if (!tableExists) {
    await queryInterface.createTable('C013_planoContaGerencial', {
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
      item: {
        type: DataTypes.STRING(50),
        allowNull: false,
        unique: true,
        comment: 'Sequência lógica de números indicando os níveis da conta (ex: 1.0.0.0, 1.1.0.0, 1.1.1.0, 1.1.2.0)',
      },
      descricao: {
        type: DataTypes.STRING(255),
        allowNull: false,
        comment: 'Descrição da conta (livre digitação)',
      },
      tipo: {
        type: DataTypes.ENUM('SINTETICA', 'ANALITICA'),
        allowNull: false,
        defaultValue: 'SINTETICA',
        comment: 'Tipo da conta: Sintética ou Analítica',
      },
      classificacao: {
        type: DataTypes.STRING(100),
        allowNull: true,
        comment: 'Classificação da conta (cadastro de classificação)',
      },
      contaPaiId: {
        type: DataTypes.INTEGER,
        allowNull: true,
        comment: 'ID da conta pai (para hierarquia). NULL para contas de primeiro nível',
        references: {
          model: 'C013_planoContaGerencial',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
      },
      nivel: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 1,
        comment: 'Nível hierárquico da conta (1 a 4)',
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
    await queryInterface.addIndex('C013_planoContaGerencial', ['item'], {
      unique: true,
      name: 'idx_planoContaGerencial_item_unique',
    });

    await queryInterface.addIndex('C013_planoContaGerencial', ['tenantId'], {
      name: 'idx_planoContaGerencial_tenantId',
    });

    await queryInterface.addIndex('C013_planoContaGerencial', ['contaPaiId'], {
      name: 'idx_planoContaGerencial_contaPaiId',
    });

    await queryInterface.addIndex('C013_planoContaGerencial', ['tipo'], {
      name: 'idx_planoContaGerencial_tipo',
    });

    await queryInterface.addIndex('C013_planoContaGerencial', ['nivel'], {
      name: 'idx_planoContaGerencial_nivel',
    });

    await queryInterface.addIndex('C013_planoContaGerencial', ['usercreation'], {
      name: 'idx_planoContaGerencial_usercreation',
    });
  }
}

export async function down(queryInterface: QueryInterface): Promise<void> {
  await queryInterface.dropTable('C013_planoContaGerencial');
}
