import { QueryInterface, DataTypes, QueryTypes } from 'sequelize';

/**
 * Migration: Criar tabela C037_atividadeOperacao
 *
 * Esta migration cria a tabela C037_atividadeOperacao para cadastro de operações de atividades agrícolas.
 */
export async function up(queryInterface: QueryInterface): Promise<void> {
  // Verificar se a tabela já existe
  const tables = await queryInterface.sequelize.query(`
    SELECT TABLE_NAME
    FROM INFORMATION_SCHEMA.TABLES
    WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME = 'C037_atividadeOperacao';
  `, {
    type: QueryTypes.SELECT,
  }) as any[];

  const tableExists = tables && tables.length > 0;

  if (!tableExists) {
    await queryInterface.createTable('C037_atividadeOperacao', {
      id_op: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        comment: 'ID único da operação (auto-increment)',
      },
      tenantId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        comment: 'ID do tenant ao qual a operação pertence',
      },
      descricao: {
        type: DataTypes.STRING(255),
        allowNull: false,
        comment: 'Descrição da operação',
      },
      idAtividade: {
        type: DataTypes.INTEGER,
        allowNull: false,
        comment: 'ID da atividade agrícola',
        references: {
          model: 'C036_atividadeAgricola',
          key: 'id_atv',
        },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT',
      },
      financeiro: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
        comment: 'Indica se a operação é financeira',
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
    await queryInterface.addIndex('C037_atividadeOperacao', ['tenantId'], {
      name: 'idx_atividadeOperacao_tenantId',
    });

    await queryInterface.addIndex('C037_atividadeOperacao', ['idAtividade'], {
      name: 'idx_atividadeOperacao_idAtividade',
    });

    await queryInterface.addIndex('C037_atividadeOperacao', ['usercreation'], {
      name: 'idx_atividadeOperacao_usercreation',
    });
  }
}

export async function down(queryInterface: QueryInterface): Promise<void> {
  await queryInterface.dropTable('C037_atividadeOperacao');
}
