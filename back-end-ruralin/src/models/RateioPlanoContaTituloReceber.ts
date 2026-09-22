import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';
import Usuario from './Usuario';
import TituloReceber from './TituloReceber';
import PlanoContaGerencial from './PlanoContaGerencial';

/**
 * Interface para atributos da entidade RateioPlanoContaTituloReceber
 */
interface RateioPlanoContaTituloReceberAttributes {
  id: number;
  tenantId: number;
  idTituloReceber: number;
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
interface RateioPlanoContaTituloReceberCreationAttributes extends Optional<RateioPlanoContaTituloReceberAttributes, 'id' | 'datecreation' | 'observacao'> {}

/**
 * Modelo Sequelize para a entidade RateioPlanoContaTituloReceber
 * 
 * Rateio do valor do título a receber por planos de contas gerenciais.
 */
class RateioPlanoContaTituloReceber
  extends Model<RateioPlanoContaTituloReceberAttributes, RateioPlanoContaTituloReceberCreationAttributes>
  implements RateioPlanoContaTituloReceberAttributes
{
  public id!: number;
  public tenantId!: number;
  public idTituloReceber!: number;
  public idPlanoContaGerencial!: number;
  public valorRateio!: number;
  public percentualRateio!: number;
  public observacao!: string | null;
  public usercreation!: number;
  public datecreation!: Date;

  // Relacionamentos
  public tituloReceber?: TituloReceber;
  public planoContaGerencial?: PlanoContaGerencial;
  public usuarioCriador?: Usuario;
}

RateioPlanoContaTituloReceber.init(
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
    tableName: 'C025_rateioPlanoContaTituloReceber',
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
        fields: ['idPlanoContaGerencial'],
      },
      {
        fields: ['usercreation'],
      },
    ],
  }
);

// Setup associations
RateioPlanoContaTituloReceber.belongsTo(Usuario, { foreignKey: 'usercreation', as: 'usuarioCriador' });
RateioPlanoContaTituloReceber.belongsTo(TituloReceber, { foreignKey: 'idTituloReceber', as: 'tituloReceber' });
RateioPlanoContaTituloReceber.belongsTo(PlanoContaGerencial, { foreignKey: 'idPlanoContaGerencial', as: 'planoContaGerencial' });
TituloReceber.hasMany(RateioPlanoContaTituloReceber, { foreignKey: 'idTituloReceber', as: 'rateiosPlanoConta' });

export default RateioPlanoContaTituloReceber;
