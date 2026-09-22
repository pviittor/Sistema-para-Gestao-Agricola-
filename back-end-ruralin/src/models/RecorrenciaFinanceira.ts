import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';
import Usuario from './Usuario';
import Pessoa from './Pessoa';
import Conta from './Conta';
import PlanoContaGerencial from './PlanoContaGerencial';
import CentroCusto from './CentroCusto';
import Fazenda from './Fazenda';
import Safra from './Safra';
import Talhao from './Talhao';
import Moeda from './Moeda';

/**
 * Enum para tipo da recorrência
 */
export enum TipoRecorrencia {
  PAGAR = 'PAGAR',
  RECEBER = 'RECEBER',
}

/**
 * Enum para periodicidade
 */
export enum Periodicidade {
  SEMANAL = 'SEMANAL',
  QUINZENAL = 'QUINZENAL',
  MENSAL = 'MENSAL',
  BIMESTRAL = 'BIMESTRAL',
  TRIMESTRAL = 'TRIMESTRAL',
  SEMESTRAL = 'SEMESTRAL',
  ANUAL = 'ANUAL',
  SAFRA = 'SAFRA',
}

interface RecorrenciaFinanceiraAttributes {
  id: number;
  tenantId: number;
  usuarioId: number;
  tipo: TipoRecorrencia;
  descricao: string;
  valor: number;
  periodicidade: Periodicidade;
  diaVencimento: number;
  dataInicio: Date;
  dataFim?: Date | null;
  ativa: boolean;
  idFornecedorCliente?: number | null;
  idPortador?: number | null;
  idProdutor?: number | null;
  idContaDebCred?: number | null;
  idPlanoContaGerencial?: number | null;
  idCentroCusto?: number | null;
  idFazenda?: number | null;
  idSafra?: number | null;
  idTalhao?: number | null;
  idMoeda?: number | null;
  antecedenciaGeracaoDias: number;
  numeroMaximoGeracoes?: number | null;
  geracoesRealizadas: number;
  observacao?: string | null;
  usercreation: number;
  datecreation: Date;
}

interface RecorrenciaFinanceiraCreationAttributes extends Optional<RecorrenciaFinanceiraAttributes,
  'id' | 'datecreation' | 'dataFim' | 'ativa' | 'idFornecedorCliente' | 'idPortador' | 'idProdutor' |
  'idContaDebCred' | 'idPlanoContaGerencial' | 'idCentroCusto' | 'idFazenda' | 'idSafra' | 'idTalhao' |
  'idMoeda' | 'antecedenciaGeracaoDias' | 'numeroMaximoGeracoes' | 'geracoesRealizadas' | 'observacao'
> {}

class RecorrenciaFinanceira
  extends Model<RecorrenciaFinanceiraAttributes, RecorrenciaFinanceiraCreationAttributes>
  implements RecorrenciaFinanceiraAttributes
{
  public id!: number;
  public tenantId!: number;
  public usuarioId!: number;
  public tipo!: TipoRecorrencia;
  public descricao!: string;
  public valor!: number;
  public periodicidade!: Periodicidade;
  public diaVencimento!: number;
  public dataInicio!: Date;
  public dataFim!: Date | null;
  public ativa!: boolean;
  public idFornecedorCliente!: number | null;
  public idPortador!: number | null;
  public idProdutor!: number | null;
  public idContaDebCred!: number | null;
  public idPlanoContaGerencial!: number | null;
  public idCentroCusto!: number | null;
  public idFazenda!: number | null;
  public idSafra!: number | null;
  public idTalhao!: number | null;
  public idMoeda!: number | null;
  public antecedenciaGeracaoDias!: number;
  public numeroMaximoGeracoes!: number | null;
  public geracoesRealizadas!: number;
  public observacao!: string | null;
  public usercreation!: number;
  public datecreation!: Date;

  // Relacionamentos
  public usuario?: Usuario;
  public fornecedorCliente?: Pessoa;
  public portador?: Pessoa;
  public produtor?: Pessoa;
  public conta?: Conta;
  public planoContaGerencial?: PlanoContaGerencial;
  public centroCusto?: CentroCusto;
  public fazenda?: Fazenda;
  public safra?: Safra;
  public talhao?: Talhao;
  public moeda?: Moeda;
  public lancamentos?: any[];
}

RecorrenciaFinanceira.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
      comment: 'ID único da recorrência',
    },
    tenantId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: 'tenantId',
      comment: 'ID do tenant',
    },
    usuarioId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: 'ID do usuário criador',
      references: { model: 'usuarios', key: 'id' },
      onUpdate: 'CASCADE',
      onDelete: 'RESTRICT',
    },
    tipo: {
      type: DataTypes.ENUM('PAGAR', 'RECEBER'),
      allowNull: false,
      comment: 'Tipo: PAGAR ou RECEBER',
    },
    descricao: {
      type: DataTypes.STRING(255),
      allowNull: false,
      comment: 'Descrição da recorrência',
    },
    valor: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: false,
      comment: 'Valor base de cada lançamento gerado',
    },
    periodicidade: {
      type: DataTypes.ENUM('SEMANAL', 'QUINZENAL', 'MENSAL', 'BIMESTRAL', 'TRIMESTRAL', 'SEMESTRAL', 'ANUAL', 'SAFRA'),
      allowNull: false,
      comment: 'Periodicidade dos lançamentos',
    },
    diaVencimento: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: 'Dia do mês de vencimento (1-31)',
    },
    dataInicio: {
      type: DataTypes.DATEONLY,
      allowNull: false,
      comment: 'Data de início da vigência',
    },
    dataFim: {
      type: DataTypes.DATEONLY,
      allowNull: true,
      comment: 'Data de encerramento (null = indefinida)',
    },
    ativa: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
      comment: 'Indica se está ativa para geração automática',
    },
    idFornecedorCliente: {
      type: DataTypes.INTEGER,
      allowNull: true,
      comment: 'Pessoa vinculada (fornecedor/cliente)',
      references: { model: 'C001_PESSOA', key: 'id_pessoa' },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL',
    },
    idPortador: {
      type: DataTypes.INTEGER,
      allowNull: true,
      comment: 'Pessoa portadora',
      references: { model: 'C001_PESSOA', key: 'id_pessoa' },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL',
    },
    idProdutor: {
      type: DataTypes.INTEGER,
      allowNull: true,
      comment: 'Pessoa produtora',
      references: { model: 'C001_PESSOA', key: 'id_pessoa' },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL',
    },
    idContaDebCred: {
      type: DataTypes.INTEGER,
      allowNull: true,
      comment: 'Conta bancária/caixa padrão',
      references: { model: 'contas', key: 'id' },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL',
    },
    idPlanoContaGerencial: {
      type: DataTypes.INTEGER,
      allowNull: true,
      comment: 'Plano de conta gerencial padrão',
      references: { model: 'C013_planoContaGerencial', key: 'id' },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL',
    },
    idCentroCusto: {
      type: DataTypes.INTEGER,
      allowNull: true,
      comment: 'Centro de custo padrão',
      references: { model: 'C016_centroCusto', key: 'id' },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL',
    },
    idFazenda: {
      type: DataTypes.INTEGER,
      allowNull: true,
      comment: 'Fazenda vinculada',
      references: { model: 'C018_fazenda', key: 'id' },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL',
    },
    idSafra: {
      type: DataTypes.INTEGER,
      allowNull: true,
      comment: 'Safra vinculada',
      references: { model: 'C017_safra', key: 'id' },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL',
    },
    idTalhao: {
      type: DataTypes.INTEGER,
      allowNull: true,
      comment: 'Talhão vinculado',
      references: { model: 'C002_talhao', key: 'id_talhao' },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL',
    },
    idMoeda: {
      type: DataTypes.INTEGER,
      allowNull: true,
      comment: 'Moeda dos lançamentos',
      references: { model: 'C006_moeda', key: 'id_moeda' },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL',
    },
    antecedenciaGeracaoDias: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 5,
      comment: 'Dias de antecedência para geração',
    },
    numeroMaximoGeracoes: {
      type: DataTypes.INTEGER,
      allowNull: true,
      comment: 'Máximo de títulos a gerar (null = ilimitado)',
    },
    geracoesRealizadas: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
      comment: 'Contador de títulos já gerados',
    },
    observacao: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: 'Observações adicionais',
    },
    usercreation: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: 'ID do usuário que criou',
      references: { model: 'usuarios', key: 'id' },
    },
    datecreation: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
      comment: 'Data de criação',
    },
  },
  {
    sequelize,
    tableName: 'recorrencia_financeira',
    timestamps: false,
    underscored: false,
    indexes: [
      { fields: ['tenantId'] },
      { fields: ['tipo'] },
      { fields: ['ativa'] },
      { fields: ['tenantId', 'ativa', 'dataInicio'] },
      { fields: ['idFornecedorCliente'] },
      { fields: ['idFazenda'] },
      { fields: ['idSafra'] },
    ],
  }
);

// Associations
RecorrenciaFinanceira.belongsTo(Usuario, { foreignKey: 'usercreation', as: 'usuarioCriador' });
RecorrenciaFinanceira.belongsTo(Usuario, { foreignKey: 'usuarioId', as: 'usuario' });
RecorrenciaFinanceira.belongsTo(Pessoa, { foreignKey: 'idFornecedorCliente', as: 'fornecedorCliente' });
RecorrenciaFinanceira.belongsTo(Pessoa, { foreignKey: 'idPortador', as: 'portador' });
RecorrenciaFinanceira.belongsTo(Pessoa, { foreignKey: 'idProdutor', as: 'produtor' });
RecorrenciaFinanceira.belongsTo(Conta, { foreignKey: 'idContaDebCred', as: 'conta' });
RecorrenciaFinanceira.belongsTo(PlanoContaGerencial, { foreignKey: 'idPlanoContaGerencial', as: 'planoContaGerencial' });
RecorrenciaFinanceira.belongsTo(CentroCusto, { foreignKey: 'idCentroCusto', as: 'centroCusto' });
RecorrenciaFinanceira.belongsTo(Fazenda, { foreignKey: 'idFazenda', as: 'fazenda' });
RecorrenciaFinanceira.belongsTo(Safra, { foreignKey: 'idSafra', as: 'safra' });
RecorrenciaFinanceira.belongsTo(Talhao, { foreignKey: 'idTalhao', as: 'talhao' });
RecorrenciaFinanceira.belongsTo(Moeda, { foreignKey: 'idMoeda', as: 'moeda' });

export default RecorrenciaFinanceira;
