import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';
import Agreement from './Agreement';
import Usuario from './Usuario';
import { PaymentPeriod, AmountRate } from './enums/AgreementEnums';

/**
 * Interface para atributos da entidade AgreementPaymentSchedule
 */
interface AgreementPaymentScheduleAttributes {
  id: number;
  tenantId: number;
  agreementId: number;
  paymentInterval: number;
  paymentPeriod: PaymentPeriod;
  paymentDay: number;
  amount: number;
  amountRate: AmountRate;
  startDate: string;
  endDate: string | null;
  status: 'pendente' | 'liquidado';
  dataLiquidacao: string | null;
  usercreation: number;
  datecreation: Date;
}

/**
 * Interface para atributos de criação (id é opcional pois é auto-increment)
 */
interface AgreementPaymentScheduleCreationAttributes extends Optional<AgreementPaymentScheduleAttributes,
  'id' | 'datecreation' | 'endDate' | 'status' | 'dataLiquidacao'
> {}

/**
 * Modelo Sequelize para a entidade AgreementPaymentSchedule
 *
 * Representa um cronograma de pagamento vinculado a um Agreement.
 */
class AgreementPaymentSchedule
  extends Model<AgreementPaymentScheduleAttributes, AgreementPaymentScheduleCreationAttributes>
  implements AgreementPaymentScheduleAttributes
{
  public id!: number;
  public tenantId!: number;
  public agreementId!: number;
  public paymentInterval!: number;
  public paymentPeriod!: PaymentPeriod;
  public paymentDay!: number;
  public amount!: number;
  public amountRate!: AmountRate;
  public startDate!: string;
  public endDate!: string | null;
  public status!: 'pendente' | 'liquidado';
  public dataLiquidacao!: string | null;
  public usercreation!: number;
  public datecreation!: Date;

  // Relacionamentos
  public agreement?: Agreement;
  public usuarioCriador?: Usuario;
}

AgreementPaymentSchedule.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
      comment: 'ID único do payment schedule',
    },
    tenantId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: 'tenantId',
      comment: 'ID do tenant ao qual o registro pertence',
    },
    agreementId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: 'ID do agreement (FK)',
      references: {
        model: 'C054_agreement',
        key: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE',
    },
    paymentInterval: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: 'Intervalo de pagamento',
    },
    paymentPeriod: {
      type: DataTypes.ENUM('MONTH', 'YEAR'),
      allowNull: false,
      comment: 'Período de pagamento: MONTH ou YEAR',
    },
    paymentDay: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: 'Dia do pagamento',
    },
    amount: {
      type: DataTypes.DECIMAL(18, 2),
      allowNull: false,
      comment: 'Valor do pagamento',
    },
    amountRate: {
      type: DataTypes.ENUM('TOTAL', 'PER_HECTARE'),
      allowNull: false,
      comment: 'Tipo do valor: TOTAL ou PER_HECTARE',
    },
    startDate: {
      type: DataTypes.DATEONLY,
      allowNull: false,
      comment: 'Data de início do cronograma',
    },
    endDate: {
      type: DataTypes.DATEONLY,
      allowNull: true,
      comment: 'Data de término do cronograma',
    },
    status: {
      type: DataTypes.ENUM('pendente', 'liquidado'),
      allowNull: false,
      defaultValue: 'pendente',
      comment: 'Status de liquidação: pendente ou liquidado',
    },
    dataLiquidacao: {
      type: DataTypes.DATEONLY,
      allowNull: true,
      comment: 'Data em que o pagamento foi efetivamente liquidado',
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
  },
  {
    sequelize,
    tableName: 'C056_agreementPaymentSchedule',
    timestamps: false,
    underscored: false,
    indexes: [
      {
        fields: ['tenantId'],
      },
      {
        fields: ['agreementId'],
      },
      {
        fields: ['usercreation'],
      },
    ],
  }
);

// Associations — both defined in child file to avoid circular imports
Agreement.hasMany(AgreementPaymentSchedule, { foreignKey: 'agreementId', as: 'paymentSchedules' });
AgreementPaymentSchedule.belongsTo(Agreement, { foreignKey: 'agreementId', as: 'agreement' });
AgreementPaymentSchedule.belongsTo(Usuario, { foreignKey: 'usercreation', as: 'usuarioCriador' });

export default AgreementPaymentSchedule;
