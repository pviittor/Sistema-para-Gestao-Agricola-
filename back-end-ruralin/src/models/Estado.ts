import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';
import Usuario from './Usuario';

/**
 * Interface para atributos da entidade Estado
 */
interface EstadoAttributes {
  id: number;
  sigla: string;
  nome: string;
  codigoIBGE?: number | null;
  ativo: boolean;
  usercreation: number;
  datecreation: Date;
}

/**
 * Interface para atributos de criação (id é opcional pois é auto-increment)
 */
interface EstadoCreationAttributes extends Optional<EstadoAttributes, 'id' | 'datecreation' | 'ativo' | 'codigoIBGE'> {}

/**
 * Modelo Sequelize para a entidade Estado
 * 
 * Estados brasileiros (dados globais, não vinculados a tenant)
 */
class Estado
  extends Model<EstadoAttributes, EstadoCreationAttributes>
  implements EstadoAttributes
{
  public id!: number;
  public sigla!: string;
  public nome!: string;
  public codigoIBGE!: number | null;
  public ativo!: boolean;
  public usercreation!: number;
  public datecreation!: Date;

  // Relacionamentos
  public municipios?: any[];
  public usuarioCriador?: Usuario;
}

Estado.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
      comment: 'ID único do estado',
    },
    sigla: {
      type: DataTypes.STRING(2),
      allowNull: false,
      unique: true,
      comment: 'Sigla do estado (ex: SP, RJ, MG)',
    },
    nome: {
      type: DataTypes.STRING(100),
      allowNull: false,
      comment: 'Nome completo do estado',
    },
    codigoIBGE: {
      type: DataTypes.INTEGER,
      allowNull: true,
      unique: true,
      comment: 'Código do estado no IBGE',
    },
    ativo: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
      comment: 'Se o estado está ativo',
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
    tableName: 'C014_estado',
    timestamps: false,
    underscored: false,
    indexes: [
      {
        fields: ['sigla'],
        unique: true,
      },
      {
        fields: ['codigoIBGE'],
        unique: true,
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
Estado.belongsTo(Usuario, { foreignKey: 'usercreation', as: 'usuarioCriador' });
// Associação com Municipio será feita após Municipio ser definido (ver src/models/Municipio.ts)

export default Estado;
