import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';
import Usuario from './Usuario';
import Cultura from './Cultura';

/**
 * Enum para status da safra
 */
export enum StatusSafra {
  PLANEJADA = 'PLANEJADA',
  EM_ANDAMENTO = 'EM_ANDAMENTO',
  CONCLUIDA = 'CONCLUIDA',
  CANCELADA = 'CANCELADA',
}

/**
 * Interface para atributos da entidade Safra
 */
interface SafraAttributes {
  id: number;
  tenantId: number;
  culturaId: number;
  nome: string;
  dataInicio: Date;
  dataFim?: Date | null;
  status: StatusSafra;
  usercreation: number;
  datecreation: Date;
}

/**
 * Interface para atributos de criação (id é opcional pois é auto-increment)
 */
interface SafraCreationAttributes extends Optional<SafraAttributes, 'id' | 'datecreation' | 'dataFim'> {}

/**
 * Modelo Sequelize para a entidade Safra
 * 
 * Safras agrícolas
 */
class Safra
  extends Model<SafraAttributes, SafraCreationAttributes>
  implements SafraAttributes
{
  public id!: number;
  public tenantId!: number;
  public culturaId!: number;
  public nome!: string;
  public dataInicio!: Date;
  public dataFim!: Date | null;
  public status!: StatusSafra;
  public usercreation!: number;
  public datecreation!: Date;

  // Relacionamentos
  public cultura?: Cultura;
  public usuarioCriador?: Usuario;
}

Safra.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
      comment: 'ID único da safra',
    },
    tenantId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: 'tenantId',
      comment: 'ID do tenant ao qual a safra pertence',
    },
    culturaId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: 'ID da cultura',
      references: {
        model: 'C009_cultura',
        key: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'RESTRICT',
    },
    nome: {
      type: DataTypes.STRING(255),
      allowNull: false,
      comment: 'Nome da safra',
    },
    dataInicio: {
      type: DataTypes.DATEONLY,
      allowNull: false,
      comment: 'Data de início da safra',
    },
    dataFim: {
      type: DataTypes.DATEONLY,
      allowNull: true,
      comment: 'Data de fim da safra',
    },
    status: {
      type: DataTypes.ENUM('PLANEJADA', 'EM_ANDAMENTO', 'CONCLUIDA', 'CANCELADA'),
      allowNull: false,
      defaultValue: 'PLANEJADA',
      comment: 'Status da safra',
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
    tableName: 'C017_safra',
    timestamps: false,
    underscored: false,
    indexes: [
      {
        fields: ['tenantId'],
      },
      {
        fields: ['culturaId'],
      },
      {
        fields: ['status'],
      },
      {
        fields: ['dataInicio'],
      },
      {
        fields: ['dataFim'],
      },
      {
        fields: ['usercreation'],
      },
    ],
  }
);

// Setup associations
Safra.belongsTo(Usuario, { foreignKey: 'usercreation', as: 'usuarioCriador' });
Safra.belongsTo(Cultura, { foreignKey: 'culturaId', as: 'cultura' });

export default Safra;
