import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';
import Usuario from './Usuario';

/**
 * Interface para atributos da entidade CentroCusto
 */
interface CentroCustoAttributes {
  id: number;
  tenantId: number;
  codigo: string;
  nome: string;
  centroCustoPaiId?: number | null;
  ativo: boolean;
  usercreation: number;
  datecreation: Date;
}

/**
 * Interface para atributos de criação (id é opcional pois é auto-increment)
 */
interface CentroCustoCreationAttributes extends Optional<CentroCustoAttributes, 'id' | 'datecreation' | 'ativo' | 'centroCustoPaiId'> {}

/**
 * Modelo Sequelize para a entidade CentroCusto
 * 
 * Centros de custo com hierarquia
 */
class CentroCusto
  extends Model<CentroCustoAttributes, CentroCustoCreationAttributes>
  implements CentroCustoAttributes
{
  public id!: number;
  public tenantId!: number;
  public codigo!: string;
  public nome!: string;
  public centroCustoPaiId!: number | null;
  public ativo!: boolean;
  public usercreation!: number;
  public datecreation!: Date;

  // Relacionamentos
  public centroCustoPai?: CentroCusto | null;
  public centrosCustoFilhos?: CentroCusto[];
  public usuarioCriador?: Usuario;
}

CentroCusto.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
      comment: 'ID único do centro de custo',
    },
    tenantId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: 'tenantId',
      comment: 'ID do tenant ao qual o centro de custo pertence',
    },
    codigo: {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: true,
      comment: 'Código do centro de custo',
    },
    nome: {
      type: DataTypes.STRING(255),
      allowNull: false,
      comment: 'Nome do centro de custo',
    },
    centroCustoPaiId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      comment: 'ID do centro de custo pai (para hierarquia). NULL para centros de custo de primeiro nível',
      references: {
        model: 'C016_centroCusto',
        key: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL',
    },
    ativo: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
      comment: 'Se o centro de custo está ativo',
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
    tableName: 'C016_centroCusto',
    timestamps: false,
    underscored: false,
    indexes: [
      {
        fields: ['tenantId'],
      },
      {
        fields: ['codigo'],
        unique: true,
      },
      {
        fields: ['centroCustoPaiId'],
      },
      {
        fields: ['ativo'],
      },
      {
        fields: ['usercreation'],
      },
    ],
  }
);

// Setup associations
CentroCusto.belongsTo(Usuario, { foreignKey: 'usercreation', as: 'usuarioCriador' });
CentroCusto.belongsTo(CentroCusto, { foreignKey: 'centroCustoPaiId', as: 'centroCustoPai' });
CentroCusto.hasMany(CentroCusto, { foreignKey: 'centroCustoPaiId', as: 'centrosCustoFilhos' });

export default CentroCusto;
