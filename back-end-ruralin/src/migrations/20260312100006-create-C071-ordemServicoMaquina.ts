import { DataTypes, QueryInterface } from 'sequelize';

export async function up(queryInterface: QueryInterface): Promise<void> {
  await queryInterface.createTable('C071_ordemServicoMaquina', {
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
    maquinaId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'C030_maquina',
        key: 'id_mqn',
      },
      onUpdate: 'CASCADE',
      onDelete: 'RESTRICT',
    },
    implementoId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'C030_maquina',
        key: 'id_mqn',
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL',
    },
    operadorId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'C001_PESSOA',
        key: 'id_pessoa',
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL',
    },
    horasPlanejadas: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
    },
    custoHoraPlanejado: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: true,
    },
    horasReais: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
    },
    custoHoraReal: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: true,
    },
    horimetroInicio: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: true,
    },
    horimetroFim: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: true,
    },
    areaTrabalhada: {
      type: DataTypes.DECIMAL(18, 4),
      allowNull: true,
    },
    consumoCombustivel: {
      type: DataTypes.DECIMAL(10, 2),
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

  await queryInterface.addIndex('C071_ordemServicoMaquina', ['ordemServicoId'], {
    name: 'idx_osMaquina_ordemServico',
  });
}

export async function down(queryInterface: QueryInterface): Promise<void> {
  await queryInterface.dropTable('C071_ordemServicoMaquina');
}
