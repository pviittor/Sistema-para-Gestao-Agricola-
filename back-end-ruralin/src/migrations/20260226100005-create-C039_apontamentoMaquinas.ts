import { QueryInterface, DataTypes, QueryTypes } from 'sequelize';

/**
 * Migration: Criar tabela C039_apontamentoMaquinas
 *
 * Esta migration cria a tabela C039_apontamentoMaquinas para registro de maquinas em apontamentos.
 */
export async function up(queryInterface: QueryInterface): Promise<void> {
  // Verificar se a tabela ja existe
  const tables = await queryInterface.sequelize.query(`
    SELECT TABLE_NAME
    FROM INFORMATION_SCHEMA.TABLES
    WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME = 'C039_apontamentoMaquinas';
  `, {
    type: QueryTypes.SELECT,
  }) as any[];

  const tableExists = tables && tables.length > 0;

  if (!tableExists) {
    await queryInterface.createTable('C039_apontamentoMaquinas', {
      id_aptmaq: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        comment: 'ID unico do apontamento de maquina (auto-increment)',
      },
      tenantId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        comment: 'ID do tenant ao qual o apontamento de maquina pertence',
      },
      idApontamento: {
        type: DataTypes.INTEGER,
        allowNull: false,
        comment: 'ID do apontamento',
        references: {
          model: 'C038_apontamento',
          key: 'id_apt',
        },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT',
      },
      idMaquina: {
        type: DataTypes.INTEGER,
        allowNull: false,
        comment: 'ID da maquina',
        references: {
          model: 'C030_maquina',
          key: 'id_mqn',
        },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT',
      },
      idImplemento: {
        type: DataTypes.INTEGER,
        allowNull: true,
        comment: 'ID do implemento (maquina)',
        references: {
          model: 'C030_maquina',
          key: 'id_mqn',
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
      },
      idOperador: {
        type: DataTypes.INTEGER,
        allowNull: true,
        comment: 'ID do operador (pessoa)',
        references: {
          model: 'C001_PESSOA',
          key: 'id_pessoa',
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
      },
      idAbastecimento: {
        type: DataTypes.INTEGER,
        allowNull: true,
        comment: 'ID do abastecimento',
        references: {
          model: 'C031_abastecimento',
          key: 'id_abast',
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
      },
      data: {
        type: DataTypes.DATEONLY,
        allowNull: false,
        comment: 'Data do apontamento de maquina',
      },
      horaInicio: {
        type: DataTypes.DECIMAL(18, 4),
        allowNull: false,
        comment: 'Hora de inicio',
      },
      horaFim: {
        type: DataTypes.DECIMAL(18, 4),
        allowNull: false,
        comment: 'Hora de fim',
      },
      horaTotal: {
        type: DataTypes.DECIMAL(18, 4),
        allowNull: false,
        comment: 'Hora total',
      },
      valorHora: {
        type: DataTypes.DECIMAL(18, 4),
        allowNull: false,
        comment: 'Valor por hora da maquina',
      },
      valorHoraImpl: {
        type: DataTypes.DECIMAL(18, 4),
        allowNull: false,
        comment: 'Valor por hora do implemento',
      },
      vazao: {
        type: DataTypes.DECIMAL(18, 4),
        allowNull: false,
        comment: 'Vazao',
      },
      haBomba: {
        type: DataTypes.DECIMAL(18, 4),
        allowNull: false,
        comment: 'Hectares por bomba',
      },
      velocidade: {
        type: DataTypes.DECIMAL(18, 4),
        allowNull: false,
        comment: 'Velocidade',
      },
      pulv: {
        type: DataTypes.DECIMAL(18, 4),
        allowNull: false,
        comment: 'Pulverizacao',
      },
      consumoEstimado: {
        type: DataTypes.DECIMAL(18, 4),
        allowNull: false,
        comment: 'Consumo estimado',
      },
      estimativaCombustivelUtilizado: {
        type: DataTypes.DECIMAL(18, 4),
        allowNull: false,
        comment: 'Estimativa de combustivel utilizado',
      },
      informouAbastecimento: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
        comment: 'Indica se informou abastecimento',
      },
      consumoHRMaquina: {
        type: DataTypes.DECIMAL(18, 4),
        allowNull: false,
        comment: 'Consumo HR da maquina',
      },
      consumoHRImplemento: {
        type: DataTypes.DECIMAL(18, 4),
        allowNull: false,
        comment: 'Consumo HR do implemento',
      },
      consumoHAMaquina: {
        type: DataTypes.DECIMAL(18, 4),
        allowNull: false,
        comment: 'Consumo HA da maquina',
      },
      consumoHAImplemento: {
        type: DataTypes.DECIMAL(18, 4),
        allowNull: false,
        comment: 'Consumo HA do implemento',
      },
      custoHAMaquina: {
        type: DataTypes.DECIMAL(18, 4),
        allowNull: false,
        comment: 'Custo HA da maquina',
      },
      custoHAImplemento: {
        type: DataTypes.DECIMAL(18, 4),
        allowNull: false,
        comment: 'Custo HA do implemento',
      },
      custoHRMaquina: {
        type: DataTypes.DECIMAL(18, 4),
        allowNull: false,
        comment: 'Custo HR da maquina',
      },
      custoHRImplemento: {
        type: DataTypes.DECIMAL(18, 4),
        allowNull: false,
        comment: 'Custo HR do implemento',
      },
      areaTrabalhada: {
        type: DataTypes.DECIMAL(18, 4),
        allowNull: false,
        comment: 'Area trabalhada',
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
    await queryInterface.addIndex('C039_apontamentoMaquinas', ['tenantId'], {
      name: 'idx_apontamentoMaquinas_tenantId',
    });

    await queryInterface.addIndex('C039_apontamentoMaquinas', ['idApontamento'], {
      name: 'idx_apontamentoMaquinas_idApontamento',
    });

    await queryInterface.addIndex('C039_apontamentoMaquinas', ['idMaquina'], {
      name: 'idx_apontamentoMaquinas_idMaquina',
    });

    await queryInterface.addIndex('C039_apontamentoMaquinas', ['data'], {
      name: 'idx_apontamentoMaquinas_data',
    });

    await queryInterface.addIndex('C039_apontamentoMaquinas', ['usercreation'], {
      name: 'idx_apontamentoMaquinas_usercreation',
    });
  }
}

export async function down(queryInterface: QueryInterface): Promise<void> {
  await queryInterface.dropTable('C039_apontamentoMaquinas');
}
