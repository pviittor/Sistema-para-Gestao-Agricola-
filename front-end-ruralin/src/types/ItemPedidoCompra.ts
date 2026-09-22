export interface ItemPedidoCompra {
  id_item_ped?: number
  pedidoCompraId?: number
  numero_item?: number
  produtoId: number
  descricao: string
  unidade: string
  quantidade_solicitada: number
  quantidade_atendida?: number
  quantidade_pendente?: number
  vl_unitario: number
  vl_desconto: number
  vl_bruto: number
  vl_total: number
  status?: string
  observacao?: string
  
  // Propriedade auxiliar populada pelo backend para exibição
  produto?: {
    id_prod: number
    descricao_prod: string
  }
}
