/**
 * Interface para NumeracaoNfe — controle de numeração sequencial de NF-e
 */
export interface NumeracaoNfe {
  id: number
  tenantId: number
  serie: string
  modelo: string
  ultimo_numero: number
  ativo: boolean
  createdAt?: string
  updatedAt?: string
}

export interface CreateNumeracaoNfe {
  serie: string
  modelo: string
  ultimo_numero?: number
  ativo?: boolean
}

export interface UpdateNumeracaoNfe {
  serie?: string
  modelo?: string
  ultimo_numero?: number
  ativo?: boolean
}
