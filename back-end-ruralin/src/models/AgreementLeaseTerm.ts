import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';
import Agreement from './Agreement';
import Usuario from './Usuario';
import { LeaseTermType, ExpenseCategory } from './enums/AgreementEnums';

/**
 * Interface para atributos da entidade AgreementLeaseTerm
 */
interface AgreementLeaseTermAttributes {
  id: number;
  tenantId: number;
  agreementId: number;
  termType: LeaseTermType;
  expenseCategory: ExpenseCategory | null;
  tenantCostAllocation: number | null;
  usercreation: number;
  datecreation: Date;
}

/**
 * Interface para atributos de criação (id é opcional pois é auto-increment)
 */
interface AgreementLeaseTermCreationAttributes extends Optional<AgreementLeaseTermAttributes,
  'id' | 'datecreation' | 'expenseCategory' | 'tenantCostAllocation'
> {}

/**
 * Modelo Sequelize para a entidade AgreementLeaseTerm
 *
 * Representa um termo de arrendamento vinculado a um Agreement do tipo RENT_LEASE.
 */
class AgreementLeaseTerm
  extends Model<AgreementLeaseTermAttributes, AgreementLeaseTermCreationAttributes>
  implements AgreementLeaseTermAttributes
{
  public id!: number;
  public tenantId!: number;
  public agreementId!: number;
  public termType!: LeaseTermType;
  public expenseCategory!: ExpenseCategory | null;
  public tenantCostAllocation!: number | null;
  public usercreation!: number;
  public datecreation!: Date;

  // Relacionamentos
  public agreement?: Agreement;
  public usuarioCriador?: Usuario;
}

AgreementLeaseTerm.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
      comment: 'ID único do lease term',
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
    termType: {
      type: DataTypes.ENUM('BASE_RENT', 'CROP_SHARE', 'YIELD_ADJUSTMENT', 'EXPENSE_SHARE'),
      allowNull: false,
      comment: 'Tipo do termo: BASE_RENT, CROP_SHARE, YIELD_ADJUSTMENT ou EXPENSE_SHARE',
    },
    expenseCategory: {
      type: DataTypes.ENUM('ALL', 'INPUTS', 'FERTILIZER'),
      allowNull: true,
      comment: 'Categoria de despesa (somente para EXPENSE_SHARE)',
    },
    tenantCostAllocation: {
      type: DataTypes.DECIMAL(5, 2),
      allowNull: true,
      comment: 'Alocação de custo do arrendatário (somente para EXPENSE_SHARE)',
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
    tableName: 'C055_agreementLeaseTerm',
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
Agreement.hasMany(AgreementLeaseTerm, { foreignKey: 'agreementId', as: 'leaseTerms' });
AgreementLeaseTerm.belongsTo(Agreement, { foreignKey: 'agreementId', as: 'agreement' });
AgreementLeaseTerm.belongsTo(Usuario, { foreignKey: 'usercreation', as: 'usuarioCriador' });

export default AgreementLeaseTerm;
