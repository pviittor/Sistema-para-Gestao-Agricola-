import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/database';
import Agreement from './Agreement';
import Talhao from './Talhao';

/**
 * Interface para atributos da entidade AgreementField
 */
interface AgreementFieldAttributes {
  agreementId: number;
  fieldId: number;
  tenantId: number;
}

/**
 * Interface para atributos de criação (todos obrigatórios — pivot table sem auto-increment)
 */
type AgreementFieldCreationAttributes = AgreementFieldAttributes;

/**
 * Modelo Sequelize para a entidade AgreementField
 *
 * Tabela pivô que vincula Agreement a Talhao (field/talhão).
 */
class AgreementField
  extends Model<AgreementFieldAttributes, AgreementFieldCreationAttributes>
  implements AgreementFieldAttributes
{
  public agreementId!: number;
  public fieldId!: number;
  public tenantId!: number;

  // Relacionamentos
  public agreement?: Agreement;
  public talhao?: Talhao;
}

AgreementField.init(
  {
    agreementId: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      allowNull: false,
      comment: 'ID do agreement (FK, parte da PK composta)',
      references: {
        model: 'C054_agreement',
        key: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE',
    },
    fieldId: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      allowNull: false,
      comment: 'ID do talhão (FK, parte da PK composta)',
      references: {
        model: 'C034_talhao',
        key: 'id_talhao',
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE',
    },
    tenantId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: 'tenantId',
      comment: 'ID do tenant ao qual o registro pertence',
    },
  },
  {
    sequelize,
    tableName: 'C057_agreementField',
    timestamps: false,
    underscored: false,
    indexes: [
      {
        fields: ['tenantId'],
      },
      {
        fields: ['fieldId'],
      },
    ],
  }
);

// Associations — both defined in child file to avoid circular imports
Agreement.hasMany(AgreementField, { foreignKey: 'agreementId', as: 'agreementFields' });
AgreementField.belongsTo(Agreement, { foreignKey: 'agreementId', as: 'agreement' });
AgreementField.belongsTo(Talhao, { foreignKey: 'fieldId', as: 'talhao' });

export default AgreementField;
