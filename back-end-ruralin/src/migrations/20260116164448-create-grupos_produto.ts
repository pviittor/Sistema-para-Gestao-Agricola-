import { QueryInterface, DataTypes } from 'sequelize';

/**
 * Migration: Criar tabela grupos_produto
 * 
 * Esta migration cria a tabela grupos_produto com todos os campos necessários.
 */
export async function up(queryInterface: QueryInterface): Promise<void> {
  await queryInterface.createTable('grupos_produto', {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
      comment: 'ID único do grupo de produto',
    },
    tenantId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: 'ID do tenant ao qual o grupo de produto pertence',
    },
    descricao_grupo: {
      type: DataTypes.STRING(255),
      allowNull: false,
      comment: 'Descrição do grupo de produto',
    },
    abreviacao_grupo: {
      type: DataTypes.STRING(50),
      allowNull: true,
      comment: 'Abreviação do grupo de produto',
    },
    createdAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
      comment: 'Data de criação',
    },
    updatedAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
      comment: 'Data de atualização',
    },
  });

  // Índice para tenantId (multi-tenancy)
  await queryInterface.addIndex('grupos_produto', ['tenantId'], {
    name: 'idx_grupos_produto_tenantId',
  });
}

export async function down(queryInterface: QueryInterface): Promise<void> {
  await queryInterface.removeIndex('grupos_produto', 'idx_grupos_produto_tenantId');
  await queryInterface.dropTable('grupos_produto');
}
