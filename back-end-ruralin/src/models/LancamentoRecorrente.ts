import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';
import Usuario from './Usuario';
import RecorrenciaFinanceira from './RecorrenciaFinanceira';
import TituloPagar from './TituloPagar';
import TituloReceber from './TituloReceber';

export enum StatusLancamentoRecorrente {
  GERADO = 'GERADO',
  CANCELADO = 'CANCELADO',
}

interface LancamentoRecorrenteAttributes {
  id: number;
  tenantId: number;
  recorrenciaFinanceiraId: number;
  tituloPagarId?: number | null;
  tituloReceberId?: number | null;
  dataReferencia: Date;
  dataVencimentoGerado: Date;
  valorGerado: number;
  status: StatusLancamentoRecorrente;
  observacao?: string | null;
  usercreation: number;
  datecreation: Date;
}

interface LancamentoRecorrenteCreationAttributes extends Optional<LancamentoRecorrenteAttributes,
  'id' | 'datecreation' | 'tituloPagarId' | 'tituloReceberId' | 'status' | 'observacao'
> {}

class LancamentoRecorrente
  extends Model<LancamentoRecorrenteAttributes, LancamentoRecorrenteCreationAttributes>
  implements LancamentoRecorrenteAttributes
{
  public id!: number;
  public tenantId!: number;
  public recorrenciaFinanceiraId!: number;
  public tituloPagarId!: number | null;
  public tituloReceberId!: number | null;
  public dataReferencia!: Date;
  public dataVencimentoGerado!: Date;
  public valorGerado!: number;
  public status!: StatusLancamentoRecorrente;
  public observacao!: string | null;
  public usercreation!: number;
  public datecreation!: Date;

  // Relacionamentos
  public recorrencia?: RecorrenciaFinanceira;
  public tituloPagar?: TituloPagar;
  public tituloReceber?: TituloReceber;
  public usuarioCriador?: Usuario;
}

LancamentoRecorrente.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
      comment: 'ID único do lançamento recorrente',
    },
    tenantId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: 'tenantId',
      comment: 'ID do tenant',
    },
    recorrenciaFinanceiraId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: 'FK para a recorrência template',
      references: { model: 'recorrencia_financeira', key: 'id' },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE',
    },
    tituloPagarId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      comment: 'FK para TituloPagar gerado (quando tipo=PAGAR)',
      references: { model: 'C019_tituloPagar', key: 'id' },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL',
    },
    tituloReceberId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      comment: 'FK para TituloReceber gerado (quando tipo=RECEBER)',
      references: { model: 'C023_tituloReceber', key: 'id' },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL',
    },
    dataReferencia: {
      type: DataTypes.DATEONLY,
      allowNull: false,
      comment: 'Mês/período de competência',
    },
    dataVencimentoGerado: {
      type: DataTypes.DATEONLY,
      allowNull: false,
      comment: 'Data de vencimento efetiva gerada',
    },
    valorGerado: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: false,
      comment: 'Valor do título gerado',
    },
    status: {
      type: DataTypes.ENUM('GERADO', 'CANCELADO'),
      allowNull: false,
      defaultValue: 'GERADO',
      comment: 'Status do lançamento',
    },
    observacao: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: 'Observação sobre a geração',
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
    tableName: 'lancamento_recorrente',
    timestamps: false,
    underscored: false,
    indexes: [
      { fields: ['tenantId'] },
      { fields: ['recorrenciaFinanceiraId'] },
      { fields: ['tituloPagarId'] },
      { fields: ['tituloReceberId'] },
      { fields: ['recorrenciaFinanceiraId', 'dataReferencia', 'status'], unique: true },
    ],
  }
);

// Associations (defined in child file to avoid circular imports)
LancamentoRecorrente.belongsTo(Usuario, { foreignKey: 'usercreation', as: 'usuarioCriador' });
LancamentoRecorrente.belongsTo(RecorrenciaFinanceira, { foreignKey: 'recorrenciaFinanceiraId', as: 'recorrencia' });
LancamentoRecorrente.belongsTo(TituloPagar, { foreignKey: 'tituloPagarId', as: 'tituloPagar' });
LancamentoRecorrente.belongsTo(TituloReceber, { foreignKey: 'tituloReceberId', as: 'tituloReceber' });

// hasMany defined here (child file)
RecorrenciaFinanceira.hasMany(LancamentoRecorrente, { foreignKey: 'recorrenciaFinanceiraId', as: 'lancamentos' });

export default LancamentoRecorrente;
