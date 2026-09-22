import type { ItemPedidoCompra } from './ItemPedidoCompra'

export type { ItemPedidoCompra }

export interface PedidoCompra {
  id_ped_compra?: number
  tenantId?: number
  numero?: string
  empresaId: number
  fornecedorId: number
  compradorId?: number | null
  status?: 'rascunho' | 'aguardando_aprovacao' | 'aprovado' | 'parcialmente_atendido' | 'atendido' | 'cancelado'
  data_emissao: string
  data_previsao_entrega?: string | null
  data_aprovacao?: string | null
  aprovadoPorId?: number | null
  condicaoPagamentoId?: number | null
  forma_pagamento?: string | null
  prazo_pagamento_dias?: number | null
  localEntregaId?: number | null
  cfop?: string | null
  vl_produtos: number
  vl_frete: number
  vl_seguro: number
  vl_desconto: number
  vl_outros: number
  vl_total: number
  percentual_tolerancia: number
  permite_entrega_parcial: boolean
  condicao_pagamento?: string | null
  parcelas_qtd?: number | null
  cotacao_vencedora_id?: number | null
  observacoes?: string | null
  observacoes_fornecedor?: string | null
  motivo_cancelamento?: string | null
  data_cancelamento?: string | null
  ativo?: boolean
  
  // Relacionamentos para exibição
  fornecedor?: {
    id_pessoa: number
    nomerazao_pessoa: string
    nomefantasia_pessoa: string
  }
  empresa?: {
    id_pessoa: number
    nomerazao_pessoa: string
  }
  itens?: ItemPedidoCompra[]
}

export interface PedidoCompraCompletoDto extends PedidoCompra {
  itens: ItemPedidoCompra[]
}
