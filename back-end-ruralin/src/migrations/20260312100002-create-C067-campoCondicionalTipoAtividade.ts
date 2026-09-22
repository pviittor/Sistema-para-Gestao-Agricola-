import { DataTypes, QueryInterface } from 'sequelize';

export async function up(queryInterface: QueryInterface): Promise<void> {
  await queryInterface.createTable('C067_campoCondicionalTipoAtividade', {
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
    tipoAtividadeOSId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'C066_tipoAtividadeOS',
        key: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE',
    },
    nomeCampo: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    rotulo: {
      type: DataTypes.STRING(150),
      allowNull: false,
    },
    tipoCampo: {
      type: DataTypes.ENUM('TEXT', 'NUMBER', 'DATE', 'BOOLEAN', 'SELECT'),
      allowNull: false,
    },
    obrigatorio: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    opcoes: {
      type: DataTypes.JSON,
      allowNull: true,
    },
    unidade: {
      type: DataTypes.STRING(20),
      allowNull: true,
    },
    ordem: {
      type: DataTypes.INTEGER,
      allowNull: false,
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

  await queryInterface.addIndex('C067_campoCondicionalTipoAtividade', ['tipoAtividadeOSId', 'nomeCampo'], {
    unique: true,
    name: 'idx_campoCond_tipoAtividade_nomeCampo',
  });
}

export async function down(queryInterface: QueryInterface): Promise<void> {
  await queryInterface.dropTable('C067_campoCondicionalTipoAtividade');
}
