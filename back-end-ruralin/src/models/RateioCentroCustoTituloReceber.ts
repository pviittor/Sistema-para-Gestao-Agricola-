import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';
import Usuario from './Usuario';
import TituloReceber from './TituloReceber';
import CentroCusto from './CentroCusto';

/**
 * Interface para atributos da entidade RateioCentroCustoTituloReceber
 */
interface RateioCentroCustoTituloReceberAttributes {
  id: number;
  tenantId: number;
  idTituloReceber: number;
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
interface RateioCentroCustoTituloReceberCreationAttributes extends Optional<RateioCentroCustoTituloReceberAttributes, 'id' | 'datecreation' | 'observacao'> {}

/**
 * Modelo Sequelize para a entidade RateioCentroCustoTituloReceber
 * 
 * Rateio do valor do título a receber por centros de custo.
 */
class RateioCentroCustoTituloReceber
  extends Model<RateioCentroCustoTituloReceberAttributes, RateioCentroCustoTituloReceberCreationAttributes>
  implements RateioCentroCustoTituloReceberAttributes
{
  public id!: number;
  public tenantId!: number;
  public idTituloReceber!: number;
  public idCentroCusto!: number;
  public valorRateio!: number;
  public percentualRateio!: number;
  public observacao!: string | null;
  public usercreation!: number;
  public datecreation!: Date;

  // Relacionamentos
  public tituloReceber?: TituloReceber;
  public centroCusto?: CentroCusto;
  public usuarioCriador?: Usuario;
}

RateioCentroCustoTituloReceber.init(
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
    idTituloReceber: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: 'ID do título a receber ao qual o rateio pertence',
      references: {
        model: 'C023_tituloReceber',
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
    tableName: 'C026_rateioCentroCustoTituloReceber',
    timestamps: false,
    underscored: false,
    indexes: [
      {
        fields: ['tenantId'],
      },
      {
        fields: ['idTituloReceber'],
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
RateioCentroCustoTituloReceber.belongsTo(Usuario, { foreignKey: 'usercreation', as: 'usuarioCriador' });
RateioCentroCustoTituloReceber.belongsTo(TituloReceber, { foreignKey: 'idTituloReceber', as: 'tituloReceber' });
RateioCentroCustoTituloReceber.belongsTo(CentroCusto, { foreignKey: 'idCentroCusto', as: 'centroCusto' });
TituloReceber.hasMany(RateioCentroCustoTituloReceber, { foreignKey: 'idTituloReceber', as: 'rateiosCentroCusto' });

export default RateioCentroCustoTituloReceber;
