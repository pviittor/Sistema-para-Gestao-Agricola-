import { QueryInterface, DataTypes, QueryTypes } from 'sequelize';

/**
 * Migration: Criar tabela C042_benfeitoria
 *
 * Esta migration cria a tabela C042_benfeitoria para registro de benfeitorias em fazendas.
 */
export async function up(queryInterface: QueryInterface): Promise<void> {
  // Verificar se a tabela já existe
  const tables = await queryInterface.sequelize.query(`
    SELECT TABLE_NAME
    FROM INFORMATION_SCHEMA.TABLES
    WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME = 'C042_benfeitoria';
  `, {
    type: QueryTypes.SELECT,
  }) as any[];

  const tableExists = tables && tables.length > 0;

  if (!tableExists) {
    await queryInterface.createTable('C042_benfeitoria', {
      id_benf: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        comment: 'ID único da benfeitoria (auto-increment)',
      },
      tenantId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        comment: 'ID do tenant ao qual o registro pertence',
      },
      descricao: {
        type: DataTypes.STRING(255),
        allowNull: false,
        comment: 'Descrição da benfeitoria',
      },
      valortotal: {
        type: DataTypes.DECIMAL(18, 4),
        allowNull: false,
        comment: 'Valor total da benfeitoria',
      },
      vidautil: {
        type: DataTypes.INTEGER,
        allowNull: false,
        comment: 'Vida útil em anos',
      },
      percsucata: {
        type: DataTypes.DECIMAL(18, 4),
        allowNull: false,
        comment: 'Percentual de sucata',
      },
      depreciacaoano: {
        type: DataTypes.DECIMAL(18, 4),
        allowNull: false,
        comment: 'Depreciação anual',
      },
      taxamanutencao: {
        type: DataTypes.DECIMAL(18, 4),
        allowNull: false,
        comment: 'Taxa de manutenção',
      },
      manutencaoano: {
        type: DataTypes.DECIMAL(18, 4),
        allowNull: false,
        comment: 'Manutenção anual',
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
      idUnidadeMedida: {
        type: DataTypes.INTEGER,
        allowNull: true,
        comment: 'ID da unidade de medida',
        references: {
          model: 'C005_unidadeMedida',
          key: 'id_unidade',
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
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
      data: {
        type: DataTypes.DATEONLY,
        allowNull: true,
        comment: 'Data da benfeitoria',
      },
      observacao: {
        type: DataTypes.TEXT,
        allowNull: true,
        comment: 'Observações adicionais',
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
    await queryInterface.addIndex('C042_benfeitoria', ['tenantId'], {
      name: 'idx_benf_tenantId',
    });

    await queryInterface.addIndex('C042_benfeitoria', ['idFazenda'], {
      name: 'idx_benf_idFazenda',
    });

    await queryInterface.addIndex('C042_benfeitoria', ['idSafra'], {
      name: 'idx_benf_idSafra',
    });
  }
}

export async function down(queryInterface: QueryInterface): Promise<void> {
  await queryInterface.dropTable('C042_benfeitoria');
}
