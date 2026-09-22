import { QueryInterface, DataTypes } from 'sequelize';

/**
 * Migration: Criar tabela C007_moedaCotacao
 */
export async function up(queryInterface: QueryInterface): Promise<void> {
  await queryInterface.createTable('C007_moedaCotacao', {
    id_cotacao: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
      comment: 'ID único da cotação',
    },
    tenantId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: 'ID do tenant ao qual a cotação pertence',
    },
    idMoeda: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: 'ID da moeda relacionada',
      references: {
        model: 'C006_moeda',
        key: 'id_moeda',
      },
      onUpdate: 'CASCADE',
      onDelete: 'RESTRICT',
    },
    data_cotacao: {
      type: DataTypes.DATEONLY,
      allowNull: false,
      comment: 'Data da cotação',
    },
    valor_cotacao: {
      type: DataTypes.DECIMAL(18, 4),
      allowNull: false,
      comment: 'Valor da cotação',
    },
    fechamento_cotaca: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
      comment: 'Indica se é fechamento oficial (preço de ajuste)',
    },
  });

  await queryInterface.addIndex('C007_moedaCotacao', ['tenantId'], {
    name: 'idx_C007_moedaCotacao_tenantId',
  });

  await queryInterface.addIndex('C007_moedaCotacao', ['idMoeda'], {
    name: 'idx_C007_moedaCotacao_idMoeda',
  });

  await queryInterface.addIndex('C007_moedaCotacao', ['data_cotacao'], {
    name: 'idx_C007_moedaCotacao_data_cotacao',
  });
}

export async function down(queryInterface: QueryInterface): Promise<void> {
  await queryInterface.removeIndex('C007_moedaCotacao', 'idx_C007_moedaCotacao_data_cotacao');
  await queryInterface.removeIndex('C007_moedaCotacao', 'idx_C007_moedaCotacao_idMoeda');
  await queryInterface.removeIndex('C007_moedaCotacao', 'idx_C007_moedaCotacao_tenantId');
  await queryInterface.dropTable('C007_moedaCotacao');
}
