import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';
import { StatusOrdemServico, PrioridadeOrdemServico } from './enums/OrdemServicoEnums';
import TipoAtividadeOS from './TipoAtividadeOS';
import Safra from './Safra';
import Fazenda from './Fazenda';
import Usuario from './Usuario';

/**
 * Interface para atributos da entidade OrdemServico
 */
interface OrdemServicoAttributes {
  id: number;
  tenantId: number;
  numero: number;
  tipoAtividadeOSId: number;
  safraId: number | null;
  fazendaId: number;
  descricao: string | null;
  status: StatusOrdemServico;
  prioridade: PrioridadeOrdemServico;
  dataPlanejadaInicio: Date | null;
  dataPlanejadaFim: Date | null;
  dataInicioReal: Date | null;
  dataFimReal: Date | null;
  areaPlanejadaTotal: number | null;
  areaRealTotal: number | null;
  custoEstimado: number | null;
  custoReal: number | null;
  varianciaAreaPercent: number | null;
  varianciaCustoPercent: number | null;
  varianciaDias: number | null;
  camposCondicionais: Record<string, any> | null;
  observacoes: string | null;
  observacoesConclusao: string | null;
  motivoCancelamento: string | null;
  criadoPorId: number | null;
  atribuidoPorId: number | null;
  iniciadoPorId: number | null;
  concluidoPorId: number | null;
  validadoPorId: number | null;
  canceladoPorId: number | null;
  dataValidacao: Date | null;
  estoqueProcessado: boolean;
  financeiroProcessado: boolean;
  syncedAt: Date | null;
  localCreatedAt: Date | null;
  deviceId: string | null;
  createdAt?: Date;
  updatedAt?: Date;
}

/**
 * Interface para atributos de criação (id é opcional pois é auto-increment)
 */
interface OrdemServicoCreationAttributes
  extends Optional<
    OrdemServicoAttributes,
    | 'id'
    | 'safraId'
    | 'descricao'
    | 'status'
    | 'prioridade'
    | 'dataPlanejadaInicio'
    | 'dataPlanejadaFim'
    | 'dataInicioReal'
    | 'dataFimReal'
    | 'areaPlanejadaTotal'
    | 'areaRealTotal'
    | 'custoEstimado'
    | 'custoReal'
    | 'varianciaAreaPercent'
    | 'varianciaCustoPercent'
    | 'varianciaDias'
    | 'camposCondicionais'
    | 'observacoes'
    | 'observacoesConclusao'
    | 'motivoCancelamento'
    | 'criadoPorId'
    | 'atribuidoPorId'
    | 'iniciadoPorId'
    | 'concluidoPorId'
    | 'validadoPorId'
    | 'canceladoPorId'
    | 'dataValidacao'
    | 'estoqueProcessado'
    | 'financeiroProcessado'
    | 'syncedAt'
    | 'localCreatedAt'
    | 'deviceId'
    | 'createdAt'
    | 'updatedAt'
  > {}

/**
 * Modelo Sequelize para a entidade OrdemServico
 *
 * Representa uma Ordem de Serviço agrícola/pecuária/administrativa.
 * Entidade master do padrão master-detail: possui talhoes, insumos, maquinas e responsaveis.
 */
class OrdemServico
  extends Model<OrdemServicoAttributes, OrdemServicoCreationAttributes>
  implements OrdemServicoAttributes
{
  public id!: number;
  public tenantId!: number;
  public numero!: number;
  public tipoAtividadeOSId!: number;
  public safraId!: number | null;
  public fazendaId!: number;
  public descricao!: string | null;
  public status!: StatusOrdemServico;
  public prioridade!: PrioridadeOrdemServico;
  public dataPlanejadaInicio!: Date | null;
  public dataPlanejadaFim!: Date | null;
  public dataInicioReal!: Date | null;
  public dataFimReal!: Date | null;
  public areaPlanejadaTotal!: number | null;
  public areaRealTotal!: number | null;
  public custoEstimado!: number | null;
  public custoReal!: number | null;
  public varianciaAreaPercent!: number | null;
  public varianciaCustoPercent!: number | null;
  public varianciaDias!: number | null;
  public camposCondicionais!: Record<string, any> | null;
  public observacoes!: string | null;
  public observacoesConclusao!: string | null;
  public motivoCancelamento!: string | null;
  public criadoPorId!: number | null;
  public atribuidoPorId!: number | null;
  public iniciadoPorId!: number | null;
  public concluidoPorId!: number | null;
  public validadoPorId!: number | null;
  public canceladoPorId!: number | null;
  public dataValidacao!: Date | null;
  public estoqueProcessado!: boolean;
  public financeiroProcessado!: boolean;
  public syncedAt!: Date | null;
  public localCreatedAt!: Date | null;
  public deviceId!: string | null;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  // Relacionamentos (hasMany associations definidas nos arquivos dos filhos)
  public tipoAtividade?: TipoAtividadeOS;
  public safra?: Safra;
  public fazenda?: Fazenda;
  public criadoPor?: Usuario;
  public atribuidoPor?: Usuario;
  public iniciadoPor?: Usuario;
  public concluidoPor?: Usuario;
  public validadoPor?: Usuario;
  public canceladoPor?: Usuario;
  public talhoes?: any[];
  public insumos?: any[];
  public maquinas?: any[];
  public responsaveis?: any[];
}

OrdemServico.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
      comment: 'ID único da ordem de serviço',
    },
    tenantId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: 'ID do tenant ao qual a OS pertence',
      references: {
        model: 'C012_tenant',
        key: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE',
    },
    numero: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: 'Número sequencial da OS por tenant',
    },
    tipoAtividadeOSId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: 'ID do tipo de atividade da OS',
      references: {
        model: 'C066_tipoAtividadeOS',
        key: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'RESTRICT',
    },
    safraId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      comment: 'ID da safra associada (opcional)',
      references: {
        model: 'C017_safra',
        key: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL',
    },
    fazendaId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: 'ID da fazenda onde a OS será executada',
      references: {
        model: 'C018_fazenda',
        key: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'RESTRICT',
    },
    descricao: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: 'Descrição detalhada da ordem de serviço',
    },
    status: {
      type: DataTypes.STRING(20),
      allowNull: false,
      defaultValue: StatusOrdemServico.PLANEJADA,
      comment: 'Status atual da OS (PLANEJADA, AGUARDANDO, EM_EXECUCAO, PAUSADA, CONCLUIDA, VALIDADA, CANCELADA)',
    },
    prioridade: {
      type: DataTypes.STRING(20),
      allowNull: false,
      defaultValue: PrioridadeOrdemServico.MEDIA,
      comment: 'Prioridade da OS (BAIXA, MEDIA, ALTA, URGENTE)',
    },
    dataPlanejadaInicio: {
      type: DataTypes.DATEONLY,
      allowNull: true,
      comment: 'Data planejada de início da OS',
    },
    dataPlanejadaFim: {
      type: DataTypes.DATEONLY,
      allowNull: true,
      comment: 'Data planejada de conclusão da OS',
    },
    dataInicioReal: {
      type: DataTypes.DATEONLY,
      allowNull: true,
      comment: 'Data real de início da execução',
    },
    dataFimReal: {
      type: DataTypes.DATEONLY,
      allowNull: true,
      comment: 'Data real de conclusão da execução',
    },
    areaPlanejadaTotal: {
      type: DataTypes.DECIMAL(18, 4),
      allowNull: true,
      comment: 'Área total planejada em hectares',
    },
    areaRealTotal: {
      type: DataTypes.DECIMAL(18, 4),
      allowNull: true,
      comment: 'Área total real trabalhada em hectares',
    },
    custoEstimado: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: true,
      comment: 'Custo estimado total da OS',
    },
    custoReal: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: true,
      comment: 'Custo real total da OS',
    },
    varianciaAreaPercent: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
      comment: 'Variância percentual entre área planejada e real',
    },
    varianciaCustoPercent: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
      comment: 'Variância percentual entre custo estimado e real',
    },
    varianciaDias: {
      type: DataTypes.INTEGER,
      allowNull: true,
      comment: 'Variância em dias entre prazo planejado e real',
    },
    camposCondicionais: {
      type: DataTypes.JSON,
      allowNull: true,
      comment: 'Campos dinâmicos específicos do tipo de atividade',
    },
    observacoes: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: 'Observações gerais da OS',
    },
    observacoesConclusao: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: 'Observações registradas na conclusão',
    },
    motivoCancelamento: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: 'Motivo do cancelamento da OS',
    },
    criadoPorId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      comment: 'ID do usuário que criou a OS',
      references: {
        model: 'usuarios',
        key: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL',
    },
    atribuidoPorId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      comment: 'ID do usuário que atribuiu a OS',
      references: {
        model: 'usuarios',
        key: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL',
    },
    iniciadoPorId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      comment: 'ID do usuário que iniciou a execução',
      references: {
        model: 'usuarios',
        key: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL',
    },
    concluidoPorId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      comment: 'ID do usuário que concluiu a OS',
      references: {
        model: 'usuarios',
        key: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL',
    },
    validadoPorId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      comment: 'ID do usuário que validou a OS',
      references: {
        model: 'usuarios',
        key: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL',
    },
    canceladoPorId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      comment: 'ID do usuário que cancelou a OS',
      references: {
        model: 'usuarios',
        key: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL',
    },
    dataValidacao: {
      type: DataTypes.DATEONLY,
      allowNull: true,
      comment: 'Data em que a OS foi validada',
    },
    estoqueProcessado: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
      comment: 'Indica se a movimentação de estoque já foi processada',
    },
    financeiroProcessado: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
      comment: 'Indica se o lançamento financeiro já foi processado',
    },
    syncedAt: {
      type: DataTypes.DATE,
      allowNull: true,
      comment: 'Data/hora da última sincronização com dispositivo mobile',
    },
    localCreatedAt: {
      type: DataTypes.DATE,
      allowNull: true,
      comment: 'Data/hora de criação local no dispositivo mobile',
    },
    deviceId: {
      type: DataTypes.STRING(100),
      allowNull: true,
      comment: 'Identificador do dispositivo que criou/sincronizou a OS',
    },
  },
  {
    sequelize,
    tableName: 'C068_ordemServico',
    timestamps: true,
    underscored: false,
    indexes: [
      {
        fields: ['tenantId', 'numero'],
        unique: true,
        name: 'idx_ordemServico_tenant_numero',
      },
      {
        fields: ['tenantId', 'status'],
        name: 'idx_ordemServico_tenant_status',
      },
      {
        fields: ['tenantId', 'dataPlanejadaInicio'],
        name: 'idx_ordemServico_tenant_dataInicio',
      },
      {
        fields: ['tenantId', 'fazendaId'],
        name: 'idx_ordemServico_tenant_fazenda',
      },
      {
        fields: ['tenantId', 'tipoAtividadeOSId'],
        name: 'idx_ordemServico_tenant_tipoAtividade',
      },
      {
        fields: ['tenantId', 'syncedAt'],
        name: 'idx_ordemServico_tenant_syncedAt',
      },
    ],
  }
);

// Associations belongsTo (hasMany associations definidas nos arquivos dos filhos)
OrdemServico.belongsTo(TipoAtividadeOS, { foreignKey: 'tipoAtividadeOSId', as: 'tipoAtividade' });
OrdemServico.belongsTo(Safra, { foreignKey: 'safraId', as: 'safra' });
OrdemServico.belongsTo(Fazenda, { foreignKey: 'fazendaId', as: 'fazenda' });
OrdemServico.belongsTo(Usuario, { foreignKey: 'criadoPorId', as: 'criadoPor' });
OrdemServico.belongsTo(Usuario, { foreignKey: 'atribuidoPorId', as: 'atribuidoPor' });
OrdemServico.belongsTo(Usuario, { foreignKey: 'iniciadoPorId', as: 'iniciadoPor' });
OrdemServico.belongsTo(Usuario, { foreignKey: 'concluidoPorId', as: 'concluidoPor' });
OrdemServico.belongsTo(Usuario, { foreignKey: 'validadoPorId', as: 'validadoPor' });
OrdemServico.belongsTo(Usuario, { foreignKey: 'canceladoPorId', as: 'canceladoPor' });

export default OrdemServico;
