import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';
import Talhao from './Talhao';
import Safra from './Safra';
import Cultura from './Cultura';
import Produto from './Produto';
import Usuario from './Usuario';

/**
 * Interface para atributos da entidade ConfiguradorCiclo
 */
interface ConfiguradorCicloAttributes {
  id_cfg: number;
  tenantId: number;
  idTalhao: number;
  idCiclo: number;
  idCultura: number;
  idVariedadeCiclo?: number | null;
  inicioPlantio?: string | null;
  fimPlantio?: string | null;
  previsaoColheita?: string | null;
  inicioColheita?: string | null;
  fimColheita?: string | null;
  observacao?: string | null;
  areaPlantada?: number | null;
  estimativaProducao?: number | null;
  usercreation: number;
  datecreation: Date;
}

/**
 * Interface para atributos de criação (id_cfg é opcional pois é auto-increment)
 */
interface ConfiguradorCicloCreationAttributes extends Optional<ConfiguradorCicloAttributes, 'id_cfg' | 'datecreation'> {}

/**
 * Modelo Sequelize para a entidade ConfiguradorCiclo
 *
 * Configuração de ciclos de plantio/colheita por talhão
 */
class ConfiguradorCiclo
  extends Model<ConfiguradorCicloAttributes, ConfiguradorCicloCreationAttributes>
  implements ConfiguradorCicloAttributes
{
  public id_cfg!: number;
  public tenantId!: number;
  public idTalhao!: number;
  public idCiclo!: number;
  public idCultura!: number;
  public idVariedadeCiclo!: number | null;
  public inicioPlantio!: string | null;
  public fimPlantio!: string | null;
  public previsaoColheita!: string | null;
  public inicioColheita!: string | null;
  public fimColheita!: string | null;
  public observacao!: string | null;
  public areaPlantada!: number | null;
  public estimativaProducao!: number | null;
  public usercreation!: number;
  public datecreation!: Date;

  // Relacionamentos
  public talhao?: Talhao;
  public ciclo?: Safra;
  public cultura?: Cultura;
  public variedadeCiclo?: Produto;
  public usuarioCriador?: Usuario;
}

ConfiguradorCiclo.init(
  {
    id_cfg: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
      comment: 'ID único do configurador de ciclo',
    },
    tenantId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: 'tenantId',
      comment: 'ID do tenant ao qual o configurador pertence',
    },
    idTalhao: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: 'ID do talhão',
      references: {
        model: 'C034_talhao',
        key: 'id_talhao',
      },
      onUpdate: 'CASCADE',
      onDelete: 'RESTRICT',
    },
    idCiclo: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: 'ID do ciclo/safra',
      references: {
        model: 'C017_safra',
        key: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'RESTRICT',
    },
    idCultura: {
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
    idVariedadeCiclo: {
      type: DataTypes.INTEGER,
      allowNull: true,
      comment: 'ID da variedade do ciclo (produto)',
      references: {
        model: 'C008_produto',
        key: 'id_prod',
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL',
    },
    inicioPlantio: {
      type: DataTypes.DATEONLY,
      allowNull: true,
      comment: 'Data de início do plantio',
    },
    fimPlantio: {
      type: DataTypes.DATEONLY,
      allowNull: true,
      comment: 'Data de fim do plantio',
    },
    previsaoColheita: {
      type: DataTypes.DATEONLY,
      allowNull: true,
      comment: 'Previsão de colheita',
    },
    inicioColheita: {
      type: DataTypes.DATEONLY,
      allowNull: true,
      comment: 'Data de início da colheita',
    },
    fimColheita: {
      type: DataTypes.DATEONLY,
      allowNull: true,
      comment: 'Data de fim da colheita',
    },
    observacao: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: 'Observações gerais',
    },
    areaPlantada: {
      type: DataTypes.DECIMAL(18, 4),
      allowNull: true,
      comment: 'Área plantada',
    },
    estimativaProducao: {
      type: DataTypes.DECIMAL(18, 4),
      allowNull: true,
      comment: 'Estimativa de produção',
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
    tableName: 'C035_configuradorCiclo',
    timestamps: false,
    underscored: false,
    indexes: [
      {
        fields: ['tenantId'],
      },
      {
        fields: ['idTalhao'],
      },
      {
        fields: ['idCiclo'],
      },
      {
        fields: ['idCultura'],
      },
      {
        fields: ['idTalhao', 'idCiclo', 'idCultura'],
      },
    ],
  }
);

// Setup associations
Talhao.hasMany(ConfiguradorCiclo, { foreignKey: 'idTalhao', as: 'configuradoresCiclo' });
ConfiguradorCiclo.belongsTo(Talhao, { foreignKey: 'idTalhao', as: 'talhao' });
ConfiguradorCiclo.belongsTo(Safra, { foreignKey: 'idCiclo', as: 'ciclo' });
ConfiguradorCiclo.belongsTo(Cultura, { foreignKey: 'idCultura', as: 'cultura' });
ConfiguradorCiclo.belongsTo(Produto, { foreignKey: 'idVariedadeCiclo', as: 'variedadeCiclo' });
ConfiguradorCiclo.belongsTo(Usuario, { foreignKey: 'usercreation', as: 'usuarioCriador' });

export default ConfiguradorCiclo;
