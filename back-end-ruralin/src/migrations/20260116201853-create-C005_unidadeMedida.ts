import { QueryInterface, DataTypes } from 'sequelize';

/**
 * Migration: Criar tabela C005_unidadeMedida
 * 
 * Esta migration cria a tabela C005_unidadeMedida com todos os campos necessários,
 * incluindo campos de auditoria (usercreation, datecreation).
 */
export async function up(queryInterface: QueryInterface): Promise<void> {
  await queryInterface.createTable('C005_unidadeMedida', {
    id_unidade: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
      comment: 'ID único da unidade de medida',
    },
    tenantId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: 'ID do tenant ao qual a unidade de medida pertence',
    },
    descricao_unidade: {
      type: DataTypes.STRING(255),
      allowNull: false,
      comment: 'Descrição da unidade de medida',
    },
    abreviatura_unidade: {
      type: DataTypes.STRING(20),
      allowNull: true,
      comment: 'Abreviatura da unidade de medida',
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
  await queryInterface.addIndex('C005_unidadeMedida', ['tenantId'], {
    name: 'idx_C005_unidadeMedida_tenantId',
  });

  // Índice para usercreation (auditoria)
  await queryInterface.addIndex('C005_unidadeMedida', ['usercreation'], {
    name: 'idx_C005_unidadeMedida_usercreation',
  });
}

export async function down(queryInterface: QueryInterface): Promise<void> {
  await queryInterface.removeIndex('C005_unidadeMedida', 'idx_C005_unidadeMedida_usercreation');
  await queryInterface.removeIndex('C005_unidadeMedida', 'idx_C005_unidadeMedida_tenantId');
  await queryInterface.dropTable('C005_unidadeMedida');
}
