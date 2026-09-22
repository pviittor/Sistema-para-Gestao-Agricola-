import { DataTypes, Model, Optional } from 'sequelize'
import sequelize from '../config/database'
import Cotacao from './Cotacao'
import ItemPedidoCompra from './ItemPedidoCompra'
import Produto from './Produto'

/**
 * Interface para atributos da entidade CotacaoItem
 */
interface CotacaoItemAttributes {
  id: number
  tenantId: number
  cotacaoId: number
  itemPedidoCompraId: number
  produtoId: number
  descricao: string
  quantidade: number
  vl_unitario: number
  vl_total?: number | null
  observacao?: string | null
  createdAt: Date
  updatedAt: Date
}

/**
 * Interface para atributos de criacao
 */
interface CotacaoItemCreationAttributes extends Optional<CotacaoItemAttributes,
  'id' | 'createdAt' | 'updatedAt' | 'vl_total' | 'observacao'
> {}

/**
 * Modelo Sequelize para a entidade CotacaoItem
 *
 * Itens da cotacao vinculados a itens do pedido de compra
 */
class CotacaoItem
  extends Model<CotacaoItemAttributes, CotacaoItemCreationAttributes>
  implements CotacaoItemAttributes
{
  public id!: number
  public tenantId!: number
  public cotacaoId!: number
  public itemPedidoCompraId!: number
  public produtoId!: number
  public descricao!: string
  public quantidade!: number
  public vl_unitario!: number
  public vl_total!: number | null
  public observacao!: string | null
  public readonly createdAt!: Date
  public readonly updatedAt!: Date

  // Relacionamentos
  public cotacao?: Cotacao
  public itemPedidoCompra?: ItemPedidoCompra
  public produto?: Produto
}

CotacaoItem.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
      comment: 'ID unico do item da cotacao',
    },
    tenantId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: 'ID do tenant ao qual o item pertence',
    },
    cotacaoId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: 'ID da cotacao',
      references: {
        model: 'C053_cotacao',
        key: 'id',
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
      comment: 'Descricao do produto na cotacao',
    },
    quantidade: {
      type: DataTypes.DECIMAL(15, 4),
      allowNull: false,
      comment: 'Quantidade cotada',
    },
    vl_unitario: {
      type: DataTypes.DECIMAL(15, 4),
      allowNull: false,
      comment: 'Valor unitario cotado',
    },
    vl_total: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: true,
      comment: 'Valor total do item (quantidade x vl_unitario)',
    },
    observacao: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: 'Observacao do item',
    },
    createdAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    updatedAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    sequelize,
    tableName: 'C054_cotacaoItem',
    timestamps: true,
    underscored: false,
  }
)

// Padrao master-detail: AMBAS associacoes no arquivo do child
Cotacao.hasMany(CotacaoItem, { foreignKey: 'cotacaoId', as: 'itens', onDelete: 'CASCADE' })
CotacaoItem.belongsTo(Cotacao, { foreignKey: 'cotacaoId', as: 'cotacao' })
CotacaoItem.belongsTo(ItemPedidoCompra, { foreignKey: 'itemPedidoCompraId', as: 'itemPedidoCompra' })
CotacaoItem.belongsTo(Produto, { foreignKey: 'produtoId', as: 'produto' })

export default CotacaoItem
