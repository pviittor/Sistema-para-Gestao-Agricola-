import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';
import BaixaPedidoCompra from './BaixaPedidoCompra';
import ItemPedidoCompra from './ItemPedidoCompra';
import ItemNotaFiscal from './ItemNotaFiscal';
import Usuario from './Usuario';

/**
 * Interface para atributos da entidade ItemBaixaPedidoCompra
 */
interface ItemBaixaPedidoCompraAttributes {
  id_item_baixa_ped: number;
  tenantId: number;
  baixaPedidoCompraId: number;
  itemPedidoCompraId: number;
  itemNotaFiscalId: number;
  quantidade: number;
  vl_unitario_pedido: number;
  vl_unitario_nf: number;
  vl_divergencia: number;
  divergencia_aprovada: boolean;
  usercreation: number;
  datecreation: Date;
}

/**
 * Interface para atributos de criacao (id_item_baixa_ped e opcional pois e auto-increment)
 */
interface ItemBaixaPedidoCompraCreationAttributes extends Optional<ItemBaixaPedidoCompraAttributes,
  'id_item_baixa_ped' | 'datecreation' | 'vl_unitario_pedido' | 'vl_unitario_nf' |
  'vl_divergencia' | 'divergencia_aprovada'
> {}

/**
 * Modelo Sequelize para a entidade ItemBaixaPedidoCompra
 *
 * Itens da baixa de pedido de compra, vinculando itens do pedido aos itens da nota fiscal
 */
class ItemBaixaPedidoCompra
  extends Model<ItemBaixaPedidoCompraAttributes, ItemBaixaPedidoCompraCreationAttributes>
  implements ItemBaixaPedidoCompraAttributes
{
  public id_item_baixa_ped!: number;
  public tenantId!: number;
  public baixaPedidoCompraId!: number;
  public itemPedidoCompraId!: number;
  public itemNotaFiscalId!: number;
  public quantidade!: number;
  public vl_unitario_pedido!: number;
  public vl_unitario_nf!: number;
  public vl_divergencia!: number;
  public divergencia_aprovada!: boolean;
  public usercreation!: number;
  public datecreation!: Date;

  // Relacionamentos
  public baixaPedidoCompra?: BaixaPedidoCompra;
  public itemPedidoCompra?: ItemPedidoCompra;
  public itemNotaFiscal?: ItemNotaFiscal;
  public usuarioCriador?: Usuario;
}

ItemBaixaPedidoCompra.init(
  {
    id_item_baixa_ped: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
      comment: 'ID unico do item da baixa de pedido de compra',
    },
    tenantId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: 'tenantId',
      comment: 'ID do tenant ao qual o item da baixa pertence',
    },
    baixaPedidoCompraId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: 'ID da baixa de pedido de compra',
      references: {
        model: 'C049_baixaPedidoCompra',
        key: 'id_baixa_ped',
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE',
    },
    itemPedidoCompraId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: 'ID do item do pedido de compra',
      references: {
        model: 'C048_itemPedidoCompra',
        key: 'id_item_ped',
      },
      onUpdate: 'CASCADE',
      onDelete: 'RESTRICT',
    },
    itemNotaFiscalId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: 'ID do item da nota fiscal',
      references: {
        model: 'C046_itemNotaFiscal',
        key: 'id_item_nf',
      },
      onUpdate: 'CASCADE',
      onDelete: 'RESTRICT',
    },
    quantidade: {
      type: DataTypes.DECIMAL(15, 4),
      allowNull: false,
      comment: 'Quantidade baixada',
    },
    vl_unitario_pedido: {
      type: DataTypes.DECIMAL(15, 10),
      allowNull: false,
      defaultValue: 0,
      comment: 'Valor unitario do pedido de compra',
    },
    vl_unitario_nf: {
      type: DataTypes.DECIMAL(15, 10),
      allowNull: false,
      defaultValue: 0,
      comment: 'Valor unitario da nota fiscal',
    },
    vl_divergencia: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: false,
      defaultValue: 0,
      comment: 'Valor da divergencia entre pedido e NF',
    },
    divergencia_aprovada: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
      comment: 'Indica se a divergencia foi aprovada',
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
    tableName: 'C050_itemBaixaPedidoCompra',
    timestamps: false,
    underscored: false,
    indexes: [
      {
        fields: ['tenantId'],
      },
      {
        fields: ['baixaPedidoCompraId'],
      },
      {
        fields: ['itemPedidoCompraId'],
      },
      {
        fields: ['itemNotaFiscalId'],
      },
      {
        fields: ['usercreation'],
      },
    ],
  }
);

// Setup associations
ItemBaixaPedidoCompra.belongsTo(BaixaPedidoCompra, { foreignKey: 'baixaPedidoCompraId', as: 'baixaPedidoCompra' });
ItemBaixaPedidoCompra.belongsTo(ItemPedidoCompra, { foreignKey: 'itemPedidoCompraId', as: 'itemPedidoCompra' });
ItemBaixaPedidoCompra.belongsTo(ItemNotaFiscal, { foreignKey: 'itemNotaFiscalId', as: 'itemNotaFiscal' });
ItemBaixaPedidoCompra.belongsTo(Usuario, { foreignKey: 'usercreation', as: 'usuarioCriador' });

export default ItemBaixaPedidoCompra;
