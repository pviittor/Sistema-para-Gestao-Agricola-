export interface CotacaoItem {
  id?: number
  tenantId?: number
  cotacaoId?: number
  itemPedidoCompraId: number
  produtoId: number
  descricao: string
  quantidade: number
  vl_unitario: number
  vl_total?: number | null
  observacao?: string | null
  createdAt?: string
  updatedAt?: string
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

export interface CotacaoItemSemId {
  itemPedidoCompraId: number
  produtoId: number
  descricao: string
  quantidade: number
  vl_unitario: number
  observacao?: string | null
}

export interface Cotacao {
  id?: number
  tenantId?: number
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
  ativo?: boolean
  createdAt?: string
  updatedAt?: string
  fornecedor?: {
    id_pessoa: number
    nome: string
    cnpj_cpf?: string
  }
  pedidoCompra?: {
    id_ped_compra: number
    numero: string
    status: string
  }
  itens?: CotacaoItem[]
}

export interface CreateCotacaoCompleto {
  pedidoCompraId: number
  fornecedorId: number
  numero: string
  data_cotacao: string
  data_validade?: string | null
  prazo_entrega_dias?: number | null
  condicao_pagamento?: string | null
  observacoes?: string | null
  itens: CotacaoItemSemId[]
}
