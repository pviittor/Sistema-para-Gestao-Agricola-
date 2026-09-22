import { QueryInterface, DataTypes, QueryTypes } from 'sequelize';

/**
 * Migration: Criar tabela C038_apontamento
 *
 * Esta migration cria a tabela C038_apontamento para registro de apontamentos de atividades agricolas.
 */
export async function up(queryInterface: QueryInterface): Promise<void> {
  // Verificar se a tabela ja existe
  const tables = await queryInterface.sequelize.query(`
    SELECT TABLE_NAME
    FROM INFORMATION_SCHEMA.TABLES
    WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME = 'C038_apontamento';
  `, {
    type: QueryTypes.SELECT,
  }) as any[];

  const tableExists = tables && tables.length > 0;

  if (!tableExists) {
    await queryInterface.createTable('C038_apontamento', {
      id_apt: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        comment: 'ID unico do apontamento (auto-increment)',
      },
      tenantId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        comment: 'ID do tenant ao qual o apontamento pertence',
      },
      idConfiguracao: {
        type: DataTypes.INTEGER,
        allowNull: false,
        comment: 'ID da configuracao do ciclo',
        references: {
          model: 'C035_configuradorCiclo',
          key: 'id_cfg',
        },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT',
      },
      idAtividade: {
        type: DataTypes.INTEGER,
        allowNull: false,
        comment: 'ID da atividade agricola',
        references: {
          model: 'C036_atividadeAgricola',
          key: 'id_atv',
        },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT',
      },
      idOperacao: {
        type: DataTypes.INTEGER,
        allowNull: false,
        comment: 'ID da operacao da atividade',
        references: {
          model: 'C037_atividadeOperacao',
          key: 'id_op',
        },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT',
      },
      dataInicio: {
        type: DataTypes.DATEONLY,
        allowNull: true,
        comment: 'Data de inicio do apontamento (se futura = planejado)',
      },
      usercreation: {
        type: DataTypes.INTEGER,
        allowNull: false,
        comment: 'ID do usuario que criou o registro',
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
        comment: 'Data de criacao do registro',
      },
    });

    // Criar indices
    await queryInterface.addIndex('C038_apontamento', ['tenantId'], {
      name: 'idx_apontamento_tenantId',
    });

    await queryInterface.addIndex('C038_apontamento', ['idConfiguracao'], {
      name: 'idx_apontamento_idConfiguracao',
    });

    await queryInterface.addIndex('C038_apontamento', ['idAtividade'], {
      name: 'idx_apontamento_idAtividade',
    });

    await queryInterface.addIndex('C038_apontamento', ['idOperacao'], {
      name: 'idx_apontamento_idOperacao',
    });

    await queryInterface.addIndex('C038_apontamento', ['dataInicio'], {
      name: 'idx_apontamento_dataInicio',
    });

    await queryInterface.addIndex('C038_apontamento', ['usercreation'], {
      name: 'idx_apontamento_usercreation',
    });
  }
}

export async function down(queryInterface: QueryInterface): Promise<void> {
  await queryInterface.dropTable('C038_apontamento');
}
