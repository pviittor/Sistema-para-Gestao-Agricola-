import { DataTypes, QueryInterface } from 'sequelize';

export async function up(queryInterface: QueryInterface): Promise<void> {
  await queryInterface.createTable('C070_ordemServicoInsumo', {
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
    ordemServicoId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'C068_ordemServico',
        key: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE',
    },
    produtoId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'C008_produto',
        key: 'id_prod',
      },
      onUpdate: 'CASCADE',
      onDelete: 'RESTRICT',
    },
    unidadeMedidaId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'C005_unidadeMedida',
        key: 'id_unidade',
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL',
    },
    quantidadePlanejada: {
      type: DataTypes.DECIMAL(15, 4),
      allowNull: true,
    },
    custoUnitarioPlanejado: {
      type: DataTypes.DECIMAL(15, 4),
      allowNull: true,
    },
    quantidadeReal: {
      type: DataTypes.DECIMAL(15, 4),
      allowNull: true,
    },
    custoUnitarioReal: {
      type: DataTypes.DECIMAL(15, 4),
      allowNull: true,
    },
    dosagem: {
      type: DataTypes.DECIMAL(15, 4),
      allowNull: true,
    },
    areaAplicada: {
      type: DataTypes.DECIMAL(18, 4),
      allowNull: true,
    },
    movimentoEstoqueId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'C032_movimentoEstoque',
        key: 'id_mov',
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL',
    },
    observacoes: {
      type: DataTypes.TEXT,
      allowNull: true,
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

  await queryInterface.addIndex('C070_ordemServicoInsumo', ['ordemServicoId'], {
    name: 'idx_osInsumo_ordemServico',
  });
}

export async function down(queryInterface: QueryInterface): Promise<void> {
  await queryInterface.dropTable('C070_ordemServicoInsumo');
}
