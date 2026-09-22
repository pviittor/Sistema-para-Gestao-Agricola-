import { DataTypes, QueryInterface } from 'sequelize';

export async function up(queryInterface: QueryInterface): Promise<void> {
  await queryInterface.createTable('C066_tipoAtividadeOS', {
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
    nome: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    descricao: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    categoria: {
      type: DataTypes.ENUM('AGRICOLA', 'PECUARIA', 'ADMINISTRATIVA', 'MANUTENCAO'),
      allowNull: false,
    },
    icone: {
      type: DataTypes.STRING(50),
      allowNull: true,
    },
    cor: {
      type: DataTypes.STRING(7),
      allowNull: true,
    },
    ativo: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
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

  await queryInterface.addIndex('C066_tipoAtividadeOS', ['tenantId', 'nome'], {
    unique: true,
    name: 'idx_tipoAtividadeOS_tenant_nome',
  });

  await queryInterface.addIndex('C066_tipoAtividadeOS', ['tenantId'], {
    name: 'idx_tipoAtividadeOS_tenantId',
  });
}

export async function down(queryInterface: QueryInterface): Promise<void> {
  await queryInterface.dropTable('C066_tipoAtividadeOS');
}
