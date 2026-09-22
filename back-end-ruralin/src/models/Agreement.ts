import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';
import Usuario from './Usuario';
import Pessoa from './Pessoa';
import Fazenda from './Fazenda';
import {
  AgreementType,
  TermUnit,
  LoanType,
  PaymentMethod,
  CurrencyUnit,
  RevenueSource,
} from './enums/AgreementEnums';

/**
 * Interface para atributos da entidade Agreement
 */
interface AgreementAttributes {
  id: number;
  tenantId: number;
  agreementType: AgreementType;
  notes: string | null;
  ativo: boolean;
  fazendaId: number;
  usercreation: number;
  datecreation: Date;
  // LOAN fields
  startDate: string | null;
  termLength: number | null;
  termUnit: TermUnit | null;
  lenderName: string | null;
  loanType: LoanType | null;
  paymentMethod: PaymentMethod | null;
  originalBalance: number | null;
  interestRate: number | null;
  // RENT_LEASE fields
  startYear: number | null;
  endYear: number | null;
  idArrendador: number | null;
  currencyUnit: CurrencyUnit | null;
  cotacaoValor: number | null;
  // NON_CROP_REVENUE fields
  revenueSource: RevenueSource | null;
}

/**
 * Interface para atributos de criação (id é opcional pois é auto-increment)
 */
interface AgreementCreationAttributes extends Optional<AgreementAttributes,
  'id' | 'datecreation' | 'notes' | 'ativo' |
  'startDate' | 'termLength' | 'termUnit' | 'lenderName' | 'loanType' | 'paymentMethod' | 'originalBalance' | 'interestRate' |
  'startYear' | 'endYear' | 'idArrendador' | 'currencyUnit' | 'cotacaoValor' |
  'revenueSource'
> {}

/**
 * Modelo Sequelize para a entidade Agreement
 *
 * Representa um acordo/contrato (empréstimo, arrendamento ou receita não-agrícola).
 */
class Agreement
  extends Model<AgreementAttributes, AgreementCreationAttributes>
  implements AgreementAttributes
{
  public id!: number;
  public tenantId!: number;
  public agreementType!: AgreementType;
  public notes!: string | null;
  public ativo!: boolean;
  public fazendaId!: number;
  public usercreation!: number;
  public datecreation!: Date;
  // LOAN fields
  public startDate!: string | null;
  public termLength!: number | null;
  public termUnit!: TermUnit | null;
  public lenderName!: string | null;
  public loanType!: LoanType | null;
  public paymentMethod!: PaymentMethod | null;
  public originalBalance!: number | null;
  public interestRate!: number | null;
  // RENT_LEASE fields
  public startYear!: number | null;
  public endYear!: number | null;
  public idArrendador!: number | null;
  public currencyUnit!: CurrencyUnit | null;
  public cotacaoValor!: number | null;
  // NON_CROP_REVENUE fields
  public revenueSource!: RevenueSource | null;

  // Relacionamentos
  public leaseTerms?: any[];
  public paymentSchedules?: any[];
  public agreementFields?: any[];
  public fazenda?: Fazenda;
  public arrendador?: Pessoa;
  public usuarioCriador?: Usuario;
}

Agreement.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
      comment: 'ID único do agreement',
    },
    tenantId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: 'tenantId',
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
      comment: 'Método de pagamento do empréstimo: PRICE (Tabela Price), SAC (Amortização Constante) ou SACRE (Amortização Crescente)',
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
      comment: 'Unidade monetária do contrato de arrendamento: BRL (reais), SACA_SOJA, SACA_MILHO, SACA_CAFE ou ARROBA_BOI',
    },
    cotacaoValor: {
      type: DataTypes.DECIMAL(18, 4),
      allowNull: true,
      comment: 'Valor da cotação da moeda/commodity para conversão em BRL (RENT_LEASE)',
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
  },
  {
    sequelize,
    tableName: 'C054_agreement',
    timestamps: false,
    underscored: false,
    indexes: [
      {
        fields: ['tenantId'],
      },
      {
        fields: ['fazendaId'],
      },
      {
        fields: ['agreementType'],
      },
      {
        fields: ['idArrendador'],
      },
      {
        fields: ['usercreation'],
      },
      {
        fields: ['ativo'],
      },
    ],
  }
);

// Setup associations (belongsTo only — hasMany defined in child files)
Agreement.belongsTo(Fazenda, { foreignKey: 'fazendaId', as: 'fazenda' });
Agreement.belongsTo(Pessoa, { foreignKey: 'idArrendador', as: 'arrendador' });
Agreement.belongsTo(Usuario, { foreignKey: 'usercreation', as: 'usuarioCriador' });

export default Agreement;
