export interface Financeiro {
  id?: number
  usuarioId: number
  contaId: number
  historicoId: number
  planoFinanceiroId: number
  tipoDocuentoId: number
  tipoPagamentoId: number

  contaDesc: string
  historicoDesc: string
  planoFinanceiroDesc: string
  tipoDocuentoDesc: string
  tipoPagamentoDesc: string

  dataEmissao: string
  dataVencimento: string
  valor: number
  observacao: string
}

export interface FinanceiroConta {
  id_conta: number
  descricao_conta: string
}

export interface FinanceiroHistorico {
  codigo: number
  descricao: string
}

export interface FinanceiroPlanoFinanceiro {
  id_plano: number
  descricao_plano: string
}

export interface FinanceiroTipoDocumento {
  id_tipodoc: number
  descricao_tipodoc: string
}

export interface FinanceiroTipoPagamento {
  id_tipopgto: number
  descricao_tipopgto: string
}
