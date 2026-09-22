import { QueryInterface, DataTypes, QueryTypes } from 'sequelize';

/**
 * Migration: Criar tabela C027_movimentoFinanceiroTituloPagar
 * 
 * Esta migration cria a tabela C027_movimentoFinanceiroTituloPagar para registro de movimentos
 * financeiros realizados (baixas) de títulos a pagar, com rateios proporcionais por plano de contas
 * e centro de custo. Permite controle de planejado vs realizado.
 */
export async function up(queryInterface: QueryInterface): Promise<void> {
  // Verificar se a tabela já existe
  const tables = await queryInterface.sequelize.query(`
    SELECT TABLE_NAME 
    FROM INFORMATION_SCHEMA.TABLES 
    WHERE TABLE_SCHEMA = DATABASE() 
    AND TABLE_NAME = 'C027_movimentoFinanceiroTituloPagar';
  `, {
    type: QueryTypes.SELECT,
  }) as any[];

  const tableExists = tables && tables.length > 0;

  if (!tableExists) {
    await queryInterface.createTable('C027_movimentoFinanceiroTituloPagar', {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        comment: 'ID único do movimento financeiro (auto-increment)',
      },
      tenantId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        comment: 'ID do tenant ao qual o movimento pertence',
      },
      idParcelaTituloPagar: {
        type: DataTypes.INTEGER,
        allowNull: false,
        comment: 'ID da parcela do título a pagar que foi baixada',
        references: {
          model: 'C020_parcelaTituloPagar',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      idTituloPagar: {
        type: DataTypes.INTEGER,
        allowNull: false,
        comment: 'ID do título a pagar (redundante para performance em consultas)',
        references: {
          model: 'C019_tituloPagar',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      idPlanoContaGerencial: {
        type: DataTypes.INTEGER,
        allowNull: false,
        comment: 'ID do plano de contas gerencial',
        references: {
          model: 'C013_planoContaGerencial',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT',
      },
      idCentroCusto: {
        type: DataTypes.INTEGER,
        allowNull: false,
        comment: 'ID do centro de custo',
        references: {
          model: 'C016_centroCusto',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT',
      },
      dataMovimento: {
        type: DataTypes.DATEONLY,
        allowNull: false,
        comment: 'Data do movimento financeiro (data da baixa)',
      },
      valorMovimento: {
        type: DataTypes.DECIMAL(15, 2),
        allowNull: false,
        comment: 'Valor do movimento rateado proporcionalmente',
      },
      valorMovimentoMoedaOriginal: {
        type: DataTypes.DECIMAL(15, 2),
        allowNull: true,
        comment: 'Valor do movimento na moeda original do título',
      },
      valorMovimentoMoedaPadrao: {
        type: DataTypes.DECIMAL(15, 2),
        allowNull: true,
        comment: 'Valor do movimento convertido para BRL',
      },
      percentualRateioPlanoConta: {
        type: DataTypes.DECIMAL(5, 2),
        allowNull: false,
        comment: 'Percentual do rateio de plano de contas original do título',
      },
      percentualRateioCentroCusto: {
        type: DataTypes.DECIMAL(5, 2),
        allowNull: false,
        comment: 'Percentual do rateio de centro de custo original do título',
      },
      observacao: {
        type: DataTypes.TEXT,
        allowNull: true,
        comment: 'Observações sobre o movimento financeiro',
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
    await queryInterface.addIndex('C027_movimentoFinanceiroTituloPagar', ['tenantId'], {
      name: 'idx_movimentoFinanceiroTituloPagar_tenantId',
    });

    await queryInterface.addIndex('C027_movimentoFinanceiroTituloPagar', ['idParcelaTituloPagar'], {
      name: 'idx_movimentoFinanceiroTituloPagar_idParcelaTituloPagar',
    });

    await queryInterface.addIndex('C027_movimentoFinanceiroTituloPagar', ['idTituloPagar'], {
      name: 'idx_movimentoFinanceiroTituloPagar_idTituloPagar',
    });

    await queryInterface.addIndex('C027_movimentoFinanceiroTituloPagar', ['idPlanoContaGerencial'], {
      name: 'idx_movimentoFinanceiroTituloPagar_idPlanoContaGerencial',
    });

    await queryInterface.addIndex('C027_movimentoFinanceiroTituloPagar', ['idCentroCusto'], {
      name: 'idx_movimentoFinanceiroTituloPagar_idCentroCusto',
    });

    await queryInterface.addIndex('C027_movimentoFinanceiroTituloPagar', ['dataMovimento'], {
      name: 'idx_movimentoFinanceiroTituloPagar_dataMovimento',
    });

    await queryInterface.addIndex('C027_movimentoFinanceiroTituloPagar', ['usercreation'], {
      name: 'idx_movimentoFinanceiroTituloPagar_usercreation',
    });
  }
}

export async function down(queryInterface: QueryInterface): Promise<void> {
  await queryInterface.dropTable('C027_movimentoFinanceiroTituloPagar');
}
