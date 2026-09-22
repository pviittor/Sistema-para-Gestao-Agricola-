import { QueryInterface, DataTypes, QueryTypes } from 'sequelize';

/**
 * Migration: Criar tabela C032_movimentoEstoque
 *
 * Esta migration cria a tabela C032_movimentoEstoque para registro de movimentações de estoque de produtos.
 */
export async function up(queryInterface: QueryInterface): Promise<void> {
  // Verificar se a tabela já existe
  const tables = await queryInterface.sequelize.query(`
    SELECT TABLE_NAME
    FROM INFORMATION_SCHEMA.TABLES
    WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME = 'C032_movimentoEstoque';
  `, {
    type: QueryTypes.SELECT,
  }) as any[];

  const tableExists = tables && tables.length > 0;

  if (!tableExists) {
    await queryInterface.createTable('C032_movimentoEstoque', {
      id_mov: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        comment: 'ID único do movimento de estoque (auto-increment)',
      },
      tenantId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        comment: 'ID do tenant ao qual o movimento pertence',
      },
      idProduto: {
        type: DataTypes.INTEGER,
        allowNull: false,
        comment: 'ID do produto movimentado',
        references: {
          model: 'C008_produto',
          key: 'id_prod',
        },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT',
      },
      idProdutor: {
        type: DataTypes.INTEGER,
        allowNull: true,
        comment: 'ID do produtor do movimento (quando romaneio)',
        references: {
          model: 'C001_PESSOA',
          key: 'id_pessoa',
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
      },
      idFazenda: {
        type: DataTypes.INTEGER,
        allowNull: false,
        comment: 'ID da fazenda (depósito)',
        references: {
          model: 'C018_fazenda',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT',
      },
      idAbastecimento: {
        type: DataTypes.INTEGER,
        allowNull: true,
        comment: 'ID do abastecimento relacionado',
        references: {
          model: 'C031_abastecimento',
          key: 'id_abast',
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
      },
      tipomov: {
        type: DataTypes.INTEGER,
        allowNull: false,
        comment: 'Tipo de movimentação (0=PedidoCompra, 1=EstoqueFisico, 2=Emprestado, 3=TomadoEmprestimo, 4=EstoqueInicial, 5=ContratoReceber)',
      },
      operacao: {
        type: DataTypes.INTEGER,
        allowNull: false,
        comment: 'Operação de estoque (1=EstoqueFisico, 2=PedidoCompra, 4=CompraEntregaFutura, 5=VendaFutura, 6=Trading, 7=Disponivel, 71=DisponivelUso, 9=Balcao, 51=Terceiro)',
      },
      quantidade: {
        type: DataTypes.DECIMAL(18, 4),
        allowNull: false,
        comment: 'Quantidade movimentada',
      },
      data: {
        type: DataTypes.DATEONLY,
        allowNull: false,
        comment: 'Data do movimento',
      },
      valor: {
        type: DataTypes.DECIMAL(18, 4),
        allowNull: false,
        comment: 'Valor do movimento',
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
    await queryInterface.addIndex('C032_movimentoEstoque', ['tenantId'], {
      name: 'idx_movEstoque_tenantId',
    });

    await queryInterface.addIndex('C032_movimentoEstoque', ['idProduto'], {
      name: 'idx_movEstoque_idProduto',
    });

    await queryInterface.addIndex('C032_movimentoEstoque', ['idFazenda'], {
      name: 'idx_movEstoque_idFazenda',
    });

    await queryInterface.addIndex('C032_movimentoEstoque', ['idProdutor'], {
      name: 'idx_movEstoque_idProdutor',
    });

    await queryInterface.addIndex('C032_movimentoEstoque', ['operacao'], {
      name: 'idx_movEstoque_operacao',
    });

    await queryInterface.addIndex('C032_movimentoEstoque', ['data'], {
      name: 'idx_movEstoque_data',
    });

    await queryInterface.addIndex('C032_movimentoEstoque', ['idProduto', 'idFazenda', 'operacao', 'data'], {
      name: 'idx_movEstoque_produto_fazenda_operacao_data',
    });
  }
}

export async function down(queryInterface: QueryInterface): Promise<void> {
  await queryInterface.dropTable('C032_movimentoEstoque');
}
