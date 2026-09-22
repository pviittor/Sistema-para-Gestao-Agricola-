import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';
import OrdemServico from './OrdemServico';
import Maquina from './Maquina';
import Pessoa from './Pessoa';

/**
 * Interface para atributos da entidade OrdemServicoMaquina
 */
interface OrdemServicoMaquinaAttributes {
  id: number;
  tenantId: number;
  ordemServicoId: number;
  maquinaId: number;
  implementoId: number | null;
  operadorId: number | null;
  horasPlanejadas: number | null;
  custoHoraPlanejado: number | null;
  horasReais: number | null;
  custoHoraReal: number | null;
  horimetroInicio: number | null;
  horimetroFim: number | null;
  areaTrabalhada: number | null;
  consumoCombustivel: number | null;
  observacoes: string | null;
}

/**
 * Interface para atributos de criação (id é opcional pois é auto-increment)
 */
interface OrdemServicoMaquinaCreationAttributes
  extends Optional<
    OrdemServicoMaquinaAttributes,
    | 'id'
    | 'implementoId'
    | 'operadorId'
    | 'horasPlanejadas'
    | 'custoHoraPlanejado'
    | 'horasReais'
    | 'custoHoraReal'
    | 'horimetroInicio'
    | 'horimetroFim'
    | 'areaTrabalhada'
    | 'consumoCombustivel'
    | 'observacoes'
  > {}

/**
 * Modelo Sequelize para a entidade OrdemServicoMaquina
 *
 * Máquinas e implementos alocados para execução de uma Ordem de Serviço.
 * Controla horas planejadas/reais, horímetros, área trabalhada e consumo.
 */
class OrdemServicoMaquina
  extends Model<OrdemServicoMaquinaAttributes, OrdemServicoMaquinaCreationAttributes>
  implements OrdemServicoMaquinaAttributes
{
  public id!: number;
  public tenantId!: number;
  public ordemServicoId!: number;
  public maquinaId!: number;
  public implementoId!: number | null;
  public operadorId!: number | null;
  public horasPlanejadas!: number | null;
  public custoHoraPlanejado!: number | null;
  public horasReais!: number | null;
  public custoHoraReal!: number | null;
  public horimetroInicio!: number | null;
  public horimetroFim!: number | null;
  public areaTrabalhada!: number | null;
  public consumoCombustivel!: number | null;
  public observacoes!: string | null;

  // Relacionamentos
  public ordemServico?: OrdemServico;
  public maquina?: Maquina;
  public implemento?: Maquina;
  public operador?: Pessoa;
}

OrdemServicoMaquina.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
      comment: 'ID único do vínculo OS-Máquina',
    },
    tenantId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: 'ID do tenant ao qual o registro pertence',
      references: {
        model: 'C012_tenant',
        key: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE',
    },
    ordemServicoId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: 'ID da ordem de serviço',
      references: {
        model: 'C068_ordemServico',
        key: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE',
    },
    maquinaId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: 'ID da máquina principal utilizada',
      references: {
        model: 'C030_maquina',
        key: 'id_mqn',
      },
      onUpdate: 'CASCADE',
      onDelete: 'RESTRICT',
    },
    implementoId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      comment: 'ID do implemento acoplado à máquina (também referência Maquina)',
      references: {
        model: 'C030_maquina',
        key: 'id_mqn',
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL',
    },
    operadorId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      comment: 'ID da pessoa operadora da máquina',
      references: {
        model: 'C001_PESSOA',
        key: 'id_pessoa',
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL',
    },
    horasPlanejadas: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
      comment: 'Horas planejadas de uso da máquina',
    },
    custoHoraPlanejado: {
      type: DataTypes.DECIMAL(15, 4),
      allowNull: true,
      comment: 'Custo por hora planejado da máquina',
    },
    horasReais: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
      comment: 'Horas reais de uso da máquina',
    },
    custoHoraReal: {
      type: DataTypes.DECIMAL(15, 4),
      allowNull: true,
      comment: 'Custo por hora real da máquina',
    },
    horimetroInicio: {
      type: DataTypes.DECIMAL(18, 4),
      allowNull: true,
      comment: 'Leitura do horímetro no início da OS',
    },
    horimetroFim: {
      type: DataTypes.DECIMAL(18, 4),
      allowNull: true,
      comment: 'Leitura do horímetro no fim da OS',
    },
    areaTrabalhada: {
      type: DataTypes.DECIMAL(18, 4),
      allowNull: true,
      comment: 'Área trabalhada por esta máquina (ha)',
    },
    consumoCombustivel: {
      type: DataTypes.DECIMAL(18, 4),
      allowNull: true,
      comment: 'Consumo de combustível registrado (litros)',
    },
    observacoes: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: 'Observações sobre o uso da máquina na OS',
    },
  },
  {
    sequelize,
    tableName: 'C071_ordemServicoMaquina',
    timestamps: true,
    underscored: false,
    indexes: [
      {
        fields: ['ordemServicoId'],
      },
      {
        fields: ['maquinaId'],
      },
      {
        fields: ['tenantId'],
      },
    ],
  }
);

// Associations definidas neste arquivo (padrão master-detail)
OrdemServico.hasMany(OrdemServicoMaquina, { foreignKey: 'ordemServicoId', as: 'maquinas' });
OrdemServicoMaquina.belongsTo(OrdemServico, { foreignKey: 'ordemServicoId', as: 'ordemServico' });
OrdemServicoMaquina.belongsTo(Maquina, { foreignKey: 'maquinaId', targetKey: 'id_mqn', as: 'maquina' });
OrdemServicoMaquina.belongsTo(Maquina, { foreignKey: 'implementoId', targetKey: 'id_mqn', as: 'implemento' });
OrdemServicoMaquina.belongsTo(Pessoa, { foreignKey: 'operadorId', targetKey: 'id_pessoa', as: 'operador' });

export default OrdemServicoMaquina;
