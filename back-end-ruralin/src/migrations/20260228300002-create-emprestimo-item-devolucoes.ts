import { QueryInterface, DataTypes, QueryTypes } from 'sequelize';

/**
 * Migration: Criar tabela emprestimo_item_devolucoes
 *
 * Esta migration cria a tabela emprestimo_item_devolucoes para registro
 * das devoluções de itens de empréstimos.
 */
export async function up(queryInterface: QueryInterface): Promise<void> {
  // Verificar se a tabela ja existe
  const tables = await queryInterface.sequelize.query(
    `
    SELECT TABLE_NAME
    FROM INFORMATION_SCHEMA.TABLES
    WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME = 'emprestimo_item_devolucoes';
  `,
    { type: QueryTypes.SELECT }
  ) as any[];

  const tableExists = tables && tables.length > 0;

  if (!tableExists) {
    await queryInterface.createTable('emprestimo_item_devolucoes', {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        comment: 'ID único da devolução do item do empréstimo (auto-increment)',
      },
      itemDevolucaoId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        comment: 'ID do item do empréstimo que está sendo devolvido',
        references: {
          model: 'emprestimo_itens',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      produtoDevolucaoId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        comment: 'ID do produto que está sendo devolvido',
        references: {
          model: 'C008_produto',
          key: 'id_prod',
        },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT',
      },
      produtoSimilarId: {
        type: DataTypes.INTEGER,
        allowNull: true,
        comment: 'ID do produto similar devolvido (quando a devolução é de produto similar)',
        references: {
          model: 'C008_produto',
          key: 'id_prod',
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
      },
      datadevolucao_empdev: {
        type: DataTypes.DATEONLY,
        allowNull: false,
        comment: 'Data da devolução do item',
      },
      quantidadedevolvida_empdev: {
        type: DataTypes.DECIMAL(15, 4),
        allowNull: false,
        comment: 'Quantidade devolvida nesta operação',
      },
      devolucaoGeraFinanceiro_empdev: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
        comment: 'Indica se a devolução gera um lançamento financeiro',
      },
      devolucaoProdutoSimilar_empdev: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
        comment: 'Indica se a devolução é de produto similar ao emprestado',
      },
      createdAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
        comment: 'Data de criação do registro',
      },
      updatedAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
        comment: 'Data de atualização do registro',
      },
    });

    // Criar índices
    await queryInterface.addIndex('emprestimo_item_devolucoes', ['itemDevolucaoId'], {
      name: 'idx_emprestimo_item_devolucoes_itemDevolucaoId',
    });

    await queryInterface.addIndex('emprestimo_item_devolucoes', ['produtoDevolucaoId'], {
      name: 'idx_emprestimo_item_devolucoes_produtoDevolucaoId',
    });

    await queryInterface.addIndex('emprestimo_item_devolucoes', ['produtoSimilarId'], {
      name: 'idx_emprestimo_item_devolucoes_produtoSimilarId',
    });
  }
}

export async function down(queryInterface: QueryInterface): Promise<void> {
  await queryInterface.dropTable('emprestimo_item_devolucoes');
}
