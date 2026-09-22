import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';
import Usuario from './Usuario';
import Produto from './Produto';

/**
 * Interface para atributos da entidade Cultura
 */
interface CulturaAttributes {
  id: number;
  tenantId: number;
  descricao_clt: string;
  idProduto: number;
  usercreation: number;
  datecreation: Date;
}

/**
 * Interface para atributos de criação (id é opcional pois é auto-increment)
 */
interface CulturaCreationAttributes extends Optional<CulturaAttributes, 'id' | 'datecreation'> {}

/**
 * Modelo Sequelize para a entidade Cultura
 * 
 * Culturas do sistema
 */
class Cultura
  extends Model<CulturaAttributes, CulturaCreationAttributes>
  implements CulturaAttributes
{
  public id!: number;
  public tenantId!: number;
  public descricao_clt!: string;
  public idProduto!: number;
  public usercreation!: number;
  public datecreation!: Date;
}

Cultura.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
      comment: 'ID único da cultura',
    },
    tenantId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: 'tenantId',
      comment: 'ID do tenant ao qual a cultura pertence',
    },
    descricao_clt: {
      type: DataTypes.STRING(255),
      allowNull: false,
      comment: 'Descrição da cultura',
    },
    idProduto: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: 'ID do produto relacionado',
      references: {
        model: 'C008_produto',
        key: 'id_prod',
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
  },
  {
    sequelize,
    tableName: 'C009_cultura',
    timestamps: false,
    underscored: false,
  }
);

// Setup associations
Cultura.belongsTo(Usuario, { foreignKey: 'usercreation', as: 'usuarioCriador' });
Cultura.belongsTo(Produto, { foreignKey: 'idProduto', as: 'produto' });

export default Cultura;
