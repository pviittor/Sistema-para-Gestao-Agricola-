import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';
import Usuario from './Usuario';
import Estado from './Estado';

/**
 * Interface para atributos da entidade Municipio
 */
interface MunicipioAttributes {
  id: number;
  nome: string;
  idEstado: number;
  codigoIBGE?: number | null;
  ativo: boolean;
  usercreation: number;
  datecreation: Date;
}

/**
 * Interface para atributos de criação (id é opcional pois é auto-increment)
 */
interface MunicipioCreationAttributes extends Optional<MunicipioAttributes, 'id' | 'datecreation' | 'ativo' | 'codigoIBGE'> {}

/**
 * Modelo Sequelize para a entidade Municipio
 * 
 * Municípios brasileiros (dados globais, não vinculados a tenant)
 */
class Municipio
  extends Model<MunicipioAttributes, MunicipioCreationAttributes>
  implements MunicipioAttributes
{
  public id!: number;
  public nome!: string;
  public idEstado!: number;
  public codigoIBGE!: number | null;
  public ativo!: boolean;
  public usercreation!: number;
  public datecreation!: Date;

  // Relacionamentos
  public estado?: Estado;
  public usuarioCriador?: Usuario;
}

Municipio.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
      comment: 'ID único do município',
    },
    nome: {
      type: DataTypes.STRING(255),
      allowNull: false,
      comment: 'Nome do município',
    },
    idEstado: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: 'ID do estado ao qual o município pertence',
      references: {
        model: 'C014_estado',
        key: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'RESTRICT',
    },
    codigoIBGE: {
      type: DataTypes.INTEGER,
      allowNull: true,
      unique: true,
      comment: 'Código do município no IBGE',
    },
    ativo: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
      comment: 'Se o município está ativo',
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
    tableName: 'C015_municipio',
    timestamps: false,
    underscored: false,
    indexes: [
      {
        fields: ['idEstado'],
      },
      {
        fields: ['codigoIBGE'],
        unique: true,
      },
      {
        fields: ['ativo'],
      },
      {
        fields: ['nome'],
      },
      {
        fields: ['usercreation'],
      },
    ],
  }
);

// Setup associations
Municipio.belongsTo(Usuario, { foreignKey: 'usercreation', as: 'usuarioCriador' });
Municipio.belongsTo(Estado, { foreignKey: 'idEstado', as: 'estado' });

// Configurar associação reversa após Municipio ser definido
Estado.hasMany(Municipio, { foreignKey: 'idEstado', as: 'municipios' });

export default Municipio;
