import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';
import PedidoCompra from './PedidoCompra';
import Produto from './Produto';
import Usuario from './Usuario';

/**
 * Interface para atributos da entidade ItemPedidoCompra
 */
interface ItemPedidoCompraAttributes {
  id_item_ped: number;
  tenantId: number;
  pedidoCompraId: number;
  numero_item: number;
  produtoId: number;
  descricao: string;
  unidade: string;
  quantidade_solicitada: number;
  quantidade_atendida: number;
  quantidade_pendente: number;
  vl_unitario: number;
  vl_desconto: number;
  vl_bruto: number;
  vl_total: number;
  status: string;
  depositoDestinoId?: number | null;
  observacao?: string | null;
  usercreation: number;
  datecreation: Date;
}

/**
 * Interface para atributos de criacao (id_item_ped e opcional pois e auto-increment)
 */
interface ItemPedidoCompraCreationAttributes extends Optional<ItemPedidoCompraAttributes,
  'id_item_ped' | 'datecreation' | 'quantidade_atendida' | 'quantidade_pendente' |
  'vl_desconto' | 'vl_bruto' | 'vl_total' | 'status' | 'depositoDestinoId' | 'observacao'
> {}

/**
 * Modelo Sequelize para a entidade ItemPedidoCompra
 *
 * Itens (produtos/insumos) vinculados a um pedido de compra
 */
class ItemPedidoCompra
  extends Model<ItemPedidoCompraAttributes, ItemPedidoCompraCreationAttributes>
  implements ItemPedidoCompraAttributes
{
  public id_item_ped!: number;
  public tenantId!: number;
  public pedidoCompraId!: number;
  public numero_item!: number;
  public produtoId!: number;
  public descricao!: string;
  public unidade!: string;
  public quantidade_solicitada!: number;
  public quantidade_atendida!: number;
  public quantidade_pendente!: number;
  public vl_unitario!: number;
  public vl_desconto!: number;
  public vl_bruto!: number;
  public vl_total!: number;
  public status!: string;
  public depositoDestinoId!: number | null;
  public observacao!: string | null;
  public usercreation!: number;
  public datecreation!: Date;

  // Relacionamentos
  public pedidoCompra?: PedidoCompra;
  public produto?: Produto;
  public usuarioCriador?: Usuario;
}

ItemPedidoCompra.init(
  {
    id_item_ped: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
      comment: 'ID unico do item do pedido de compra',
    },
    tenantId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: 'tenantId',
      comment: 'ID do tenant ao qual o item pertence',
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
      onDelete: 'CASCADE',
    },
    numero_item: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: 'Numero sequencial do item dentro do pedido',
    },
    produtoId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: 'ID do produto',
      references: {
        model: 'C008_produto',
        key: 'id_prod',
      },
      onUpdate: 'CASCADE',
      onDelete: 'RESTRICT',
    },
    descricao: {
      type: DataTypes.STRING(120),
      allowNull: false,
      comment: 'Descricao do produto no momento do pedido',
    },
    unidade: {
      type: DataTypes.STRING(6),
      allowNull: false,
      comment: 'Unidade de medida (UN, KG, CX, LT, etc)',
    },
    quantidade_solicitada: {
      type: DataTypes.DECIMAL(15, 4),
      allowNull: false,
      comment: 'Quantidade solicitada no pedido',
    },
    quantidade_atendida: {
      type: DataTypes.DECIMAL(15, 4),
      allowNull: false,
      defaultValue: 0,
      comment: 'Quantidade ja atendida/entregue',
    },
    quantidade_pendente: {
      type: DataTypes.DECIMAL(15, 4),
      allowNull: false,
      defaultValue: 0,
      comment: 'Quantidade pendente de entrega',
    },
    vl_unitario: {
      type: DataTypes.DECIMAL(15, 10),
      allowNull: false,
      comment: 'Valor unitario do item',
    },
    vl_desconto: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: false,
      defaultValue: 0,
      comment: 'Valor do desconto',
    },
    vl_bruto: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: false,
      defaultValue: 0,
      comment: 'Valor bruto (quantidade_solicitada x vl_unitario)',
    },
    vl_total: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: false,
      defaultValue: 0,
      comment: 'Valor total (vl_bruto - vl_desconto)',
    },
    status: {
      type: DataTypes.ENUM('pendente', 'parcialmente_atendido', 'atendido', 'cancelado'),
      allowNull: false,
      defaultValue: 'pendente',
      comment: 'Status do item do pedido',
    },
    depositoDestinoId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      comment: 'ID do deposito de destino',
      // TODO: Adicionar FK quando Deposito for implementado
    },
    observacao: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: 'Observacao do item',
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
    tableName: 'C048_itemPedidoCompra',
    timestamps: false,
    underscored: false,
    indexes: [
      {
        fields: ['tenantId'],
      },
      {
        fields: ['pedidoCompraId'],
      },
      {
        fields: ['produtoId'],
      },
      {
        fields: ['status'],
      },
      {
        fields: ['usercreation'],
      },
      {
        unique: true,
        fields: ['pedidoCompraId', 'numero_item'],
        name: 'idx_itemPedCompra_pedido_numeroItem',
      },
    ],
  }
);

// Setup associations
PedidoCompra.hasMany(ItemPedidoCompra, { foreignKey: 'pedidoCompraId', as: 'itens', onDelete: 'CASCADE' });
ItemPedidoCompra.belongsTo(PedidoCompra, { foreignKey: 'pedidoCompraId', as: 'pedidoCompra' });
ItemPedidoCompra.belongsTo(Produto, { foreignKey: 'produtoId', as: 'produto' });
ItemPedidoCompra.belongsTo(Usuario, { foreignKey: 'usercreation', as: 'usuarioCriador' });

export default ItemPedidoCompra;
