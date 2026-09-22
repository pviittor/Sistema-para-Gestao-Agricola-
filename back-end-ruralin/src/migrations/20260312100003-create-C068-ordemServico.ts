import { DataTypes, QueryInterface } from 'sequelize';

export async function up(queryInterface: QueryInterface): Promise<void> {
  await queryInterface.createTable('C068_ordemServico', {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    tenantId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'C012_tenant',
        key: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE',
    },
    numero: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: 'Número sequencial da OS por tenant',
    },
    tipoAtividadeOSId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'C066_tipoAtividadeOS',
        key: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'RESTRICT',
    },
    safraId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'C017_safra',
        key: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL',
    },
    fazendaId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'C018_fazenda',
        key: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'RESTRICT',
    },
    descricao: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    status: {
      type: DataTypes.STRING(20),
      allowNull: false,
      defaultValue: 'PLANEJADA',
    },
    prioridade: {
      type: DataTypes.STRING(20),
      allowNull: false,
      defaultValue: 'MEDIA',
    },
    dataPlanejadaInicio: {
      type: DataTypes.DATEONLY,
      allowNull: true,
    },
    dataPlanejadaFim: {
      type: DataTypes.DATEONLY,
      allowNull: true,
    },
    dataInicioReal: {
      type: DataTypes.DATEONLY,
      allowNull: true,
    },
    dataFimReal: {
      type: DataTypes.DATEONLY,
      allowNull: true,
    },
    areaPlanejadaTotal: {
      type: DataTypes.DECIMAL(18, 4),
      allowNull: true,
    },
    areaRealTotal: {
      type: DataTypes.DECIMAL(18, 4),
      allowNull: true,
    },
    custoEstimado: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: true,
    },
    custoReal: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: true,
    },
    varianciaAreaPercent: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
    },
    varianciaCustoPercent: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
    },
    varianciaDias: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    camposCondicionais: {
      type: DataTypes.JSON,
      allowNull: true,
    },
    observacoes: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    observacoesConclusao: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    motivoCancelamento: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    criadoPorId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'usuarios',
        key: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL',
    },
    atribuidoPorId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'usuarios',
        key: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL',
    },
    iniciadoPorId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'usuarios',
        key: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL',
    },
    concluidoPorId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'usuarios',
        key: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL',
    },
    validadoPorId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'usuarios',
        key: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL',
    },
    canceladoPorId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'usuarios',
        key: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL',
    },
    dataValidacao: {
      type: DataTypes.DATEONLY,
      allowNull: true,
    },
    estoqueProcessado: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    financeiroProcessado: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    createdAt: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    updatedAt: {
      type: DataTypes.DATE,
      allowNull: false,
    },
  });

  await queryInterface.addIndex('C068_ordemServico', ['tenantId', 'numero'], {
    unique: true,
    name: 'idx_ordemServico_tenant_numero',
  });

  await queryInterface.addIndex('C068_ordemServico', ['tenantId', 'status'], {
    name: 'idx_ordemServico_tenant_status',
  });

  await queryInterface.addIndex('C068_ordemServico', ['tenantId', 'dataPlanejadaInicio'], {
    name: 'idx_ordemServico_tenant_dataInicio',
  });

  await queryInterface.addIndex('C068_ordemServico', ['tenantId', 'fazendaId'], {
    name: 'idx_ordemServico_tenant_fazenda',
  });

  await queryInterface.addIndex('C068_ordemServico', ['tenantId', 'tipoAtividadeOSId'], {
    name: 'idx_ordemServico_tenant_tipoAtividade',
  });
}

export async function down(queryInterface: QueryInterface): Promise<void> {
  await queryInterface.dropTable('C068_ordemServico');
}
