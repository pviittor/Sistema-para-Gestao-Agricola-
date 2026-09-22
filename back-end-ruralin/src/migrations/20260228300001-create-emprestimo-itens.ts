import { QueryInterface, DataTypes, QueryTypes } from 'sequelize';

/**
 * Migration: Criar tabela emprestimo_itens
 *
 * Esta migration cria a tabela emprestimo_itens para registro dos itens
 * (produtos) vinculados a um empréstimo.
 */
export async function up(queryInterface: QueryInterface): Promise<void> {
  // Verificar se a tabela ja existe
  const tables = await queryInterface.sequelize.query(
    `
    SELECT TABLE_NAME
    FROM INFORMATION_SCHEMA.TABLES
    WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME = 'emprestimo_itens';
  `,
    { type: QueryTypes.SELECT }
  ) as any[];

  const tableExists = tables && tables.length > 0;

  if (!tableExists) {
    await queryInterface.createTable('emprestimo_itens', {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        comment: 'ID único do item do empréstimo (auto-increment)',
      },
      emprestimoId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        comment: 'ID do empréstimo ao qual o item pertence',
        references: {
          model: 'emprestimos',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      produtoId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        comment: 'ID do produto emprestado',
        references: {
          model: 'C008_produto',
          key: 'id_prod',
        },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT',
      },
      quantidade_empi: {
        type: DataTypes.DECIMAL(15, 4),
        allowNull: false,
        comment: 'Quantidade do produto emprestado',
      },
      unitario_empi: {
        type: DataTypes.DECIMAL(15, 2),
        allowNull: false,
        comment: 'Valor unitário do produto emprestado',
      },
      total_empi: {
        type: DataTypes.DECIMAL(15, 2),
        allowNull: false,
        defaultValue: 0,
        comment: 'Valor total do item (quantidade_empi × unitario_empi)',
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
    await queryInterface.addIndex('emprestimo_itens', ['emprestimoId'], {
      name: 'idx_emprestimo_itens_emprestimoId',
    });

    await queryInterface.addIndex('emprestimo_itens', ['produtoId'], {
      name: 'idx_emprestimo_itens_produtoId',
    });
  }
}

export async function down(queryInterface: QueryInterface): Promise<void> {
  await queryInterface.dropTable('emprestimo_itens');
}
