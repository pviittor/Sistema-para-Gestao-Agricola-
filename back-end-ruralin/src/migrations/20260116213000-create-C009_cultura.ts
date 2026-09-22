import { QueryInterface, DataTypes } from 'sequelize';

/**
 * Migration: Criar tabela C009_cultura
 */
export async function up(queryInterface: QueryInterface): Promise<void> {
  await queryInterface.createTable('C009_cultura', {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
      comment: 'ID único da cultura',
    },
    tenantId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: 'ID do tenant ao qual a cultura pertence',
    },
    descricao_clt: {
      type: DataTypes.STRING(255),
      allowNull: false,
      comment: 'Descrição da cultura',
    },
    idProduto: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: 'ID do produto relacionado',
      references: {
        model: 'C008_produto',
        key: 'id_prod',
      },
      onUpdate: 'CASCADE',
      onDelete: 'RESTRICT',
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

  await queryInterface.addIndex('C009_cultura', ['tenantId'], {
    name: 'idx_C009_cultura_tenantId',
  });

  await queryInterface.addIndex('C009_cultura', ['idProduto'], {
    name: 'idx_C009_cultura_idProduto',
  });

  await queryInterface.addIndex('C009_cultura', ['usercreation'], {
    name: 'idx_C009_cultura_usercreation',
  });
}

export async function down(queryInterface: QueryInterface): Promise<void> {
  await queryInterface.removeIndex('C009_cultura', 'idx_C009_cultura_usercreation');
  await queryInterface.removeIndex('C009_cultura', 'idx_C009_cultura_idProduto');
  await queryInterface.removeIndex('C009_cultura', 'idx_C009_cultura_tenantId');
  await queryInterface.dropTable('C009_cultura');
}
