import { QueryInterface, DataTypes } from 'sequelize';

/**
 * Migration: Criar tabela C008_produto
 */
export async function up(queryInterface: QueryInterface): Promise<void> {
  await queryInterface.createTable('C008_produto', {
    id_prod: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
      comment: 'ID único do produto',
    },
    tenantId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: 'ID do tenant ao qual o produto pertence',
    },
    descricao_prod: {
      type: DataTypes.STRING(255),
      allowNull: false,
      comment: 'Descrição do produto',
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
    pesoliquido_prod: {
      type: DataTypes.DECIMAL(18, 4),
      allowNull: false,
      comment: 'Peso líquido do produto',
    },
    idGrupo: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: 'ID do grupo de produto',
      references: {
        model: 'grupos_produto',
        key: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'RESTRICT',
    },
    idSubGrupo: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: 'ID do subgrupo de produto',
      references: {
        model: 'C003_SubGrupoProduto',
        key: 'id_sub',
      },
      onUpdate: 'CASCADE',
      onDelete: 'RESTRICT',
    },
    idPrincipioAtivo: {
      type: DataTypes.INTEGER,
      allowNull: true,
      comment: 'ID do princípio ativo',
      references: {
        model: 'C004_PrincipioAtivo',
        key: 'id_principio',
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL',
    },
    idFabricante: {
      type: DataTypes.INTEGER,
      allowNull: true,
      comment: 'ID do fabricante (pessoa)',
      references: {
        model: 'C001_PESSOA',
        key: 'id_pessoa',
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL',
    },
    precomedio_prod: {
      type: DataTypes.DECIMAL(18, 4),
      allowNull: false,
      comment: 'Preço médio do produto',
    },
    valorultimaentrada_prod: {
      type: DataTypes.DECIMAL(18, 4),
      allowNull: false,
      comment: 'Valor da última entrada do produto',
    },
    dataultimaentrada_prod: {
      type: DataTypes.DATE,
      allowNull: true,
      comment: 'Data da última entrada do produto',
    },
    combustivel_prod: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
      comment: 'Indica se o produto é combustível',
    },
    custoUltimoCusto_prod: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
      comment: 'Indica se o produto utiliza o último custo',
    },
    valorUltimoCusto_prod: {
      type: DataTypes.DECIMAL(18, 4),
      allowNull: false,
      comment: 'Valor do último custo do produto',
    },
    atualizacaoCusto_prod: {
      type: DataTypes.DATE,
      allowNull: true,
      comment: 'Data de atualização do custo',
    },
    observacao_prod: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: 'Observações sobre o produto',
    },
    idIndexador: {
      type: DataTypes.INTEGER,
      allowNull: true,
      comment: 'ID do indexador (moeda)',
      references: {
        model: 'C006_moeda',
        key: 'id_moeda',
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL',
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

  await queryInterface.addIndex('C008_produto', ['tenantId'], {
    name: 'idx_C008_produto_tenantId',
  });

  await queryInterface.addIndex('C008_produto', ['idUnidadeMedida'], {
    name: 'idx_C008_produto_idUnidadeMedida',
  });

  await queryInterface.addIndex('C008_produto', ['idGrupo'], {
    name: 'idx_C008_produto_idGrupo',
  });

  await queryInterface.addIndex('C008_produto', ['idSubGrupo'], {
    name: 'idx_C008_produto_idSubGrupo',
  });

  await queryInterface.addIndex('C008_produto', ['usercreation'], {
    name: 'idx_C008_produto_usercreation',
  });
}

export async function down(queryInterface: QueryInterface): Promise<void> {
  await queryInterface.removeIndex('C008_produto', 'idx_C008_produto_usercreation');
  await queryInterface.removeIndex('C008_produto', 'idx_C008_produto_idSubGrupo');
  await queryInterface.removeIndex('C008_produto', 'idx_C008_produto_idGrupo');
  await queryInterface.removeIndex('C008_produto', 'idx_C008_produto_idUnidadeMedida');
  await queryInterface.removeIndex('C008_produto', 'idx_C008_produto_tenantId');
  await queryInterface.dropTable('C008_produto');
}
