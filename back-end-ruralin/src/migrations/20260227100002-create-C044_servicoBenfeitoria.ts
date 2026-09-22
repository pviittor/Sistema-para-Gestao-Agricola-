import { QueryInterface, DataTypes, QueryTypes } from 'sequelize';

/**
 * Migration: Criar tabela C044_servicoBenfeitoria
 *
 * Esta migration cria a tabela C044_servicoBenfeitoria para registro de servicos em benfeitorias.
 */
export async function up(queryInterface: QueryInterface): Promise<void> {
  // Verificar se a tabela ja existe
  const tables = await queryInterface.sequelize.query(`
    SELECT TABLE_NAME
    FROM INFORMATION_SCHEMA.TABLES
    WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME = 'C044_servicoBenfeitoria';
  `, {
    type: QueryTypes.SELECT,
  }) as any[];

  const tableExists = tables && tables.length > 0;

  if (!tableExists) {
    await queryInterface.createTable('C044_servicoBenfeitoria', {
      id_srvbenf: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        comment: 'ID unico do servico de benfeitoria (auto-increment)',
      },
      tenantId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        comment: 'ID do tenant ao qual o registro pertence',
      },
      idBenfeitoria: {
        type: DataTypes.INTEGER,
        allowNull: false,
        comment: 'ID da benfeitoria relacionada',
        references: {
          model: 'C042_benfeitoria',
          key: 'id_benf',
        },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT',
      },
      idServico: {
        type: DataTypes.INTEGER,
        allowNull: false,
        comment: 'ID do servico agricola',
        references: {
          model: 'C010_servico',
          key: 'id_srv',
        },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT',
      },
      idResponsavel: {
        type: DataTypes.INTEGER,
        allowNull: false,
        comment: 'ID do responsavel pelo servico (pessoa)',
        references: {
          model: 'C001_PESSOA',
          key: 'id_pessoa',
        },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT',
      },
      idMoeda: {
        type: DataTypes.INTEGER,
        allowNull: true,
        comment: 'ID da moeda utilizada',
        references: {
          model: 'C006_moeda',
          key: 'id_moeda',
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
      },
      idPagar: {
        type: DataTypes.INTEGER,
        allowNull: true,
        comment: 'ID do titulo a pagar relacionado',
        references: {
          model: 'C019_tituloPagar',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
      },
      data: {
        type: DataTypes.DATEONLY,
        allowNull: false,
        comment: 'Data do servico',
      },
      valor: {
        type: DataTypes.DECIMAL(18, 4),
        allowNull: false,
        comment: 'Valor do servico',
      },
      tempo: {
        type: DataTypes.DECIMAL(18, 4),
        allowNull: false,
        comment: 'Tempo gasto no servico',
      },
      observacao: {
        type: DataTypes.TEXT,
        allowNull: true,
        comment: 'Observacoes adicionais',
      },
      idSafra: {
        type: DataTypes.INTEGER,
        allowNull: true,
        comment: 'ID da safra',
        references: {
          model: 'C017_safra',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
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
    await queryInterface.addIndex('C044_servicoBenfeitoria', ['tenantId'], {
      name: 'idx_srvbenf_tenantId',
    });

    await queryInterface.addIndex('C044_servicoBenfeitoria', ['idBenfeitoria'], {
      name: 'idx_srvbenf_idBenfeitoria',
    });

    await queryInterface.addIndex('C044_servicoBenfeitoria', ['idServico'], {
      name: 'idx_srvbenf_idServico',
    });

    await queryInterface.addIndex('C044_servicoBenfeitoria', ['data'], {
      name: 'idx_srvbenf_data',
    });
  }
}

export async function down(queryInterface: QueryInterface): Promise<void> {
  await queryInterface.dropTable('C044_servicoBenfeitoria');
}
