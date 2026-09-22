import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';
import Usuario from './Usuario';
import ParcelaTituloReceber from './ParcelaTituloReceber';
import TituloReceber from './TituloReceber';
import PlanoContaGerencial from './PlanoContaGerencial';
import CentroCusto from './CentroCusto';
import Conta from './Conta';

/**
 * Enum para tipo de movimento financeiro
 */
export enum TipoMovimentoReceber {
  BAIXA_TOTAL = 'BAIXA_TOTAL',
  BAIXA_PARCIAL = 'BAIXA_PARCIAL',
}

/**
 * Interface para atributos da entidade MovimentoFinanceiroTituloReceber
 */
interface MovimentoFinanceiroTituloReceberAttributes {
  id: number;
  tenantId: number;
  idParcelaTituloReceber: number;
  idTituloReceber: number;
  idPlanoContaGerencial: number;
  idCentroCusto: number;
  idConta?: number | null;
  tipoMovimento: TipoMovimentoReceber;
  dataMovimento: Date;
  valorMovimento: number;
  valorMovimentoMoedaOriginal?: number | null;
  valorMovimentoMoedaPadrao?: number | null;
  percentualRateioPlanoConta: number;
  percentualRateioCentroCusto: number;
  observacao?: string | null;
  usercreation: number;
  datecreation: Date;
}

/**
 * Interface para atributos de criação (id é opcional pois é auto-increment)
 */
interface MovimentoFinanceiroTituloReceberCreationAttributes extends Optional<MovimentoFinanceiroTituloReceberAttributes, 'id' | 'datecreation' | 'valorMovimentoMoedaOriginal' | 'valorMovimentoMoedaPadrao' | 'observacao' | 'idConta' | 'tipoMovimento'> {}

/**
 * Modelo Sequelize para a entidade MovimentoFinanceiroTituloReceber
 * 
 * Registra movimentos financeiros realizados (baixas) de títulos a receber,
 * com rateios proporcionais por plano de contas e centro de custo.
 * Permite controle de planejado vs realizado.
 */
class MovimentoFinanceiroTituloReceber
  extends Model<MovimentoFinanceiroTituloReceberAttributes, MovimentoFinanceiroTituloReceberCreationAttributes>
  implements MovimentoFinanceiroTituloReceberAttributes
{
  public id!: number;
  public tenantId!: number;
  public idParcelaTituloReceber!: number;
  public idTituloReceber!: number;
  public idPlanoContaGerencial!: number;
  public idCentroCusto!: number;
  public idConta!: number | null;
  public tipoMovimento!: TipoMovimentoReceber;
  public dataMovimento!: Date;
  public valorMovimento!: number;
  public valorMovimentoMoedaOriginal!: number | null;
  public valorMovimentoMoedaPadrao!: number | null;
  public percentualRateioPlanoConta!: number;
  public percentualRateioCentroCusto!: number;
  public observacao!: string | null;
  public usercreation!: number;
  public datecreation!: Date;

  // Relacionamentos
  public parcelaTituloReceber?: ParcelaTituloReceber;
  public tituloReceber?: TituloReceber;
  public planoContaGerencial?: PlanoContaGerencial;
  public centroCusto?: CentroCusto;
  public conta?: Conta;
  public usuarioCriador?: Usuario;
}

MovimentoFinanceiroTituloReceber.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
      comment: 'ID único do movimento financeiro',
    },
    tenantId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: 'tenantId',
      comment: 'ID do tenant ao qual o movimento pertence',
    },
    idParcelaTituloReceber: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: 'ID da parcela do título a receber que foi baixada',
      references: {
        model: 'C024_parcelaTituloReceber',
        key: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE',
    },
    idTituloReceber: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: 'ID do título a receber (redundante para performance em consultas)',
      references: {
        model: 'C023_tituloReceber',
        key: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE',
    },
    idPlanoContaGerencial: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: 'ID do plano de contas gerencial',
      references: {
        model: 'C013_planoContaGerencial',
        key: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'RESTRICT',
    },
    idCentroCusto: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: 'ID do centro de custo',
      references: {
        model: 'C016_centroCusto',
        key: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'RESTRICT',
    },
    idConta: {
      type: DataTypes.INTEGER,
      allowNull: true,
      comment: 'FK para conta bancária/caixa do recebimento',
      references: {
        model: 'contas',
        key: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL',
    },
    tipoMovimento: {
      type: DataTypes.ENUM('BAIXA_TOTAL', 'BAIXA_PARCIAL'),
      allowNull: false,
      defaultValue: 'BAIXA_TOTAL',
      comment: 'Indica se foi uma baixa total ou parcial da parcela',
    },
    dataMovimento: {
      type: DataTypes.DATEONLY,
      allowNull: false,
      comment: 'Data do movimento financeiro (data da baixa)',
    },
    valorMovimento: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: false,
      comment: 'Valor do movimento rateado proporcionalmente',
    },
    valorMovimentoMoedaOriginal: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: true,
      comment: 'Valor do movimento na moeda original do título',
    },
    valorMovimentoMoedaPadrao: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: true,
      comment: 'Valor do movimento convertido para BRL',
    },
    percentualRateioPlanoConta: {
      type: DataTypes.DECIMAL(5, 2),
      allowNull: false,
      comment: 'Percentual do rateio de plano de contas original do título',
    },
    percentualRateioCentroCusto: {
      type: DataTypes.DECIMAL(5, 2),
      allowNull: false,
      comment: 'Percentual do rateio de centro de custo original do título',
    },
    observacao: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: 'Observações sobre o movimento financeiro',
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
    tableName: 'C028_movimentoFinanceiroTituloReceber',
    timestamps: false,
    underscored: false,
    indexes: [
      {
        fields: ['tenantId'],
      },
      {
        fields: ['idParcelaTituloReceber'],
      },
      {
        fields: ['idTituloReceber'],
      },
      {
        fields: ['idPlanoContaGerencial'],
      },
      {
        fields: ['idCentroCusto'],
      },
      {
        fields: ['dataMovimento'],
      },
      {
        fields: ['usercreation'],
      },
    ],
  }
);

// Setup associations
MovimentoFinanceiroTituloReceber.belongsTo(Usuario, { foreignKey: 'usercreation', as: 'usuarioCriador' });
MovimentoFinanceiroTituloReceber.belongsTo(ParcelaTituloReceber, { foreignKey: 'idParcelaTituloReceber', as: 'parcelaTituloReceber' });
MovimentoFinanceiroTituloReceber.belongsTo(TituloReceber, { foreignKey: 'idTituloReceber', as: 'tituloReceber' });
MovimentoFinanceiroTituloReceber.belongsTo(PlanoContaGerencial, { foreignKey: 'idPlanoContaGerencial', as: 'planoContaGerencial' });
MovimentoFinanceiroTituloReceber.belongsTo(CentroCusto, { foreignKey: 'idCentroCusto', as: 'centroCusto' });
MovimentoFinanceiroTituloReceber.belongsTo(Conta, { foreignKey: 'idConta', as: 'conta' });

export default MovimentoFinanceiroTituloReceber;
