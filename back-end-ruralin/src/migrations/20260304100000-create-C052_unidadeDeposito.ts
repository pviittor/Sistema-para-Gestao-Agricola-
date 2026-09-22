import { QueryInterface, DataTypes } from 'sequelize';

/**
 * Migration: Criar tabela C052_unidadeDeposito
 */
export async function up(queryInterface: QueryInterface): Promise<void> {
  await queryInterface.createTable('C052_unidadeDeposito', {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
      comment: 'ID único da unidade de depósito',
    },
    tenantId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: 'ID do tenant ao qual a unidade de depósito pertence',
    },
    descricao: {
      type: DataTypes.STRING(200),
      allowNull: false,
      comment: 'Descrição da unidade de depósito',
    },
    tipo: {
      type: DataTypes.ENUM('Silo', 'Bag', 'Armazem', 'Outros'),
      allowNull: false,
      comment: 'Tipo da unidade de depósito',
    },
    capacidade_total: {
      type: DataTypes.DECIMAL(18, 4),
      allowNull: false,
      comment: 'Capacidade total da unidade de depósito',
    },
    idUnidadeMedida: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: 'ID da unidade de medida',
      references: {
        model: 'C005_unidadeMedida',
        key: 'id_unidade',
      },
      onUpdate: 'CASCADE',
      onDelete: 'RESTRICT',
    },
    idProduto: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: 'ID do produto armazenado',
      references: {
        model: 'C008_produto',
        key: 'id_prod',
      },
      onUpdate: 'CASCADE',
      onDelete: 'RESTRICT',
    },
    saldo_inicial: {
      type: DataTypes.DECIMAL(18, 4),
      allowNull: false,
      defaultValue: 0,
      comment: 'Saldo inicial da unidade de depósito',
    },
    ativo: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
      comment: 'Indica se a unidade de depósito está ativa',
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

  // Índices individuais
  await queryInterface.addIndex('C052_unidadeDeposito', ['tenantId'], {
    name: 'idx_C052_unidadeDeposito_tenantId',
  });

  await queryInterface.addIndex('C052_unidadeDeposito', ['idProduto'], {
    name: 'idx_C052_unidadeDeposito_idProduto',
  });

  await queryInterface.addIndex('C052_unidadeDeposito', ['idUnidadeMedida'], {
    name: 'idx_C052_unidadeDeposito_idUnidadeMedida',
  });

  await queryInterface.addIndex('C052_unidadeDeposito', ['tipo'], {
    name: 'idx_C052_unidadeDeposito_tipo',
  });

  await queryInterface.addIndex('C052_unidadeDeposito', ['ativo'], {
    name: 'idx_C052_unidadeDeposito_ativo',
  });

  // Índice composto
  await queryInterface.addIndex('C052_unidadeDeposito', ['tenantId', 'ativo'], {
    name: 'idx_C052_unidadeDeposito_tenantId_ativo',
  });
}

export async function down(queryInterface: QueryInterface): Promise<void> {
  await queryInterface.removeIndex('C052_unidadeDeposito', 'idx_C052_unidadeDeposito_tenantId_ativo');
  await queryInterface.removeIndex('C052_unidadeDeposito', 'idx_C052_unidadeDeposito_ativo');
  await queryInterface.removeIndex('C052_unidadeDeposito', 'idx_C052_unidadeDeposito_tipo');
  await queryInterface.removeIndex('C052_unidadeDeposito', 'idx_C052_unidadeDeposito_idUnidadeMedida');
  await queryInterface.removeIndex('C052_unidadeDeposito', 'idx_C052_unidadeDeposito_idProduto');
  await queryInterface.removeIndex('C052_unidadeDeposito', 'idx_C052_unidadeDeposito_tenantId');
  await queryInterface.dropTable('C052_unidadeDeposito');
}
