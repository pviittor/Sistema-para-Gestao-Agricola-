import { DataTypes, QueryInterface } from 'sequelize';

export async function up(queryInterface: QueryInterface): Promise<void> {
  await queryInterface.createTable('C069_ordemServicoTalhao', {
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
    talhaoId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'C034_talhao',
        key: 'id_talhao',
      },
      onUpdate: 'CASCADE',
      onDelete: 'RESTRICT',
    },
    areaPlanejada: {
      type: DataTypes.DECIMAL(18, 4),
      allowNull: true,
    },
    areaReal: {
      type: DataTypes.DECIMAL(18, 4),
      allowNull: true,
    },
    percentualArea: {
      type: DataTypes.DECIMAL(5, 2),
      allowNull: true,
    },
    custoRateado: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: true,
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

  await queryInterface.addIndex('C069_ordemServicoTalhao', ['ordemServicoId', 'talhaoId'], {
    unique: true,
    name: 'idx_osTalhao_ordemServico_talhao',
  });
}

export async function down(queryInterface: QueryInterface): Promise<void> {
  await queryInterface.dropTable('C069_ordemServicoTalhao');
}
