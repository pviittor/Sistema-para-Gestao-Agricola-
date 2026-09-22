import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';
import Fazenda from './Fazenda';
import Usuario from './Usuario';

/**
 * Interface para atributos da entidade Talhao
 */
interface TalhaoAttributes {
  id_talhao: number;
  tenantId: number;
  descricao: string;
  idFazenda: number;
  area: number;
  geometry: object | null;
  grupo: string | null;
  usercreation: number;
  datecreation: Date;
}

/**
 * Interface para atributos de criação (id_talhao é opcional pois é auto-increment)
 */
interface TalhaoCreationAttributes extends Optional<TalhaoAttributes, 'id_talhao' | 'datecreation' | 'geometry' | 'grupo'> {}

/**
 * Modelo Sequelize para a entidade Talhao
 *
 * Cadastro de talhões (subdivisões de fazendas)
 */
class Talhao
  extends Model<TalhaoAttributes, TalhaoCreationAttributes>
  implements TalhaoAttributes
{
  public id_talhao!: number;
  public tenantId!: number;
  public descricao!: string;
  public idFazenda!: number;
  public area!: number;
  public geometry!: object | null;
  public grupo!: string | null;
  public usercreation!: number;
  public datecreation!: Date;

  // Relacionamentos
  public fazenda?: Fazenda;
  public usuarioCriador?: Usuario;
}

Talhao.init(
  {
    id_talhao: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
      comment: 'ID único do talhão',
    },
    tenantId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: 'tenantId',
      comment: 'ID do tenant ao qual o talhão pertence',
    },
    descricao: {
      type: DataTypes.STRING(255),
      allowNull: false,
      comment: 'Descrição do talhão',
    },
    idFazenda: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: 'ID da fazenda',
      references: {
        model: 'C018_fazenda',
        key: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'RESTRICT',
    },
    area: {
      type: DataTypes.DECIMAL(18, 4),
      allowNull: false,
      comment: 'Área do talhão',
    },
    geometry: {
      type: DataTypes.JSON,
      allowNull: true,
      defaultValue: null,
      comment: 'GeoJSON Polygon do talhão',
    },
    grupo: {
      type: DataTypes.STRING(100),
      allowNull: true,
      defaultValue: null,
      comment: 'Grupo do talhão para organização',
    },
    usercreation: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: 'ID do usuário que criou o registro',
      references: {
        model: 'usuarios',
        key: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'RESTRICT',
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
    tableName: 'C034_talhao',
    timestamps: false,
    underscored: false,
    indexes: [
      {
        fields: ['tenantId'],
      },
      {
        fields: ['idFazenda'],
      },
      {
        fields: ['usercreation'],
      },
    ],
  }
);

// Setup associations
Talhao.belongsTo(Fazenda, { foreignKey: 'idFazenda', as: 'fazenda' });
Talhao.belongsTo(Usuario, { foreignKey: 'usercreation', as: 'usuarioCriador' });

export default Talhao;
