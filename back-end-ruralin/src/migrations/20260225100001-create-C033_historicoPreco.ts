import { QueryInterface, DataTypes, QueryTypes } from 'sequelize';

/**
 * Migration: Criar tabela C033_historicoPreco
 *
 * Esta migration cria a tabela C033_historicoPreco para registro de histórico de preços de produtos.
 */
export async function up(queryInterface: QueryInterface): Promise<void> {
  // Verificar se a tabela já existe
  const tables = await queryInterface.sequelize.query(`
    SELECT TABLE_NAME
    FROM INFORMATION_SCHEMA.TABLES
    WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME = 'C033_historicoPreco';
  `, {
    type: QueryTypes.SELECT,
  }) as any[];

  const tableExists = tables && tables.length > 0;

  if (!tableExists) {
    await queryInterface.createTable('C033_historicoPreco', {
      id_hist: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        comment: 'ID único do histórico de preço (auto-increment)',
      },
      tenantId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        comment: 'ID do tenant ao qual o histórico pertence',
      },
      idProduto: {
        type: DataTypes.INTEGER,
        allowNull: false,
        comment: 'ID do produto',
        references: {
          model: 'C008_produto',
          key: 'id_prod',
        },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT',
      },
      idFazenda: {
        type: DataTypes.INTEGER,
        allowNull: false,
        comment: 'ID da fazenda',
        references: {
          model: 'C018_fazenda',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT',
      },
      idMovimentoEstoque: {
        type: DataTypes.INTEGER,
        allowNull: false,
        comment: 'ID do movimento de estoque que gerou o histórico',
        references: {
          model: 'C032_movimentoEstoque',
          key: 'id_mov',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      preco: {
        type: DataTypes.DECIMAL(18, 4),
        allowNull: false,
        comment: 'Preço registrado',
      },
      quantidade: {
        type: DataTypes.DECIMAL(18, 4),
        allowNull: false,
        comment: 'Quantidade movimentada',
      },
      data: {
        type: DataTypes.DATEONLY,
        allowNull: false,
        comment: 'Data do registro de preço',
      },
      idMoeda: {
        type: DataTypes.INTEGER,
        allowNull: true,
        comment: 'ID da moeda (indexador do produto)',
        references: {
          model: 'C006_moeda',
          key: 'id_moeda',
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
      },
      valorMoedaPadrao: {
        type: DataTypes.DECIMAL(18, 4),
        allowNull: false,
        comment: 'Valor convertido para moeda padrão',
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

    // Criar índices
    await queryInterface.addIndex('C033_historicoPreco', ['tenantId'], {
      name: 'idx_histPreco_tenantId',
    });

    await queryInterface.addIndex('C033_historicoPreco', ['idProduto'], {
      name: 'idx_histPreco_idProduto',
    });

    await queryInterface.addIndex('C033_historicoPreco', ['idFazenda'], {
      name: 'idx_histPreco_idFazenda',
    });

    await queryInterface.addIndex('C033_historicoPreco', ['idMovimentoEstoque'], {
      name: 'idx_histPreco_idMovimentoEstoque',
    });

    await queryInterface.addIndex('C033_historicoPreco', ['data'], {
      name: 'idx_histPreco_data',
    });

    await queryInterface.addIndex('C033_historicoPreco', ['idProduto', 'idFazenda', 'data'], {
      name: 'idx_histPreco_produto_fazenda_data',
    });
  }
}

export async function down(queryInterface: QueryInterface): Promise<void> {
  await queryInterface.dropTable('C033_historicoPreco');
}
