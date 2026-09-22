import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';
import Moeda from './Moeda';

/**
 * Interface para atributos da entidade MoedaCotacao
 */
interface MoedaCotacaoAttributes {
  id_cotacao: number;
  tenantId: number;
  idMoeda: number;
  data_cotacao: Date;
  valor_cotacao: number;
  fechamento_cotaca: boolean;
}

/**
 * Interface para atributos de criação (id_cotacao é opcional pois é auto-increment)
 */
interface MoedaCotacaoCreationAttributes extends Optional<MoedaCotacaoAttributes, 'id_cotacao'> {}

/**
 * Modelo Sequelize para a entidade MoedaCotacao
 * 
 * Cotações de moedas
 */
class MoedaCotacao
  extends Model<MoedaCotacaoAttributes, MoedaCotacaoCreationAttributes>
  implements MoedaCotacaoAttributes
{
  public id_cotacao!: number;
  public tenantId!: number;
  public idMoeda!: number;
  public data_cotacao!: Date;
  public valor_cotacao!: number;
  public fechamento_cotaca!: boolean;
}

MoedaCotacao.init(
  {
    id_cotacao: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
      comment: 'ID único da cotação',
    },
    tenantId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: 'tenantId',
      comment: 'ID do tenant ao qual a cotação pertence',
    },
    idMoeda: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: 'ID da moeda relacionada',
      references: {
        model: 'C006_moeda',
        key: 'id_moeda',
      },
      onUpdate: 'CASCADE',
      onDelete: 'RESTRICT',
    },
    data_cotacao: {
      type: DataTypes.DATEONLY,
      allowNull: false,
      comment: 'Data da cotação',
    },
    valor_cotacao: {
      type: DataTypes.DECIMAL(18, 4),
      allowNull: false,
      comment: 'Valor da cotação',
    },
    fechamento_cotaca: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
      comment: 'Indica se é fechamento oficial (preço de ajuste)',
    },
  },
  {
    sequelize,
    tableName: 'C007_moedaCotacao',
    timestamps: true,
    underscored: false,
    createdAt: false,
    updatedAt: false,
  }
);

// Setup association
MoedaCotacao.belongsTo(Moeda, { foreignKey: 'idMoeda', as: 'moeda' });

export default MoedaCotacao;
