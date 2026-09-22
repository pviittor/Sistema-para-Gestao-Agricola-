import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';
import Usuario from './Usuario';
import Pessoa from './Pessoa';
import Fazenda from './Fazenda';
import Safra from './Safra';
import Moeda from './Moeda';
import NotaFiscal from './NotaFiscal';
import Talhao from './Talhao';
import Conta from './Conta';
// Imports dos models filhos removidos para evitar dependências circulares
// Os relacionamentos serão definidos usando require dinâmico

/**
 * Enum para status do título a pagar
 */
export enum StatusTituloPagar {
  ABERTO = 'ABERTO',
  PARCIAL = 'PARCIAL',
  BAIXADO = 'BAIXADO',
  CANCELADO = 'CANCELADO',
}

/**
 * Enum para tipo de geração do título
 */
export enum TipoGeracao {
  MANUAL = 'MANUAL',
  PARCELADO = 'PARCELADO',
  RECORRENTE = 'RECORRENTE',
}

/**
 * Enum para índice de correção monetária
 */
export enum IndiceCorrecao {
  NENHUM = 'NENHUM',
  IPCA = 'IPCA',
  IGPM = 'IGPM',
  FIXO = 'FIXO',
}

/**
 * Enum para modelo de juros
 */
export enum ModeloJuros {
  SIMPLES = 'SIMPLES',
  PRICE = 'PRICE',
}

/**
 * Interface para atributos da entidade TituloPagar
 */
interface TituloPagarAttributes {
  id: number;
  tenantId: number;
  idFornecedor: number;
  idPortador: number;
  idProdutor: number;
  idFazenda: number;
  idSafra: number;
  idMoeda: number;
  dataLancamento: Date;
  numeroTitulo: string;
  valorTitulo: number;
  valorTituloMoedaOriginal?: number | null;
  valorTituloMoedaPadrao?: number | null;
  quantidadeParcelas: number;
  observacao?: string | null;
  impostoRenda: boolean;
  notaFiscalId?: number | null;
  tipoGeracao: TipoGeracao;
  recorrenciaFinanceiraId?: number | null;
  taxaJurosAm?: number | null;
  indiceCorrecao: IndiceCorrecao;
  taxaCorrecaoFixaAm?: number | null;
  taxaMulta?: number | null;
  intervaloParcelasDias?: number | null;
  dataPrimeiraParcela?: Date | null;
  modeloJuros?: ModeloJuros | null;
  idTalhao?: number | null;
  contaBancariaId: number | null;
  origemTipo?: string | null;
  origemId?: number | null;
  status: StatusTituloPagar;
  usercreation: number;
  datecreation: Date;
}

/**
 * Interface para atributos de criação (id é opcional pois é auto-increment)
 */
interface TituloPagarCreationAttributes extends Optional<TituloPagarAttributes, 'id' | 'datecreation' | 'valorTituloMoedaOriginal' | 'valorTituloMoedaPadrao' | 'quantidadeParcelas' | 'observacao' | 'impostoRenda' | 'status' | 'notaFiscalId' | 'tipoGeracao' | 'recorrenciaFinanceiraId' | 'taxaJurosAm' | 'indiceCorrecao' | 'taxaCorrecaoFixaAm' | 'taxaMulta' | 'intervaloParcelasDias' | 'dataPrimeiraParcela' | 'modeloJuros' | 'idTalhao' | 'contaBancariaId' | 'origemTipo' | 'origemId'> {}

/**
 * Modelo Sequelize para a entidade TituloPagar
 * 
 * Representa um título/documento a ser pago pelo sistema.
 * Inclui relacionamentos com fornecedor, portador, produtor, fazenda, safra e moeda.
 */
class TituloPagar
  extends Model<TituloPagarAttributes, TituloPagarCreationAttributes>
  implements TituloPagarAttributes
{
  public id!: number;
  public tenantId!: number;
  public idFornecedor!: number;
  public idPortador!: number;
  public idProdutor!: number;
  public idFazenda!: number;
  public idSafra!: number;
  public idMoeda!: number;
  public dataLancamento!: Date;
  public numeroTitulo!: string;
  public valorTitulo!: number;
  public valorTituloMoedaOriginal!: number | null;
  public valorTituloMoedaPadrao!: number | null;
  public quantidadeParcelas!: number;
  public observacao!: string | null;
  public impostoRenda!: boolean;
  public notaFiscalId!: number | null;
  public tipoGeracao!: TipoGeracao;
  public recorrenciaFinanceiraId!: number | null;
  public taxaJurosAm!: number | null;
  public indiceCorrecao!: IndiceCorrecao;
  public taxaCorrecaoFixaAm!: number | null;
  public taxaMulta!: number | null;
  public intervaloParcelasDias!: number | null;
  public dataPrimeiraParcela!: Date | null;
  public modeloJuros!: ModeloJuros | null;
  public idTalhao!: number | null;
  public contaBancariaId!: number | null;
  public origemTipo!: string | null;
  public origemId!: number | null;
  public status!: StatusTituloPagar;
  public usercreation!: number;
  public datecreation!: Date;

  // Relacionamentos
  public notaFiscal?: NotaFiscal;
  public fornecedor?: Pessoa;
  public portador?: Pessoa;
  public produtor?: Pessoa;
  public fazenda?: Fazenda;
  public safra?: Safra;
  public moeda?: Moeda;
  public talhao?: Talhao;
  public usuarioCriador?: Usuario;
  // Relacionamentos serão definidos dinamicamente para evitar dependências circulares
  public parcelas?: any[];
  public rateiosPlanoConta?: any[];
  public rateiosCentroCusto?: any[];
  public movimentosFinanceiros?: any[];
}

TituloPagar.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
      comment: 'ID único do título a pagar',
    },
    tenantId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: 'tenantId',
      comment: 'ID do tenant ao qual o título pertence',
    },
    idFornecedor: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: 'ID da pessoa (fornecedor)',
      references: {
        model: 'C001_PESSOA',
        key: 'id_pessoa',
      },
      onUpdate: 'CASCADE',
      onDelete: 'RESTRICT',
    },
    idPortador: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: 'ID da pessoa (portador)',
      references: {
        model: 'C001_PESSOA',
        key: 'id_pessoa',
      },
      onUpdate: 'CASCADE',
      onDelete: 'RESTRICT',
    },
    idProdutor: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: 'ID da pessoa (produtor)',
      references: {
        model: 'C001_PESSOA',
        key: 'id_pessoa',
      },
      onUpdate: 'CASCADE',
      onDelete: 'RESTRICT',
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
    idSafra: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: 'ID da safra',
      references: {
        model: 'C017_safra',
        key: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'RESTRICT',
    },
    idMoeda: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: 'ID da moeda',
      references: {
        model: 'C006_moeda',
        key: 'id_moeda',
      },
      onUpdate: 'CASCADE',
      onDelete: 'RESTRICT',
    },
    dataLancamento: {
      type: DataTypes.DATEONLY,
      allowNull: false,
      comment: 'Data de lançamento do título',
    },
    numeroTitulo: {
      type: DataTypes.STRING(100),
      allowNull: false,
      comment: 'Número do título (único por tenant)',
    },
    valorTitulo: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: false,
      comment: 'Valor total do título (soma de todas as parcelas)',
    },
    valorTituloMoedaOriginal: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: true,
      comment: 'Valor do título na moeda original',
    },
    valorTituloMoedaPadrao: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: true,
      comment: 'Valor do título convertido para BRL',
    },
    quantidadeParcelas: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
      comment: 'Quantidade de parcelas do título (calculado automaticamente)',
    },
    observacao: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: 'Observações sobre o título',
    },
    impostoRenda: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
      comment: 'Se o título está sujeito a imposto de renda',
    },
    notaFiscalId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      comment: 'ID da nota fiscal vinculada',
      references: {
        model: 'C045_notaFiscal',
        key: 'id_nf',
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL',
    },
    tipoGeracao: {
      type: DataTypes.ENUM('MANUAL', 'PARCELADO', 'RECORRENTE'),
      allowNull: false,
      defaultValue: 'MANUAL',
      comment: 'Origem do lançamento (MANUAL, PARCELADO, RECORRENTE)',
    },
    recorrenciaFinanceiraId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      comment: 'FK para recorrencia_financeira.id',
      references: {
        model: 'recorrencia_financeira',
        key: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL',
    },
    taxaJurosAm: {
      type: DataTypes.DECIMAL(5, 4),
      allowNull: true,
      comment: 'Taxa de juros ao mês (ex: 0.015 = 1,5%)',
    },
    indiceCorrecao: {
      type: DataTypes.ENUM('NENHUM', 'IPCA', 'IGPM', 'FIXO'),
      allowNull: false,
      defaultValue: 'NENHUM',
      comment: 'Índice de correção monetária',
    },
    taxaCorrecaoFixaAm: {
      type: DataTypes.DECIMAL(5, 4),
      allowNull: true,
      comment: 'Taxa fixa ao mês quando indiceCorrecao = FIXO',
    },
    taxaMulta: {
      type: DataTypes.DECIMAL(5, 4),
      allowNull: true,
      comment: 'Taxa de multa por atraso (ex: 0.02 = 2%)',
    },
    intervaloParcelasDias: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: 30,
      comment: 'Intervalo em dias entre parcelas',
    },
    dataPrimeiraParcela: {
      type: DataTypes.DATEONLY,
      allowNull: true,
      comment: 'Data de vencimento da primeira parcela',
    },
    modeloJuros: {
      type: DataTypes.ENUM('SIMPLES', 'PRICE'),
      allowNull: true,
      comment: 'Modelo de juros (SIMPLES ou PRICE/Tabela Price)',
    },
    idTalhao: {
      type: DataTypes.INTEGER,
      allowNull: true,
      comment: 'FK para talhão (rastreabilidade)',
      references: {
        model: 'C002_talhao',
        key: 'id_talhao',
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL',
    },
    contaBancariaId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      comment: 'ID da conta bancária vinculada (FK)',
      references: {
        model: 'contas',
        key: 'id',
      },
    },
    origemTipo: {
      type: DataTypes.STRING(50),
      allowNull: true,
      field: 'origem_tipo',
      comment: 'Tipo do documento de origem: nota_fiscal_entrada, nota_fiscal_saida, pedido_compra, emprestimo, manual',
    },
    origemId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      field: 'origem_id',
      comment: 'ID do documento de origem (polimórfico)',
    },
    status: {
      type: DataTypes.ENUM('ABERTO', 'PARCIAL', 'BAIXADO', 'CANCELADO'),
      allowNull: false,
      defaultValue: 'ABERTO',
      comment: 'Status do título (ABERTO, PARCIAL, BAIXADO, CANCELADO)',
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
    tableName: 'C019_tituloPagar',
    timestamps: false,
    underscored: false,
    indexes: [
      {
        fields: ['tenantId'],
      },
      {
        fields: ['idFornecedor'],
      },
      {
        fields: ['idPortador'],
      },
      {
        fields: ['idProdutor'],
      },
      {
        fields: ['idFazenda'],
      },
      {
        fields: ['idSafra'],
      },
      {
        fields: ['idMoeda'],
      },
      {
        fields: ['dataLancamento'],
      },
      {
        unique: true,
        fields: ['numeroTitulo', 'tenantId'],
      },
      {
        fields: ['status'],
      },
      {
        fields: ['usercreation'],
      },
      {
        fields: ['notaFiscalId'],
      },
      {
        fields: ['tipoGeracao'],
      },
      {
        fields: ['recorrenciaFinanceiraId'],
      },
      {
        fields: ['idTalhao'],
      },
      {
        fields: ['origem_tipo', 'origem_id'],
        name: 'idx_tituloPagar_origem',
      },
    ],
  }
);

// Setup associations
TituloPagar.belongsTo(Usuario, { foreignKey: 'usercreation', as: 'usuarioCriador' });
TituloPagar.belongsTo(NotaFiscal, { foreignKey: 'notaFiscalId', as: 'notaFiscal' });
TituloPagar.belongsTo(Pessoa, { foreignKey: 'idFornecedor', as: 'fornecedor' });
TituloPagar.belongsTo(Pessoa, { foreignKey: 'idPortador', as: 'portador' });
TituloPagar.belongsTo(Pessoa, { foreignKey: 'idProdutor', as: 'produtor' });
TituloPagar.belongsTo(Fazenda, { foreignKey: 'idFazenda', as: 'fazenda' });
TituloPagar.belongsTo(Safra, { foreignKey: 'idSafra', as: 'safra' });
TituloPagar.belongsTo(Moeda, { foreignKey: 'idMoeda', as: 'moeda' });
TituloPagar.belongsTo(Talhao, { foreignKey: 'idTalhao', as: 'talhao' });
TituloPagar.belongsTo(Conta, { foreignKey: 'contaBancariaId', as: 'contaBancaria' });
// Relacionamentos hasMany removidos para evitar dependências circulares
// Os relacionamentos serão estabelecidos através dos belongsTo nos models filhos
// Para incluir relacionamentos, use include nas queries: { include: [{ model: ParcelaTituloPagar, as: 'parcelas' }] }

export default TituloPagar;
