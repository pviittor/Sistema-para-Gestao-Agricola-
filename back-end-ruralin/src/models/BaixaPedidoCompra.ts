import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';
import Pessoa from './Pessoa';
import NotaFiscal from './NotaFiscal';
import PedidoCompra from './PedidoCompra';
import Usuario from './Usuario';

/**
 * Interface para atributos da entidade BaixaPedidoCompra
 */
interface BaixaPedidoCompraAttributes {
  id_baixa_ped: number;
  tenantId: number;
  empresaId: number;
  notaFiscalId: number;
  pedidoCompraId: number;
  usuarioId: number;
  status: string;
  data_baixa: Date;
  vl_total_baixa: number;
  vl_divergencia: number;
  percentual_divergencia: number;
  estoque_movimentado: boolean;
  financeiro_gerado: boolean;
  xml_importado: boolean;
  observacoes?: string | null;
  motivo_cancelamento?: string | null;
  data_cancelamento?: Date | null;
  ativo: boolean;
  usercreation: number;
  datecreation: Date;
}

/**
 * Interface para atributos de criacao (id_baixa_ped e opcional pois e auto-increment)
 */
interface BaixaPedidoCompraCreationAttributes extends Optional<BaixaPedidoCompraAttributes,
  'id_baixa_ped' | 'datecreation' | 'status' | 'vl_total_baixa' | 'vl_divergencia' |
  'percentual_divergencia' | 'estoque_movimentado' | 'financeiro_gerado' | 'xml_importado' |
  'observacoes' | 'motivo_cancelamento' | 'data_cancelamento' | 'ativo'
> {}

/**
 * Modelo Sequelize para a entidade BaixaPedidoCompra
 *
 * Registro de baixa (recebimento) de pedidos de compra vinculados a notas fiscais
 */
class BaixaPedidoCompra
  extends Model<BaixaPedidoCompraAttributes, BaixaPedidoCompraCreationAttributes>
  implements BaixaPedidoCompraAttributes
{
  public id_baixa_ped!: number;
  public tenantId!: number;
  public empresaId!: number;
  public notaFiscalId!: number;
  public pedidoCompraId!: number;
  public usuarioId!: number;
  public status!: string;
  public data_baixa!: Date;
  public vl_total_baixa!: number;
  public vl_divergencia!: number;
  public percentual_divergencia!: number;
  public estoque_movimentado!: boolean;
  public financeiro_gerado!: boolean;
  public xml_importado!: boolean;
  public observacoes!: string | null;
  public motivo_cancelamento!: string | null;
  public data_cancelamento!: Date | null;
  public ativo!: boolean;
  public usercreation!: number;
  public datecreation!: Date;

  // Relacionamentos
  public empresa?: Pessoa;
  public notaFiscal?: NotaFiscal;
  public pedidoCompra?: PedidoCompra;
  public usuario?: Usuario;
  public usuarioCriador?: Usuario;
}

BaixaPedidoCompra.init(
  {
    id_baixa_ped: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
      comment: 'ID unico da baixa de pedido de compra',
    },
    tenantId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: 'tenantId',
      comment: 'ID do tenant ao qual a baixa pertence',
    },
    empresaId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: 'ID da empresa (pessoa)',
      references: {
        model: 'C001_PESSOA',
        key: 'id_pessoa',
      },
      onUpdate: 'CASCADE',
      onDelete: 'RESTRICT',
    },
    notaFiscalId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: 'ID da nota fiscal vinculada',
      references: {
        model: 'C045_notaFiscal',
        key: 'id_nf',
      },
      onUpdate: 'CASCADE',
      onDelete: 'RESTRICT',
    },
    pedidoCompraId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: 'ID do pedido de compra',
      references: {
        model: 'C047_pedidoCompra',
        key: 'id_ped_compra',
      },
      onUpdate: 'CASCADE',
      onDelete: 'RESTRICT',
    },
    usuarioId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: 'ID do usuario que realizou a baixa',
      references: {
        model: 'usuarios',
        key: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'RESTRICT',
    },
    status: {
      type: DataTypes.ENUM('pendente', 'processada', 'cancelada'),
      allowNull: false,
      defaultValue: 'pendente',
      comment: 'Status da baixa (pendente, processada, cancelada)',
    },
    data_baixa: {
      type: DataTypes.DATEONLY,
      allowNull: false,
      comment: 'Data da baixa/recebimento',
    },
    vl_total_baixa: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: false,
      defaultValue: 0,
      comment: 'Valor total da baixa',
    },
    vl_divergencia: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: false,
      defaultValue: 0,
      comment: 'Valor da divergencia entre pedido e NF',
    },
    percentual_divergencia: {
      type: DataTypes.DECIMAL(5, 2),
      allowNull: false,
      defaultValue: 0,
      comment: 'Percentual de divergencia entre pedido e NF',
    },
    estoque_movimentado: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
      comment: 'Indica se o estoque ja foi movimentado',
    },
    financeiro_gerado: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
      comment: 'Indica se o financeiro ja foi gerado',
    },
    xml_importado: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
      comment: 'Indica se a baixa foi originada de importacao de XML',
    },
    observacoes: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: 'Observacoes gerais sobre a baixa',
    },
    motivo_cancelamento: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: 'Motivo do cancelamento da baixa',
    },
    data_cancelamento: {
      type: DataTypes.DATEONLY,
      allowNull: true,
      comment: 'Data do cancelamento da baixa',
    },
    ativo: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
      comment: 'Soft delete - indica se o registro esta ativo',
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
    tableName: 'C049_baixaPedidoCompra',
    timestamps: false,
    underscored: false,
    indexes: [
      {
        fields: ['tenantId'],
      },
      {
        fields: ['empresaId'],
      },
      {
        fields: ['notaFiscalId'],
      },
      {
        fields: ['pedidoCompraId'],
      },
      {
        fields: ['usuarioId'],
      },
      {
        fields: ['status'],
      },
      {
        fields: ['data_baixa'],
      },
      {
        fields: ['ativo'],
      },
      {
        fields: ['usercreation'],
      },
      {
        unique: true,
        fields: ['notaFiscalId', 'pedidoCompraId', 'tenantId'],
        name: 'idx_baixaPed_nf_pedido_tenant',
      },
    ],
  }
);

// Setup associations
BaixaPedidoCompra.belongsTo(Pessoa, { foreignKey: 'empresaId', as: 'empresa' });
BaixaPedidoCompra.belongsTo(NotaFiscal, { foreignKey: 'notaFiscalId', as: 'notaFiscal' });
BaixaPedidoCompra.belongsTo(PedidoCompra, { foreignKey: 'pedidoCompraId', as: 'pedidoCompra' });
BaixaPedidoCompra.belongsTo(Usuario, { foreignKey: 'usuarioId', as: 'usuario' });
BaixaPedidoCompra.belongsTo(Usuario, { foreignKey: 'usercreation', as: 'usuarioCriador' });

export default BaixaPedidoCompra;
