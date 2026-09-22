/**
 * CotacaoItemResponseDto - DTO para resposta de item da cotacao
 */
export class CotacaoItemResponseDto {
  id!: number
  tenantId!: number
  cotacaoId!: number
  itemPedidoCompraId!: number
  produtoId!: number
  descricao!: string
  quantidade!: number
  vl_unitario!: number
  vl_total?: number | null
  observacao?: string | null
  createdAt!: Date
  updatedAt!: Date

  // Relacionamentos opcionais
  produto?: {
    id_prod: number
    descricao: string
    unidade?: string
  }
  itemPedidoCompra?: {
    id_item_ped: number
    quantidade_solicitada: number
    vl_unitario: number
  }
}
