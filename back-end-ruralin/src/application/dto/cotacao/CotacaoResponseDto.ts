import { CotacaoItemResponseDto } from './CotacaoItemResponseDto'

/**
 * CotacaoResponseDto - DTO para resposta de cotacao
 */
export class CotacaoResponseDto {
  id!: number
  tenantId!: number
  pedidoCompraId!: number
  fornecedorId!: number
  numero!: string
  data_cotacao!: string
  data_validade?: string | null
  prazo_entrega_dias?: number | null
  condicao_pagamento?: string | null
  vl_total!: number
  ranking_posicao?: number | null
  status!: string
  observacoes?: string | null
  ativo!: boolean
  createdAt!: Date
  updatedAt!: Date

  // Relacionamentos opcionais
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
  itens?: CotacaoItemResponseDto[]
}
