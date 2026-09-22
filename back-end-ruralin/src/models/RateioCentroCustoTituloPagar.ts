import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';
import Usuario from './Usuario';
import TituloPagar from './TituloPagar';
import CentroCusto from './CentroCusto';

/**
 * Interface para atributos da entidade RateioCentroCustoTituloPagar
 */
interface RateioCentroCustoTituloPagarAttributes {
  id: number;
  tenantId: number;
  idTituloPagar: number;
  idCentroCusto: number;
  valorRateio: number;
  percentualRateio: number;
  observacao?: string | null;
  usercreation: number;
  datecreation: Date;
}

/**
 * Interface para atributos de criação (id é opcional pois é auto-increment)
 */
interface RateioCentroCustoTituloPagarCreationAttributes extends Optional<RateioCentroCustoTituloPagarAttributes, 'id' | 'datecreation' | 'observacao'> {}

/**
 * Modelo Sequelize para a entidade RateioCentroCustoTituloPagar
 * 
 * Rateio do valor do título a pagar por centros de custo.
 */
class RateioCentroCustoTituloPagar
  extends Model<RateioCentroCustoTituloPagarAttributes, RateioCentroCustoTituloPagarCreationAttributes>
  implements RateioCentroCustoTituloPagarAttributes
{
  public id!: number;
  public tenantId!: number;
  public idTituloPagar!: number;
  public idCentroCusto!: number;
  public valorRateio!: number;
  public percentualRateio!: number;
  public observacao!: string | null;
  public usercreation!: number;
  public datecreation!: Date;

  // Relacionamentos
  public tituloPagar?: TituloPagar;
  public centroCusto?: CentroCusto;
  public usuarioCriador?: Usuario;
}

RateioCentroCustoTituloPagar.init(
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
    tableName: 'C022_rateioCentroCustoTituloPagar',
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
        fields: ['idCentroCusto'],
      },
      {
        fields: ['usercreation'],
      },
    ],
  }
);

// Setup associations
RateioCentroCustoTituloPagar.belongsTo(Usuario, { foreignKey: 'usercreation', as: 'usuarioCriador' });
RateioCentroCustoTituloPagar.belongsTo(TituloPagar, { foreignKey: 'idTituloPagar', as: 'tituloPagar' });
RateioCentroCustoTituloPagar.belongsTo(CentroCusto, { foreignKey: 'idCentroCusto', as: 'centroCusto' });
TituloPagar.hasMany(RateioCentroCustoTituloPagar, { foreignKey: 'idTituloPagar', as: 'rateiosCentroCusto' });

export default RateioCentroCustoTituloPagar;
