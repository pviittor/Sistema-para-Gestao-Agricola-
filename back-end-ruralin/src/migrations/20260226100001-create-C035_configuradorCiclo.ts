import { QueryInterface, DataTypes, QueryTypes } from 'sequelize';

/**
 * Migration: Criar tabela C035_configuradorCiclo
 *
 * Esta migration cria a tabela C035_configuradorCiclo para configuração de ciclos de plantio/colheita.
 */
export async function up(queryInterface: QueryInterface): Promise<void> {
  // Verificar se a tabela já existe
  const tables = await queryInterface.sequelize.query(`
    SELECT TABLE_NAME
    FROM INFORMATION_SCHEMA.TABLES
    WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME = 'C035_configuradorCiclo';
  `, {
    type: QueryTypes.SELECT,
  }) as any[];

  const tableExists = tables && tables.length > 0;

  if (!tableExists) {
    await queryInterface.createTable('C035_configuradorCiclo', {
      id_cfg: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        comment: 'ID único do configurador de ciclo (auto-increment)',
      },
      tenantId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        comment: 'ID do tenant ao qual o configurador pertence',
      },
      idTalhao: {
        type: DataTypes.INTEGER,
        allowNull: false,
        comment: 'ID do talhão',
        references: {
          model: 'C034_talhao',
          key: 'id_talhao',
        },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT',
      },
      idCiclo: {
        type: DataTypes.INTEGER,
        allowNull: false,
        comment: 'ID do ciclo/safra',
        references: {
          model: 'C017_safra',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT',
      },
      idCultura: {
        type: DataTypes.INTEGER,
        allowNull: false,
        comment: 'ID da cultura',
        references: {
          model: 'C009_cultura',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT',
      },
      idVariedadeCiclo: {
        type: DataTypes.INTEGER,
        allowNull: true,
        comment: 'ID da variedade do ciclo (produto)',
        references: {
          model: 'C008_produto',
          key: 'id_prod',
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
      },
      inicioPlantio: {
        type: DataTypes.DATEONLY,
        allowNull: true,
        comment: 'Data de início do plantio',
      },
      fimPlantio: {
        type: DataTypes.DATEONLY,
        allowNull: true,
        comment: 'Data de fim do plantio',
      },
      previsaoColheita: {
        type: DataTypes.DATEONLY,
        allowNull: true,
        comment: 'Previsão de colheita',
      },
      inicioColheita: {
        type: DataTypes.DATEONLY,
        allowNull: true,
        comment: 'Data de início da colheita',
      },
      fimColheita: {
        type: DataTypes.DATEONLY,
        allowNull: true,
        comment: 'Data de fim da colheita',
      },
      observacao: {
        type: DataTypes.TEXT,
        allowNull: true,
        comment: 'Observações gerais',
      },
      areaPlantada: {
        type: DataTypes.DECIMAL(18, 4),
        allowNull: true,
        comment: 'Área plantada',
      },
      estimativaProducao: {
        type: DataTypes.DECIMAL(18, 4),
        allowNull: true,
        comment: 'Estimativa de produção',
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
    await queryInterface.addIndex('C035_configuradorCiclo', ['tenantId'], {
      name: 'idx_configuradorCiclo_tenantId',
    });

    await queryInterface.addIndex('C035_configuradorCiclo', ['idTalhao'], {
      name: 'idx_configuradorCiclo_idTalhao',
    });

    await queryInterface.addIndex('C035_configuradorCiclo', ['idCiclo'], {
      name: 'idx_configuradorCiclo_idCiclo',
    });

    await queryInterface.addIndex('C035_configuradorCiclo', ['idCultura'], {
      name: 'idx_configuradorCiclo_idCultura',
    });

    await queryInterface.addIndex('C035_configuradorCiclo', ['idTalhao', 'idCiclo', 'idCultura'], {
      name: 'idx_configuradorCiclo_talhao_ciclo_cultura',
    });
  }
}

export async function down(queryInterface: QueryInterface): Promise<void> {
  await queryInterface.dropTable('C035_configuradorCiclo');
}
