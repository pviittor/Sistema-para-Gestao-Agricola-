import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';
import Usuario from './Usuario';
import TituloPagar from './TituloPagar';
import PlanoContaGerencial from './PlanoContaGerencial';

/**
 * Interface para atributos da entidade RateioPlanoContaTituloPagar
 */
interface RateioPlanoContaTituloPagarAttributes {
  id: number;
  tenantId: number;
  idTituloPagar: number;
  idPlanoContaGerencial: number;
  valorRateio: number;
  percentualRateio: number;
  observacao?: string | null;
  usercreation: number;
  datecreation: Date;
}

/**
 * Interface para atributos de criação (id é opcional pois é auto-increment)
 */
interface RateioPlanoContaTituloPagarCreationAttributes extends Optional<RateioPlanoContaTituloPagarAttributes, 'id' | 'datecreation' | 'observacao'> {}

/**
 * Modelo Sequelize para a entidade RateioPlanoContaTituloPagar
 * 
 * Rateio do valor do título a pagar por planos de contas gerenciais.
 */
class RateioPlanoContaTituloPagar
  extends Model<RateioPlanoContaTituloPagarAttributes, RateioPlanoContaTituloPagarCreationAttributes>
  implements RateioPlanoContaTituloPagarAttributes
{
  public id!: number;
  public tenantId!: number;
  public idTituloPagar!: number;
  public idPlanoContaGerencial!: number;
  public valorRateio!: number;
  public percentualRateio!: number;
  public observacao!: string | null;
  public usercreation!: number;
  public datecreation!: Date;

  // Relacionamentos
  public tituloPagar?: TituloPagar;
  public planoContaGerencial?: PlanoContaGerencial;
  public usuarioCriador?: Usuario;
}

RateioPlanoContaTituloPagar.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
      comment: 'ID único do rateio',
    },
    tenantId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: 'tenantId',
      comment: 'ID do tenant ao qual o rateio pertence',
    },
    idTituloPagar: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: 'ID do título a pagar ao qual o rateio pertence',
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
    valorRateio: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: false,
      comment: 'Valor do rateio',
    },
    percentualRateio: {
      type: DataTypes.DECIMAL(5, 2),
      allowNull: false,
      comment: 'Percentual do rateio em relação ao valor do título (calculado automaticamente)',
    },
    observacao: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: 'Observações sobre o rateio',
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
    tableName: 'C021_rateioPlanoContaTituloPagar',
    timestamps: false,
    underscored: false,
    indexes: [
      {
        fields: ['tenantId'],
      },
      {
        fields: ['idTituloPagar'],
      },
      {
        fields: ['idPlanoContaGerencial'],
      },
      {
        fields: ['usercreation'],
      },
    ],
  }
);

// Setup associations
RateioPlanoContaTituloPagar.belongsTo(Usuario, { foreignKey: 'usercreation', as: 'usuarioCriador' });
RateioPlanoContaTituloPagar.belongsTo(TituloPagar, { foreignKey: 'idTituloPagar', as: 'tituloPagar' });
RateioPlanoContaTituloPagar.belongsTo(PlanoContaGerencial, { foreignKey: 'idPlanoContaGerencial', as: 'planoContaGerencial' });
TituloPagar.hasMany(RateioPlanoContaTituloPagar, { foreignKey: 'idTituloPagar', as: 'rateiosPlanoConta' });

export default RateioPlanoContaTituloPagar;
