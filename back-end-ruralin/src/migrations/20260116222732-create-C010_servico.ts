import { QueryInterface, DataTypes } from 'sequelize';

/**
 * Migration: Criar tabela C010_servico
 */
export async function up(queryInterface: QueryInterface): Promise<void> {
  await queryInterface.createTable('C010_servico', {
    id_srv: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
      comment: 'ID único do serviço agrícola',
    },
    tenantId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: 'ID do tenant ao qual o serviço pertence',
    },
    descricao_srv: {
      type: DataTypes.STRING(255),
      allowNull: false,
      comment: 'Descrição do serviço agrícola',
    },
    financeiro_srv: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
      comment: 'Indica se o serviço gera movimento financeiro (futuro)',
    },
    observacao_srv: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: 'Observações sobre o serviço',
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

  await queryInterface.addIndex('C010_servico', ['tenantId'], {
    name: 'idx_C010_servico_tenantId',
  });

  await queryInterface.addIndex('C010_servico', ['usercreation'], {
    name: 'idx_C010_servico_usercreation',
  });
}

export async function down(queryInterface: QueryInterface): Promise<void> {
  await queryInterface.removeIndex('C010_servico', 'idx_C010_servico_usercreation');
  await queryInterface.removeIndex('C010_servico', 'idx_C010_servico_tenantId');
  await queryInterface.dropTable('C010_servico');
}
