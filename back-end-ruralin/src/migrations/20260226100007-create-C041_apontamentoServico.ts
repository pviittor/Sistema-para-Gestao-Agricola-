import { QueryInterface, DataTypes, QueryTypes } from 'sequelize';

/**
 * Migration: Criar tabela C041_apontamentoServico
 *
 * Esta migration cria a tabela C041_apontamentoServico para registro de serviços em apontamentos agrícolas.
 */
export async function up(queryInterface: QueryInterface): Promise<void> {
  // Verificar se a tabela já existe
  const tables = await queryInterface.sequelize.query(`
    SELECT TABLE_NAME
    FROM INFORMATION_SCHEMA.TABLES
    WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME = 'C041_apontamentoServico';
  `, {
    type: QueryTypes.SELECT,
  }) as any[];

  const tableExists = tables && tables.length > 0;

  if (!tableExists) {
    await queryInterface.createTable('C041_apontamentoServico', {
      id_aptsrv: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        comment: 'ID único do apontamento de serviço (auto-increment)',
      },
      tenantId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        comment: 'ID do tenant ao qual o registro pertence',
      },
      idApontamento: {
        type: DataTypes.INTEGER,
        allowNull: false,
        comment: 'ID do apontamento relacionado',
        references: {
          model: 'C038_apontamento',
          key: 'id_apt',
        },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT',
      },
      idServico: {
        type: DataTypes.INTEGER,
        allowNull: false,
        comment: 'ID do serviço agrícola',
        references: {
          model: 'C010_servicoAgricola',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT',
      },
      idResponsavel: {
        type: DataTypes.INTEGER,
        allowNull: false,
        comment: 'ID do responsável pelo serviço (pessoa)',
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
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
      },
      idPagar: {
        type: DataTypes.INTEGER,
        allowNull: true,
        comment: 'ID do título a pagar relacionado',
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
        comment: 'Data do serviço',
      },
      valor: {
        type: DataTypes.DECIMAL(18, 4),
        allowNull: false,
        comment: 'Valor do serviço',
      },
      tempo: {
        type: DataTypes.DECIMAL(18, 4),
        allowNull: false,
        comment: 'Tempo gasto no serviço',
      },
      observacao: {
        type: DataTypes.TEXT,
        allowNull: true,
        comment: 'Observações adicionais',
      },
      quantidadeTon: {
        type: DataTypes.DECIMAL(18, 4),
        allowNull: false,
        comment: 'Quantidade em toneladas',
      },
      unitarioTon: {
        type: DataTypes.DECIMAL(18, 4),
        allowNull: false,
        comment: 'Valor unitário por tonelada',
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
    await queryInterface.addIndex('C041_apontamentoServico', ['tenantId'], {
      name: 'idx_aptsrv_tenantId',
    });

    await queryInterface.addIndex('C041_apontamentoServico', ['idApontamento'], {
      name: 'idx_aptsrv_idApontamento',
    });

    await queryInterface.addIndex('C041_apontamentoServico', ['idServico'], {
      name: 'idx_aptsrv_idServico',
    });

    await queryInterface.addIndex('C041_apontamentoServico', ['data'], {
      name: 'idx_aptsrv_data',
    });

    await queryInterface.addIndex('C041_apontamentoServico', ['usercreation'], {
      name: 'idx_aptsrv_usercreation',
    });
  }
}

export async function down(queryInterface: QueryInterface): Promise<void> {
  await queryInterface.dropTable('C041_apontamentoServico');
}
