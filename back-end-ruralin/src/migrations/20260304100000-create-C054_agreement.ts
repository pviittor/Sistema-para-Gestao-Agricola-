import { QueryInterface, DataTypes, QueryTypes } from 'sequelize';

/**
 * Migration: Criar tabela C054_agreement
 *
 * Esta migration cria a tabela C054_agreement para registro de
 * acordos/contratos (empréstimos, arrendamentos e receitas não-agrícolas).
 */
export async function up(queryInterface: QueryInterface): Promise<void> {
  // Verificar se a tabela já existe
  const tables = await queryInterface.sequelize.query(`
    SELECT TABLE_NAME
    FROM INFORMATION_SCHEMA.TABLES
    WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME = 'C054_agreement';
  `, {
    type: QueryTypes.SELECT,
  }) as any[];

  const tableExists = tables && tables.length > 0;

  if (!tableExists) {
    await queryInterface.createTable('C054_agreement', {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        comment: 'ID único do agreement',
      },
      tenantId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        comment: 'ID do tenant ao qual o agreement pertence',
      },
      agreementType: {
        type: DataTypes.ENUM('LOAN', 'RENT_LEASE', 'NON_CROP_REVENUE'),
        allowNull: false,
        comment: 'Tipo do agreement: LOAN, RENT_LEASE ou NON_CROP_REVENUE',
      },
      notes: {
        type: DataTypes.TEXT,
        allowNull: true,
        comment: 'Observações sobre o agreement',
      },
      ativo: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true,
        comment: 'Se o agreement está ativo',
      },
      fazendaId: {
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
      // LOAN fields (nullable)
      startDate: {
        type: DataTypes.DATEONLY,
        allowNull: true,
        comment: 'Data de início (LOAN / NON_CROP_REVENUE)',
      },
      termLength: {
        type: DataTypes.INTEGER,
        allowNull: true,
        comment: 'Duração do prazo (LOAN / NON_CROP_REVENUE)',
      },
      termUnit: {
        type: DataTypes.ENUM('YEAR', 'MONTH'),
        allowNull: true,
        comment: 'Unidade do prazo: YEAR ou MONTH',
      },
      lenderName: {
        type: DataTypes.STRING(255),
        allowNull: true,
        comment: 'Nome do credor (LOAN)',
      },
      loanType: {
        type: DataTypes.ENUM(
          'CUSTEIO', 'INVESTIMENTO', 'COMERCIALIZACAO',
          'CAPITAL_GIRO', 'FINANCIAMENTO_RURAL', 'CPR', 'CREDITO_FUNDIARIO', 'OTHER'
        ),
        allowNull: true,
        comment: 'Tipo de empréstimo (LOAN)',
      },
      paymentMethod: {
        type: DataTypes.ENUM('PRICE', 'SAC', 'SACRE'),
        allowNull: true,
        defaultValue: null,
        comment: 'Método de pagamento do empréstimo: PRICE, SAC ou SACRE',
      },
      originalBalance: {
        type: DataTypes.DECIMAL(18, 2),
        allowNull: true,
        comment: 'Saldo original (LOAN)',
      },
      interestRate: {
        type: DataTypes.DECIMAL(5, 2),
        allowNull: true,
        comment: 'Taxa de juros (LOAN)',
      },
      // RENT_LEASE fields (nullable)
      startYear: {
        type: DataTypes.INTEGER,
        allowNull: true,
        comment: 'Ano de início (RENT_LEASE)',
      },
      endYear: {
        type: DataTypes.INTEGER,
        allowNull: true,
        comment: 'Ano de término (RENT_LEASE)',
      },
      idArrendador: {
        type: DataTypes.INTEGER,
        allowNull: true,
        comment: 'ID da pessoa (arrendador) para RENT_LEASE',
        references: {
          model: 'C001_PESSOA',
          key: 'id_pessoa',
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
      },
      currencyUnit: {
        type: DataTypes.ENUM('BRL', 'SACA_SOJA', 'SACA_MILHO', 'SACA_CAFE', 'ARROBA_BOI'),
        allowNull: true,
        defaultValue: 'BRL',
        comment: 'Unidade monetária do contrato de arrendamento',
      },
      cotacaoValor: {
        type: DataTypes.DECIMAL(18, 4),
        allowNull: true,
        comment: 'Valor da cotação da moeda/commodity para conversão em BRL',
      },
      // NON_CROP_REVENUE fields (nullable)
      revenueSource: {
        type: DataTypes.ENUM(
          'ARRENDAMENTO_PASTO', 'ENERGIA_SOLAR', 'ENERGIA_EOLICA',
          'MINERACAO', 'TURISMO_RURAL', 'APICULTURA', 'PISCICULTURA', 'SERVIDAO', 'OTHER'
        ),
        allowNull: true,
        comment: 'Fonte de receita não-agrícola (NON_CROP_REVENUE)',
      },
    });

    // Criar índices
    await queryInterface.addIndex('C054_agreement', ['tenantId'], {
      name: 'idx_agreement_tenantId',
    });

    await queryInterface.addIndex('C054_agreement', ['fazendaId'], {
      name: 'idx_agreement_fazendaId',
    });

    await queryInterface.addIndex('C054_agreement', ['agreementType'], {
      name: 'idx_agreement_agreementType',
    });

    await queryInterface.addIndex('C054_agreement', ['idArrendador'], {
      name: 'idx_agreement_idArrendador',
    });

    await queryInterface.addIndex('C054_agreement', ['usercreation'], {
      name: 'idx_agreement_usercreation',
    });

    await queryInterface.addIndex('C054_agreement', ['ativo'], {
      name: 'idx_agreement_ativo',
    });
  }
}

export async function down(queryInterface: QueryInterface): Promise<void> {
  await queryInterface.dropTable('C054_agreement');
}
