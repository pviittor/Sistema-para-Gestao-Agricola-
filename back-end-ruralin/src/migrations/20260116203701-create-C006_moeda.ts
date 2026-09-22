import { QueryInterface, DataTypes } from 'sequelize';

/**
 * Migration: Criar tabela C006_moeda
 */
export async function up(queryInterface: QueryInterface): Promise<void> {
  await queryInterface.createTable('C006_moeda', {
    id_moeda: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
      comment: 'ID único da moeda',
    },
    tenantId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: 'ID do tenant ao qual a moeda pertence',
    },
    descricao_moeda: {
      type: DataTypes.STRING(255),
      allowNull: false,
      comment: 'Descrição da moeda',
    },
    simbolo_moeda: {
      type: DataTypes.STRING(10),
      allowNull: true,
      comment: 'Símbolo da moeda (ex: R$, $, €)',
    },
    codigoIntegracaoBancoCentral: {
      type: DataTypes.STRING(50),
      allowNull: true,
      comment: 'Código de integração com Banco Central',
    },
    siglabc_moeda: {
      type: DataTypes.STRING(10),
      allowNull: true,
      comment: 'Sigla da moeda no Banco Central',
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

  await queryInterface.addIndex('C006_moeda', ['tenantId'], {
    name: 'idx_C006_moeda_tenantId',
  });

  await queryInterface.addIndex('C006_moeda', ['usercreation'], {
    name: 'idx_C006_moeda_usercreation',
  });
}

export async function down(queryInterface: QueryInterface): Promise<void> {
  await queryInterface.removeIndex('C006_moeda', 'idx_C006_moeda_usercreation');
  await queryInterface.removeIndex('C006_moeda', 'idx_C006_moeda_tenantId');
  await queryInterface.dropTable('C006_moeda');
}
