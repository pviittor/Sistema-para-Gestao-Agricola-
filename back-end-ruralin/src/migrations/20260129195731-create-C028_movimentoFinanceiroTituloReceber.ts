import { QueryInterface, DataTypes, QueryTypes } from 'sequelize';

/**
 * Migration: Criar tabela C028_movimentoFinanceiroTituloReceber
 * 
 * Esta migration cria a tabela C028_movimentoFinanceiroTituloReceber para registro de movimentos
 * financeiros realizados (baixas) de títulos a receber, com rateios proporcionais por plano de contas
 * e centro de custo. Permite controle de planejado vs realizado.
 */
export async function up(queryInterface: QueryInterface): Promise<void> {
  // Verificar se a tabela já existe
  const tables = await queryInterface.sequelize.query(`
    SELECT TABLE_NAME 
    FROM INFORMATION_SCHEMA.TABLES 
    WHERE TABLE_SCHEMA = DATABASE() 
    AND TABLE_NAME = 'C028_movimentoFinanceiroTituloReceber';
  `, {
    type: QueryTypes.SELECT,
  }) as any[];

  const tableExists = tables && tables.length > 0;

  if (!tableExists) {
    await queryInterface.createTable('C028_movimentoFinanceiroTituloReceber', {
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
      idParcelaTituloReceber: {
        type: DataTypes.INTEGER,
        allowNull: false,
        comment: 'ID da parcela do título a receber que foi baixada',
        references: {
          model: 'C024_parcelaTituloReceber',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      idTituloReceber: {
        type: DataTypes.INTEGER,
        allowNull: false,
        comment: 'ID do título a receber (redundante para performance em consultas)',
        references: {
          model: 'C023_tituloReceber',
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
    await queryInterface.addIndex('C028_movimentoFinanceiroTituloReceber', ['tenantId'], {
      name: 'idx_movimentoFinanceiroTituloReceber_tenantId',
    });

    await queryInterface.addIndex('C028_movimentoFinanceiroTituloReceber', ['idParcelaTituloReceber'], {
      name: 'idx_movimentoFinanceiroTituloReceber_idParcelaTituloReceber',
    });

    await queryInterface.addIndex('C028_movimentoFinanceiroTituloReceber', ['idTituloReceber'], {
      name: 'idx_movimentoFinanceiroTituloReceber_idTituloReceber',
    });

    await queryInterface.addIndex('C028_movimentoFinanceiroTituloReceber', ['idPlanoContaGerencial'], {
      name: 'idx_movimentoFinanceiroTituloReceber_idPlanoContaGerencial',
    });

    await queryInterface.addIndex('C028_movimentoFinanceiroTituloReceber', ['idCentroCusto'], {
      name: 'idx_movimentoFinanceiroTituloReceber_idCentroCusto',
    });

    await queryInterface.addIndex('C028_movimentoFinanceiroTituloReceber', ['dataMovimento'], {
      name: 'idx_movimentoFinanceiroTituloReceber_dataMovimento',
    });

    await queryInterface.addIndex('C028_movimentoFinanceiroTituloReceber', ['usercreation'], {
      name: 'idx_movimentoFinanceiroTituloReceber_usercreation',
    });
  }
}

export async function down(queryInterface: QueryInterface): Promise<void> {
  await queryInterface.dropTable('C028_movimentoFinanceiroTituloReceber');
}
