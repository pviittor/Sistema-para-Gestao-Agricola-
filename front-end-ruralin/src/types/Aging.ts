export interface AgingFaixa {
  label: string
  diasMin: number | null
  diasMax: number | null
  count: number
  valorTotal: number
  valorSaldo: number
  parcelas: AgingParcela[]
}

export interface AgingParcela {
  id: number
  idTitulo: number
  numeroTitulo: string
  numeroParcela: number
  fornecedorCliente: string
  dataVencimento: string
  valorTotal: number
  valorSaldo: number
  diasAtraso: number
  fazenda?: string
  safra?: string
}

export interface AgingReport {
  tipo: 'PAGAR' | 'RECEBER' | 'AMBOS'
  dataReferencia: string
  faixas: AgingFaixa[]
  totalGeral: {
    count: number
    valorTotal: number
    valorSaldo: number
  }
}

export interface AgingFiltros {
  tipo: 'PAGAR' | 'RECEBER' | 'AMBOS'
  idFazenda?: number
  idSafra?: number
  idFornecedorCliente?: number
  idPlanoContaGerencial?: number
}
