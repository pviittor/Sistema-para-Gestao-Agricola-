import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';
import TituloPagar from './TituloPagar';
import TituloReceber from './TituloReceber';

interface ReciboAttributes {
  id: number;
  tenantId: number;
  serie: string;
  numero: number;
  numeroFormatado: string;
  nomeEmitente: string;
  documentoEmitente: string | null;
  nomeBeneficiario: string;
  documentoBeneficiario: string | null;
  valor: number;
  valorExtenso: string;
  descricao: string;
  formaPagamento: string;
  dataEmissao: string;
  local: string | null;
  observacoes: string | null;
  status: string;
  motivoCancelamento: string | null;
  usuarioCancelamentoId: number | null;
  dataCancelamento: Date | null;
  tipoVinculo: string;
  tituloPagarId: number | null;
  tituloReceberId: number | null;
  parcelaId: number | null;
  quantidadeImpressoes: number;
  usercreation: number | null;
}

interface ReciboCreationAttributes extends Optional<ReciboAttributes,
  'id' | 'documentoEmitente' | 'documentoBeneficiario' | 'local' | 'observacoes' | 'status' | 'motivoCancelamento' | 'usuarioCancelamentoId' | 'dataCancelamento' | 'tipoVinculo' | 'tituloPagarId' | 'tituloReceberId' | 'parcelaId' | 'quantidadeImpressoes' | 'usercreation' | 'serie' | 'numero' | 'numeroFormatado' | 'valorExtenso'
> {}

class Recibo extends Model<ReciboAttributes, ReciboCreationAttributes>
  implements ReciboAttributes
{
  public id!: number;
  public tenantId!: number;
  public serie!: string;
  public numero!: number;
  public numeroFormatado!: string;
  public nomeEmitente!: string;
  public documentoEmitente!: string | null;
  public nomeBeneficiario!: string;
  public documentoBeneficiario!: string | null;
  public valor!: number;
  public valorExtenso!: string;
  public descricao!: string;
  public formaPagamento!: string;
  public dataEmissao!: string;
  public local!: string | null;
  public observacoes!: string | null;
  public status!: string;
  public motivoCancelamento!: string | null;
  public usuarioCancelamentoId!: number | null;
  public dataCancelamento!: Date | null;
  public tipoVinculo!: string;
  public tituloPagarId!: number | null;
  public tituloReceberId!: number | null;
  public parcelaId!: number | null;
  public quantidadeImpressoes!: number;
  public usercreation!: number | null;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Recibo.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
      comment: 'ID único do recibo',
    },
    tenantId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: 'ID do tenant',
    },
    serie: {
      type: DataTypes.STRING(10),
      allowNull: false,
      comment: 'Série do recibo',
    },
    numero: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: 'Número sequencial do recibo',
    },
    numeroFormatado: {
      type: DataTypes.STRING(30),
      allowNull: false,
      comment: 'Número formatado do recibo (ex: REC-001-000001)',
    },
    nomeEmitente: {
      type: DataTypes.STRING(255),
      allowNull: false,
      comment: 'Nome do emitente do recibo',
    },
    documentoEmitente: {
      type: DataTypes.STRING(20),
      allowNull: true,
      comment: 'CPF/CNPJ do emitente',
    },
    nomeBeneficiario: {
      type: DataTypes.STRING(255),
      allowNull: false,
      comment: 'Nome do beneficiário do recibo',
    },
    documentoBeneficiario: {
      type: DataTypes.STRING(20),
      allowNull: true,
      comment: 'CPF/CNPJ do beneficiário',
    },
    valor: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: false,
      comment: 'Valor do recibo',
    },
    valorExtenso: {
      type: DataTypes.STRING(500),
      allowNull: false,
      comment: 'Valor do recibo por extenso',
    },
    descricao: {
      type: DataTypes.TEXT,
      allowNull: false,
      comment: 'Descrição/referência do recibo',
    },
    formaPagamento: {
      type: DataTypes.STRING(50),
      allowNull: false,
      comment: 'Forma de pagamento utilizada',
    },
    dataEmissao: {
      type: DataTypes.DATEONLY,
      allowNull: false,
      comment: 'Data de emissão do recibo',
    },
    local: {
      type: DataTypes.STRING(255),
      allowNull: true,
      comment: 'Local de emissão do recibo',
    },
    observacoes: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: 'Observações adicionais',
    },
    status: {
      type: DataTypes.STRING(20),
      allowNull: false,
      defaultValue: 'EMITIDO',
      comment: 'Status do recibo (EMITIDO, CANCELADO)',
    },
    motivoCancelamento: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: 'Motivo do cancelamento do recibo',
    },
    usuarioCancelamentoId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      comment: 'ID do usuário que cancelou o recibo',
    },
    dataCancelamento: {
      type: DataTypes.DATE,
      allowNull: true,
      comment: 'Data e hora do cancelamento',
    },
    tipoVinculo: {
      type: DataTypes.STRING(30),
      allowNull: false,
      defaultValue: 'AVULSO',
      comment: 'Tipo de vínculo do recibo (AVULSO, TITULO_PAGAR, TITULO_RECEBER)',
    },
    tituloPagarId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'C019_tituloPagar',
        key: 'id',
      },
      onDelete: 'SET NULL',
      comment: 'FK para título a pagar vinculado',
    },
    tituloReceberId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'C023_tituloReceber',
        key: 'id',
      },
      onDelete: 'SET NULL',
      comment: 'FK para título a receber vinculado',
    },
    parcelaId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      comment: 'ID da parcela vinculada (pagar ou receber)',
    },
    quantidadeImpressoes: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
      comment: 'Quantidade de vezes que o recibo foi impresso',
    },
    usercreation: {
      type: DataTypes.INTEGER,
      allowNull: true,
      comment: 'ID do usuário que criou o recibo',
    },
  },
  {
    sequelize,
    tableName: 'C065_recibo',
    timestamps: true,
    underscored: false,
  }
);

// Associações
Recibo.belongsTo(TituloPagar, { foreignKey: 'tituloPagarId', as: 'tituloPagar' });
Recibo.belongsTo(TituloReceber, { foreignKey: 'tituloReceberId', as: 'tituloReceber' });

export default Recibo;
