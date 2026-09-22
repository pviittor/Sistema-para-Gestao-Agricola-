import { QueryInterface, DataTypes } from 'sequelize';

/**
 * Migration: Criar tabela C003_SubGrupoProduto
 * 
 * Esta migration cria a tabela C003_SubGrupoProduto com todos os campos necessários.
 */
export async function up(queryInterface: QueryInterface): Promise<void> {
  await queryInterface.createTable('C003_SubGrupoProduto', {
    id_sub: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
      comment: 'ID único do subgrupo de produto',
    },
    tenantId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: 'ID do tenant ao qual o subgrupo de produto pertence',
    },
    descricao_sub: {
      type: DataTypes.STRING(255),
      allowNull: false,
      comment: 'Descrição do subgrupo de produto',
    },
    idGrupo: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: 'ID do grupo de produto ao qual o subgrupo pertence',
      references: {
        model: 'grupos_produto',
        key: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'RESTRICT',
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
  await queryInterface.addIndex('C003_SubGrupoProduto', ['tenantId'], {
    name: 'idx_C003_SubGrupoProduto_tenantId',
  });

  // Índice para idGrupo (relacionamento)
  await queryInterface.addIndex('C003_SubGrupoProduto', ['idGrupo'], {
    name: 'idx_C003_SubGrupoProduto_idGrupo',
  });
}

export async function down(queryInterface: QueryInterface): Promise<void> {
  await queryInterface.removeIndex('C003_SubGrupoProduto', 'idx_C003_SubGrupoProduto_idGrupo');
  await queryInterface.removeIndex('C003_SubGrupoProduto', 'idx_C003_SubGrupoProduto_tenantId');
  await queryInterface.dropTable('C003_SubGrupoProduto');
}
