import { QueryInterface, DataTypes, QueryTypes } from 'sequelize';

/**
 * Migration: Ajustes nos contratos (Agreement)
 *
 * - Altera enum loanType para tipos brasileiros
 * - Adiciona campo paymentMethod (PRICE, SAC, SACRE) para empréstimos
 * - Adiciona campo currencyUnit (BRL, SACA_SOJA, etc.) para arrendamento
 * - Adiciona campo cotacaoValor para conversão de commodity em BRL
 * - Altera enum revenueSource para fontes brasileiras
 * - Altera enum amountRate: PER_ACRE → PER_HECTARE
 */
export async function up(queryInterface: QueryInterface): Promise<void> {
  const sequelize = queryInterface.sequelize;

  // 1. Alterar enum loanType para tipos brasileiros
  await sequelize.query(`
    ALTER TABLE C054_agreement
    MODIFY COLUMN loanType ENUM(
      'CUSTEIO', 'INVESTIMENTO', 'COMERCIALIZACAO',
      'CAPITAL_GIRO', 'FINANCIAMENTO_RURAL', 'CPR', 'CREDITO_FUNDIARIO', 'OTHER'
    ) NULL
    COMMENT 'Tipo de empréstimo (LOAN): CUSTEIO, INVESTIMENTO, COMERCIALIZACAO, CAPITAL_GIRO, FINANCIAMENTO_RURAL, CPR, CREDITO_FUNDIARIO, OTHER';
  `);

  // 2. Adicionar campo paymentMethod
  const paymentMethodExists = await sequelize.query(`
    SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS
    WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME = 'C054_agreement'
    AND COLUMN_NAME = 'paymentMethod';
  `, { type: QueryTypes.SELECT }) as any[];

  if (!paymentMethodExists || paymentMethodExists.length === 0) {
    await queryInterface.addColumn('C054_agreement', 'paymentMethod', {
      type: DataTypes.ENUM('PRICE', 'SAC', 'SACRE'),
      allowNull: true,
      defaultValue: null,
      comment: 'Método de pagamento do empréstimo: PRICE (Tabela Price), SAC (Amortização Constante) ou SACRE (Amortização Crescente)',
    });
  }

  // 3. Adicionar campo currencyUnit
  const currencyUnitExists = await sequelize.query(`
    SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS
    WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME = 'C054_agreement'
    AND COLUMN_NAME = 'currencyUnit';
  `, { type: QueryTypes.SELECT }) as any[];

  if (!currencyUnitExists || currencyUnitExists.length === 0) {
    await queryInterface.addColumn('C054_agreement', 'currencyUnit', {
      type: DataTypes.ENUM('BRL', 'SACA_SOJA', 'SACA_MILHO', 'SACA_CAFE', 'ARROBA_BOI'),
      allowNull: true,
      defaultValue: 'BRL',
      comment: 'Unidade monetária do contrato de arrendamento: BRL, SACA_SOJA, SACA_MILHO, SACA_CAFE ou ARROBA_BOI',
    });
  }

  // 4. Adicionar campo cotacaoValor
  const cotacaoExists = await sequelize.query(`
    SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS
    WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME = 'C054_agreement'
    AND COLUMN_NAME = 'cotacaoValor';
  `, { type: QueryTypes.SELECT }) as any[];

  if (!cotacaoExists || cotacaoExists.length === 0) {
    await queryInterface.addColumn('C054_agreement', 'cotacaoValor', {
      type: DataTypes.DECIMAL(18, 4),
      allowNull: true,
      comment: 'Valor da cotação da moeda/commodity para conversão em BRL (RENT_LEASE)',
    });
  }

  // 5. Alterar enum revenueSource para fontes brasileiras
  await sequelize.query(`
    ALTER TABLE C054_agreement
    MODIFY COLUMN revenueSource ENUM(
      'ARRENDAMENTO_PASTO', 'ENERGIA_SOLAR', 'ENERGIA_EOLICA',
      'MINERACAO', 'TURISMO_RURAL', 'APICULTURA', 'PISCICULTURA', 'SERVIDAO', 'OTHER'
    ) NULL
    COMMENT 'Fonte de receita não-agrícola (NON_CROP_REVENUE)';
  `);

  // 6. Alterar enum amountRate: PER_ACRE → PER_HECTARE
  await sequelize.query(`
    UPDATE C056_agreementPaymentSchedule SET amountRate = 'PER_HECTARE' WHERE amountRate = 'PER_ACRE';
  `);

  await sequelize.query(`
    ALTER TABLE C056_agreementPaymentSchedule
    MODIFY COLUMN amountRate ENUM('TOTAL', 'PER_HECTARE') NOT NULL
    COMMENT 'Tipo do valor: TOTAL ou PER_HECTARE';
  `);
}

export async function down(queryInterface: QueryInterface): Promise<void> {
  const sequelize = queryInterface.sequelize;

  // Reverter amountRate
  await sequelize.query(`
    UPDATE C056_agreementPaymentSchedule SET amountRate = 'PER_ACRE' WHERE amountRate = 'PER_HECTARE';
  `);

  await sequelize.query(`
    ALTER TABLE C056_agreementPaymentSchedule
    MODIFY COLUMN amountRate ENUM('TOTAL', 'PER_ACRE') NOT NULL
    COMMENT 'Tipo do valor: TOTAL ou PER_ACRE';
  `);

  // Reverter revenueSource
  await sequelize.query(`
    ALTER TABLE C054_agreement
    MODIFY COLUMN revenueSource ENUM('HUNTING', 'MINING', 'OIL', 'WIND', 'EASEMENT', 'CONSERVATION', 'OTHER') NULL
    COMMENT 'Fonte de receita não-agrícola (NON_CROP_REVENUE)';
  `);

  // Remover cotacaoValor
  await queryInterface.removeColumn('C054_agreement', 'cotacaoValor');

  // Remover currencyUnit
  await queryInterface.removeColumn('C054_agreement', 'currencyUnit');

  // Remover paymentMethod
  await queryInterface.removeColumn('C054_agreement', 'paymentMethod');

  // Reverter loanType
  await sequelize.query(`
    ALTER TABLE C054_agreement
    MODIFY COLUMN loanType ENUM(
      'FIXED_RATE_MORTGAGE', 'EQUITY_LINE', 'LAND_CONTRACT',
      'LINE_OF_CREDIT', 'OPERATING', 'FSA_DIRECT', 'FSA_GUARANTEED', 'OTHER'
    ) NULL
    COMMENT 'Tipo de empréstimo (LOAN)';
  `);
}
