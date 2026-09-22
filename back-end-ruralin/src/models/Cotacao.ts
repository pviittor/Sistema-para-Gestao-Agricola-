import { DataTypes, Model, Optional } from 'sequelize'
import sequelize from '../config/database'
import PedidoCompra from './PedidoCompra'
import Pessoa from './Pessoa'

/**
 * Interface para atributos da entidade Cotacao
 */
interface CotacaoAttributes {
  id: number
  tenantId: number
  pedidoCompraId: number
  fornecedorId: number
  numero: string
  data_cotacao: string
  data_validade?: string | null
  prazo_entrega_dias?: number | null
  condicao_pagamento?: string | null
  vl_total: number
  ranking_posicao?: number | null
  status: string
  observacoes?: string | null
  ativo: boolean
  createdAt: Date
  updatedAt: Date
}

/**
 * Interface para atributos de criacao (id e opcional pois e auto-increment)
 */
interface CotacaoCreationAttributes extends Optional<CotacaoAttributes,
  'id' | 'createdAt' | 'updatedAt' | 'data_validade' | 'prazo_entrega_dias' |
  'condicao_pagamento' | 'vl_total' | 'ranking_posicao' | 'status' | 'observacoes' | 'ativo'
> {}

/**
 * Modelo Sequelize para a entidade Cotacao
 *
 * Cotacoes de fornecedores vinculadas a pedidos de compra
 */
class Cotacao
  extends Model<CotacaoAttributes, CotacaoCreationAttributes>
  implements CotacaoAttributes
{
  public id!: number
  public tenantId!: number
  public pedidoCompraId!: number
  public fornecedorId!: number
  public numero!: string
  public data_cotacao!: string
  public data_validade!: string | null
  public prazo_entrega_dias!: number | null
  public condicao_pagamento!: string | null
  public vl_total!: number
  public ranking_posicao!: number | null
  public status!: string
  public observacoes!: string | null
  public ativo!: boolean
  public readonly createdAt!: Date
  public readonly updatedAt!: Date

  // Relacionamentos
  public pedidoCompra?: PedidoCompra
  public fornecedor?: Pessoa
}

Cotacao.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
      comment: 'ID unico da cotacao',
    },
    tenantId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: 'ID do tenant ao qual a cotacao pertence',
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
    fornecedorId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: 'ID do fornecedor',
      references: {
        model: 'C001_PESSOA',
        key: 'id_pessoa',
      },
      onUpdate: 'CASCADE',
      onDelete: 'RESTRICT',
    },
    numero: {
      type: DataTypes.STRING(20),
      allowNull: false,
      comment: 'Numero da cotacao',
    },
    data_cotacao: {
      type: DataTypes.DATEONLY,
      allowNull: false,
      comment: 'Data da cotacao',
    },
    data_validade: {
      type: DataTypes.DATEONLY,
      allowNull: true,
      comment: 'Data de validade da cotacao',
    },
    prazo_entrega_dias: {
      type: DataTypes.INTEGER,
      allowNull: true,
      comment: 'Prazo de entrega em dias',
    },
    condicao_pagamento: {
      type: DataTypes.STRING(100),
      allowNull: true,
      comment: 'Condicao de pagamento (ex: 30/60/90)',
    },
    vl_total: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: false,
      defaultValue: 0,
      comment: 'Valor total da cotacao (soma dos itens)',
    },
    ranking_posicao: {
      type: DataTypes.INTEGER,
      allowNull: true,
      comment: 'Posicao no ranking (1=menor preco)',
    },
    status: {
      type: DataTypes.STRING(20),
      allowNull: false,
      defaultValue: 'pendente',
      comment: 'Status da cotacao (pendente, selecionada, rejeitada)',
    },
    observacoes: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: 'Observacoes da cotacao',
    },
    ativo: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
      comment: 'Soft delete - indica se o registro esta ativo',
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
    tableName: 'C053_cotacao',
    timestamps: true,
    underscored: false,
  }
)

// Associacoes belongsTo definidas aqui (parent associations)
Cotacao.belongsTo(PedidoCompra, { foreignKey: 'pedidoCompraId', as: 'pedidoCompra' })
Cotacao.belongsTo(Pessoa, { foreignKey: 'fornecedorId', as: 'fornecedor' })

export default Cotacao
