import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';
import Usuario from './Usuario';
import TituloReceber from './TituloReceber';
import Conta from './Conta';

/**
 * Enum para status da parcela (reutilizado de ParcelaTituloPagar)
 */
export enum StatusParcela {
  ABERTA = 'ABERTA',
  PARCIAL = 'PARCIAL',
  BAIXADA = 'BAIXADA',
  CANCELADA = 'CANCELADA',
}

/**
 * Interface para atributos da entidade ParcelaTituloReceber
 */
interface ParcelaTituloReceberAttributes {
  id: number;
  tenantId: number;
  idTituloReceber: number;
  numeroParcela: number;
  dataVencimento: Date;
  valorParcela: number;
  valorParcelaMoedaOriginal?: number | null;
  valorParcelaMoedaPadrao?: number | null;
  taxaJuros?: number | null;
  valorJuros: number;
  valorCorrecao: number;
  taxaMulta?: number | null;
  valorMulta: number;
  valorDesconto: number;
  valorTotal: number;
  valorPago: number;
  valorSaldo: number;
  dataBaixa?: Date | null;
  valorBaixa?: number | null;
  idConta?: number | null;
  numeroTotalParcelas: number;
  status: StatusParcela;
  observacao?: string | null;
  usercreation: number;
  datecreation: Date;
}

/**
 * Interface para atributos de criação (id é opcional pois é auto-increment)
 */
interface ParcelaTituloReceberCreationAttributes extends Optional<ParcelaTituloReceberAttributes, 'id' | 'datecreation' | 'valorParcelaMoedaOriginal' | 'valorParcelaMoedaPadrao' | 'taxaJuros' | 'valorJuros' | 'valorCorrecao' | 'taxaMulta' | 'valorMulta' | 'valorDesconto' | 'valorTotal' | 'valorPago' | 'valorSaldo' | 'dataBaixa' | 'valorBaixa' | 'idConta' | 'numeroTotalParcelas' | 'observacao' | 'status'> {}

/**
 * Modelo Sequelize para a entidade ParcelaTituloReceber
 * 
 * Representa uma parcela individual de um título a receber.
 */
class ParcelaTituloReceber
  extends Model<ParcelaTituloReceberAttributes, ParcelaTituloReceberCreationAttributes>
  implements ParcelaTituloReceberAttributes
{
  public id!: number;
  public tenantId!: number;
  public idTituloReceber!: number;
  public numeroParcela!: number;
  public dataVencimento!: Date;
  public valorParcela!: number;
  public valorParcelaMoedaOriginal!: number | null;
  public valorParcelaMoedaPadrao!: number | null;
  public taxaJuros!: number | null;
  public valorJuros!: number;
  public valorCorrecao!: number;
  public taxaMulta!: number | null;
  public valorMulta!: number;
  public valorDesconto!: number;
  public valorTotal!: number;
  public valorPago!: number;
  public valorSaldo!: number;
  public dataBaixa!: Date | null;
  public valorBaixa!: number | null;
  public idConta!: number | null;
  public numeroTotalParcelas!: number;
  public status!: StatusParcela;
  public observacao!: string | null;
  public usercreation!: number;
  public datecreation!: Date;

  // Relacionamentos
  public tituloReceber?: TituloReceber;
  public conta?: Conta;
  public usuarioCriador?: Usuario;
}

ParcelaTituloReceber.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
      comment: 'ID único da parcela',
    },
    tenantId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: 'tenantId',
      comment: 'ID do tenant ao qual a parcela pertence',
    },
    idTituloReceber: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: 'ID do título a receber ao qual a parcela pertence',
      references: {
        model: 'C023_tituloReceber',
        key: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE',
    },
    numeroParcela: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: 'Número sequencial da parcela (1, 2, 3...)',
    },
    dataVencimento: {
      type: DataTypes.DATEONLY,
      allowNull: false,
      comment: 'Data de vencimento da parcela',
    },
    valorParcela: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: false,
      comment: 'Valor da parcela',
    },
    valorParcelaMoedaOriginal: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: true,
      comment: 'Valor da parcela na moeda original',
    },
    valorParcelaMoedaPadrao: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: true,
      comment: 'Valor da parcela convertido para BRL',
    },
    dataBaixa: {
      type: DataTypes.DATEONLY,
      allowNull: true,
      comment: 'Data de baixa da parcela',
    },
    taxaJuros: {
      type: DataTypes.DECIMAL(5, 4),
      allowNull: true,
      defaultValue: 0,
      comment: 'Taxa de juros aplicada nesta parcela',
    },
    valorJuros: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: false,
      defaultValue: 0.00,
      comment: 'Valor monetário de juros',
    },
    valorCorrecao: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: false,
      defaultValue: 0.00,
      comment: 'Valor de correção monetária',
    },
    taxaMulta: {
      type: DataTypes.DECIMAL(5, 4),
      allowNull: true,
      defaultValue: 0,
      comment: 'Taxa de multa por atraso',
    },
    valorMulta: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: false,
      defaultValue: 0.00,
      comment: 'Valor monetário de multa',
    },
    valorDesconto: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: false,
      defaultValue: 0.00,
      comment: 'Desconto concedido no momento da baixa',
    },
    valorTotal: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: false,
      defaultValue: 0.00,
      comment: 'valorParcela + valorJuros + valorCorrecao + valorMulta - valorDesconto',
    },
    valorPago: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: false,
      defaultValue: 0.00,
      comment: 'Total já pago (acumulado de MovimentoFinanceiro)',
    },
    valorSaldo: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: false,
      defaultValue: 0.00,
      comment: 'valorTotal - valorPago',
    },
    valorBaixa: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: true,
      comment: 'Valor da baixa da parcela',
    },
    idConta: {
      type: DataTypes.INTEGER,
      allowNull: true,
      comment: 'FK para conta bancária/caixa utilizada na baixa',
      references: {
        model: 'contas',
        key: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL',
    },
    numeroTotalParcelas: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 1,
      comment: 'Total de parcelas do título pai',
    },
    status: {
      type: DataTypes.ENUM('ABERTA', 'PARCIAL', 'BAIXADA', 'CANCELADA'),
      allowNull: false,
      defaultValue: 'ABERTA',
      comment: 'Status da parcela (ABERTA, PARCIAL, BAIXADA, CANCELADA)',
    },
    observacao: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: 'Observações sobre a parcela',
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
    tableName: 'C024_parcelaTituloReceber',
    timestamps: false,
    underscored: false,
    indexes: [
      {
        fields: ['tenantId'],
      },
      {
        fields: ['idTituloReceber'],
      },
      {
        fields: ['dataVencimento'],
      },
      {
        fields: ['status'],
      },
      {
        fields: ['usercreation'],
      },
      {
        fields: ['idConta'],
      },
      {
        fields: ['tenantId', 'status', 'dataVencimento'],
      },
    ],
  }
);

// Setup associations
ParcelaTituloReceber.belongsTo(Usuario, { foreignKey: 'usercreation', as: 'usuarioCriador' });
ParcelaTituloReceber.belongsTo(TituloReceber, { foreignKey: 'idTituloReceber', as: 'tituloReceber' });
ParcelaTituloReceber.belongsTo(Conta, { foreignKey: 'idConta', as: 'conta' });
TituloReceber.hasMany(ParcelaTituloReceber, { foreignKey: 'idTituloReceber', as: 'parcelas' });

export default ParcelaTituloReceber;
