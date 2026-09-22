import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';
import Apontamento from './Apontamento';
import Maquina from './Maquina';
import Pessoa from './Pessoa';
import Abastecimento from './Abastecimento';
import Usuario from './Usuario';

/**
 * Interface para atributos da entidade ApontamentoMaquinas
 */
interface ApontamentoMaquinasAttributes {
  id_aptmaq: number;
  tenantId: number;
  idApontamento: number;
  idMaquina: number;
  idImplemento?: number | null;
  idOperador?: number | null;
  idAbastecimento?: number | null;
  data: string;
  horaInicio: number;
  horaFim: number;
  horaTotal: number;
  valorHora: number;
  valorHoraImpl: number;
  vazao: number;
  haBomba: number;
  velocidade: number;
  pulv: number;
  consumoEstimado: number;
  estimativaCombustivelUtilizado: number;
  informouAbastecimento: boolean;
  consumoHRMaquina: number;
  consumoHRImplemento: number;
  consumoHAMaquina: number;
  consumoHAImplemento: number;
  custoHAMaquina: number;
  custoHAImplemento: number;
  custoHRMaquina: number;
  custoHRImplemento: number;
  areaTrabalhada: number;
  usercreation: number;
  datecreation: Date;
}

/**
 * Interface para atributos de criacao (id_aptmaq e opcional pois e auto-increment)
 */
interface ApontamentoMaquinasCreationAttributes extends Optional<ApontamentoMaquinasAttributes, 'id_aptmaq' | 'datecreation'> {}

/**
 * Modelo Sequelize para a entidade ApontamentoMaquinas
 *
 * Registro de maquinas utilizadas em apontamentos de atividades agricolas
 */
class ApontamentoMaquinas
  extends Model<ApontamentoMaquinasAttributes, ApontamentoMaquinasCreationAttributes>
  implements ApontamentoMaquinasAttributes
{
  public id_aptmaq!: number;
  public tenantId!: number;
  public idApontamento!: number;
  public idMaquina!: number;
  public idImplemento!: number | null;
  public idOperador!: number | null;
  public idAbastecimento!: number | null;
  public data!: string;
  public horaInicio!: number;
  public horaFim!: number;
  public horaTotal!: number;
  public valorHora!: number;
  public valorHoraImpl!: number;
  public vazao!: number;
  public haBomba!: number;
  public velocidade!: number;
  public pulv!: number;
  public consumoEstimado!: number;
  public estimativaCombustivelUtilizado!: number;
  public informouAbastecimento!: boolean;
  public consumoHRMaquina!: number;
  public consumoHRImplemento!: number;
  public consumoHAMaquina!: number;
  public consumoHAImplemento!: number;
  public custoHAMaquina!: number;
  public custoHAImplemento!: number;
  public custoHRMaquina!: number;
  public custoHRImplemento!: number;
  public areaTrabalhada!: number;
  public usercreation!: number;
  public datecreation!: Date;

  // Relacionamentos
  public apontamento?: Apontamento;
  public maquina?: Maquina;
  public implemento?: Maquina;
  public operador?: Pessoa;
  public abastecimento?: Abastecimento;
  public usuarioCriador?: Usuario;
}

ApontamentoMaquinas.init(
  {
    id_aptmaq: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
      comment: 'ID unico do apontamento de maquina',
    },
    tenantId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: 'tenantId',
      comment: 'ID do tenant ao qual o apontamento de maquina pertence',
    },
    idApontamento: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: 'ID do apontamento',
      references: {
        model: 'C038_apontamento',
        key: 'id_apt',
      },
      onUpdate: 'CASCADE',
      onDelete: 'RESTRICT',
    },
    idMaquina: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: 'ID da maquina',
      references: {
        model: 'C030_maquina',
        key: 'id_mqn',
      },
      onUpdate: 'CASCADE',
      onDelete: 'RESTRICT',
    },
    idImplemento: {
      type: DataTypes.INTEGER,
      allowNull: true,
      comment: 'ID do implemento (maquina)',
      references: {
        model: 'C030_maquina',
        key: 'id_mqn',
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL',
    },
    idOperador: {
      type: DataTypes.INTEGER,
      allowNull: true,
      comment: 'ID do operador (pessoa)',
      references: {
        model: 'C001_PESSOA',
        key: 'id_pessoa',
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL',
    },
    idAbastecimento: {
      type: DataTypes.INTEGER,
      allowNull: true,
      comment: 'ID do abastecimento',
      references: {
        model: 'C031_abastecimento',
        key: 'id_abast',
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL',
    },
    data: {
      type: DataTypes.DATEONLY,
      allowNull: false,
      comment: 'Data do apontamento de maquina',
    },
    horaInicio: {
      type: DataTypes.DECIMAL(18, 4),
      allowNull: false,
      comment: 'Hora de inicio',
    },
    horaFim: {
      type: DataTypes.DECIMAL(18, 4),
      allowNull: false,
      comment: 'Hora de fim',
    },
    horaTotal: {
      type: DataTypes.DECIMAL(18, 4),
      allowNull: false,
      comment: 'Hora total',
    },
    valorHora: {
      type: DataTypes.DECIMAL(18, 4),
      allowNull: false,
      comment: 'Valor por hora da maquina',
    },
    valorHoraImpl: {
      type: DataTypes.DECIMAL(18, 4),
      allowNull: false,
      comment: 'Valor por hora do implemento',
    },
    vazao: {
      type: DataTypes.DECIMAL(18, 4),
      allowNull: false,
      comment: 'Vazao',
    },
    haBomba: {
      type: DataTypes.DECIMAL(18, 4),
      allowNull: false,
      comment: 'Hectares por bomba',
    },
    velocidade: {
      type: DataTypes.DECIMAL(18, 4),
      allowNull: false,
      comment: 'Velocidade',
    },
    pulv: {
      type: DataTypes.DECIMAL(18, 4),
      allowNull: false,
      comment: 'Pulverizacao',
    },
    consumoEstimado: {
      type: DataTypes.DECIMAL(18, 4),
      allowNull: false,
      comment: 'Consumo estimado',
    },
    estimativaCombustivelUtilizado: {
      type: DataTypes.DECIMAL(18, 4),
      allowNull: false,
      comment: 'Estimativa de combustivel utilizado',
    },
    informouAbastecimento: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
      comment: 'Indica se informou abastecimento',
    },
    consumoHRMaquina: {
      type: DataTypes.DECIMAL(18, 4),
      allowNull: false,
      comment: 'Consumo HR da maquina',
    },
    consumoHRImplemento: {
      type: DataTypes.DECIMAL(18, 4),
      allowNull: false,
      comment: 'Consumo HR do implemento',
    },
    consumoHAMaquina: {
      type: DataTypes.DECIMAL(18, 4),
      allowNull: false,
      comment: 'Consumo HA da maquina',
    },
    consumoHAImplemento: {
      type: DataTypes.DECIMAL(18, 4),
      allowNull: false,
      comment: 'Consumo HA do implemento',
    },
    custoHAMaquina: {
      type: DataTypes.DECIMAL(18, 4),
      allowNull: false,
      comment: 'Custo HA da maquina',
    },
    custoHAImplemento: {
      type: DataTypes.DECIMAL(18, 4),
      allowNull: false,
      comment: 'Custo HA do implemento',
    },
    custoHRMaquina: {
      type: DataTypes.DECIMAL(18, 4),
      allowNull: false,
      comment: 'Custo HR da maquina',
    },
    custoHRImplemento: {
      type: DataTypes.DECIMAL(18, 4),
      allowNull: false,
      comment: 'Custo HR do implemento',
    },
    areaTrabalhada: {
      type: DataTypes.DECIMAL(18, 4),
      allowNull: false,
      comment: 'Area trabalhada',
    },
    usercreation: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: 'ID do usuario que criou o registro',
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
      comment: 'Data de criacao do registro',
    },
  },
  {
    sequelize,
    tableName: 'C039_apontamentoMaquinas',
    timestamps: false,
    underscored: false,
    indexes: [
      {
        fields: ['tenantId'],
      },
      {
        fields: ['idApontamento'],
      },
      {
        fields: ['idMaquina'],
      },
      {
        fields: ['data'],
      },
      {
        fields: ['usercreation'],
      },
    ],
  }
);

// Setup associations
ApontamentoMaquinas.belongsTo(Apontamento, { foreignKey: 'idApontamento', as: 'apontamento' });
ApontamentoMaquinas.belongsTo(Maquina, { foreignKey: 'idMaquina', as: 'maquina' });
ApontamentoMaquinas.belongsTo(Maquina, { foreignKey: 'idImplemento', as: 'implemento' });
ApontamentoMaquinas.belongsTo(Pessoa, { foreignKey: 'idOperador', as: 'operador' });
ApontamentoMaquinas.belongsTo(Abastecimento, { foreignKey: 'idAbastecimento', as: 'abastecimento' });
ApontamentoMaquinas.belongsTo(Usuario, { foreignKey: 'usercreation', as: 'usuarioCriador' });

export default ApontamentoMaquinas;
