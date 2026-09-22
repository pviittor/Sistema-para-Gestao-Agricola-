import { DataTypes, QueryInterface } from 'sequelize';

export async function up(queryInterface: QueryInterface): Promise<void> {
  await queryInterface.createTable('C072_ordemServicoResponsavel', {
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
    pessoaId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'C001_PESSOA',
        key: 'id_pessoa',
      },
      onUpdate: 'CASCADE',
      onDelete: 'RESTRICT',
    },
    funcao: {
      type: DataTypes.STRING(20),
      allowNull: false,
      defaultValue: 'OPERADOR',
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

  await queryInterface.addIndex('C072_ordemServicoResponsavel', ['ordemServicoId'], {
    name: 'idx_osResponsavel_ordemServico',
  });
}

export async function down(queryInterface: QueryInterface): Promise<void> {
  await queryInterface.dropTable('C072_ordemServicoResponsavel');
}
