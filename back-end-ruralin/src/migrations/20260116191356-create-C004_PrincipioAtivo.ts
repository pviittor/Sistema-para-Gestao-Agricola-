import { QueryInterface, DataTypes } from 'sequelize';

/**
 * Migration: Criar tabela C004_PrincipioAtivo
 * 
 * Esta migration cria a tabela C004_PrincipioAtivo com todos os campos necessários,
 * incluindo campos de auditoria (usercreation, datecreation).
 */
export async function up(queryInterface: QueryInterface): Promise<void> {
  await queryInterface.createTable('C004_PrincipioAtivo', {
    id_principio: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
      comment: 'ID único do princípio ativo',
    },
    tenantId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: 'ID do tenant ao qual o princípio ativo pertence',
    },
    descricao_principio: {
      type: DataTypes.STRING(255),
      allowNull: false,
      comment: 'Descrição do princípio ativo',
    },
    classe_principio: {
      type: DataTypes.STRING(100),
      allowNull: true,
      comment: 'Classe do princípio ativo',
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

  // Índice para tenantId (multi-tenancy)
  await queryInterface.addIndex('C004_PrincipioAtivo', ['tenantId'], {
    name: 'idx_C004_PrincipioAtivo_tenantId',
  });

  // Índice para usercreation (auditoria)
  await queryInterface.addIndex('C004_PrincipioAtivo', ['usercreation'], {
    name: 'idx_C004_PrincipioAtivo_usercreation',
  });
}

export async function down(queryInterface: QueryInterface): Promise<void> {
  await queryInterface.removeIndex('C004_PrincipioAtivo', 'idx_C004_PrincipioAtivo_usercreation');
  await queryInterface.removeIndex('C004_PrincipioAtivo', 'idx_C004_PrincipioAtivo_tenantId');
  await queryInterface.dropTable('C004_PrincipioAtivo');
}
