import { QueryInterface, DataTypes, QueryTypes } from 'sequelize';

/**
 * Migration: Criar tabela C031_abastecimento
 *
 * Esta migration cria a tabela C031_abastecimento para registro de abastecimentos de máquinas/veículos.
 */
export async function up(queryInterface: QueryInterface): Promise<void> {
  // Verificar se a tabela já existe
  const tables = await queryInterface.sequelize.query(`
    SELECT TABLE_NAME
    FROM INFORMATION_SCHEMA.TABLES
    WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME = 'C031_abastecimento';
  `, {
    type: QueryTypes.SELECT,
  }) as any[];

  const tableExists = tables && tables.length > 0;

  if (!tableExists) {
    await queryInterface.createTable('C031_abastecimento', {
      id_abast: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        comment: 'ID único do abastecimento (auto-increment)',
      },
      tenantId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        comment: 'ID do tenant ao qual o abastecimento pertence',
      },
      data: {
        type: DataTypes.DATEONLY,
        allowNull: false,
        comment: 'Data do abastecimento',
      },
      idMaquina: {
        type: DataTypes.INTEGER,
        allowNull: false,
        comment: 'ID da máquina abastecida',
        references: {
          model: 'C030_maquina',
          key: 'id_mqn',
        },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT',
      },
      kminicio: {
        type: DataTypes.DECIMAL(18, 4),
        allowNull: false,
        comment: 'Km/horímetro início',
      },
      kmfim: {
        type: DataTypes.DECIMAL(18, 4),
        allowNull: false,
        comment: 'Km/horímetro fim',
      },
      idOperador: {
        type: DataTypes.INTEGER,
        allowNull: true,
        comment: 'ID do operador da máquina (pessoa)',
        references: {
          model: 'C001_PESSOA',
          key: 'id_pessoa',
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
      },
      idCombustivel: {
        type: DataTypes.INTEGER,
        allowNull: false,
        comment: 'ID do combustível usado (produto)',
        references: {
          model: 'C008_produto',
          key: 'id_prod',
        },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT',
      },
      volume: {
        type: DataTypes.DECIMAL(18, 4),
        allowNull: false,
        comment: 'Volume abastecido (litros)',
      },
      preco: {
        type: DataTypes.DECIMAL(18, 4),
        allowNull: false,
        comment: 'Preço por litro',
      },
      total: {
        type: DataTypes.DECIMAL(18, 4),
        allowNull: false,
        comment: 'Total (volume × preço)',
      },
      idFazenda: {
        type: DataTypes.INTEGER,
        allowNull: false,
        comment: 'ID da fazenda',
        references: {
          model: 'C018_fazenda',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT',
      },
      idCicloAbastecimento: {
        type: DataTypes.INTEGER,
        allowNull: true,
        comment: 'ID do ciclo/safra de abastecimento',
        references: {
          model: 'C017_safra',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
      },
      idOperadorAbastecimento: {
        type: DataTypes.INTEGER,
        allowNull: true,
        comment: 'ID do operador do abastecimento (pessoa)',
        references: {
          model: 'C001_PESSOA',
          key: 'id_pessoa',
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
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
    await queryInterface.addIndex('C031_abastecimento', ['tenantId'], {
      name: 'idx_abastecimento_tenantId',
    });

    await queryInterface.addIndex('C031_abastecimento', ['idMaquina'], {
      name: 'idx_abastecimento_idMaquina',
    });

    await queryInterface.addIndex('C031_abastecimento', ['idOperador'], {
      name: 'idx_abastecimento_idOperador',
    });

    await queryInterface.addIndex('C031_abastecimento', ['idCombustivel'], {
      name: 'idx_abastecimento_idCombustivel',
    });

    await queryInterface.addIndex('C031_abastecimento', ['idFazenda'], {
      name: 'idx_abastecimento_idFazenda',
    });

    await queryInterface.addIndex('C031_abastecimento', ['idCicloAbastecimento'], {
      name: 'idx_abastecimento_idCicloAbastecimento',
    });

    await queryInterface.addIndex('C031_abastecimento', ['data'], {
      name: 'idx_abastecimento_data',
    });

    await queryInterface.addIndex('C031_abastecimento', ['usercreation'], {
      name: 'idx_abastecimento_usercreation',
    });
  }
}

export async function down(queryInterface: QueryInterface): Promise<void> {
  await queryInterface.dropTable('C031_abastecimento');
}
