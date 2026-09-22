export enum StatusRecibo {
  EMITIDO = 'EMITIDO',
  CANCELADO = 'CANCELADO',
}

export enum FormaPagamentoRecibo {
  DINHEIRO = 'DINHEIRO',
  PIX = 'PIX',
  TRANSFERENCIA = 'TRANSFERENCIA',
  CHEQUE = 'CHEQUE',
  BOLETO = 'BOLETO',
  CARTAO = 'CARTAO',
  OUTROS = 'OUTROS',
}

export enum TipoVinculoRecibo {
  AVULSO = 'AVULSO',
  TITULO_PAGAR = 'TITULO_PAGAR',
  TITULO_RECEBER = 'TITULO_RECEBER',
}

export interface NumeracaoRecibo {
  id: number
  tenantId: number
  serie: string
  ultimoNumero: number
  ativo: boolean
  createdAt: string
  updatedAt: string
}

export interface ConfiguracaoRecibo {
  id: number
  tenantId: number
  nomePropriedade: string
  cnpjCpf?: string | null
  inscricaoEstadual?: string | null
  endereco?: string | null
  telefone?: string | null
  logoBase64?: string | null
  observacaoPadrao?: string | null
  localPadrao?: string | null
  ativo: boolean
  createdAt: string
  updatedAt: string
}

export interface Recibo {
  id: number
  tenantId: number
  serie: string
  numero: number
  numeroFormatado: string
  nomeEmitente: string
  documentoEmitente?: string | null
  nomeBeneficiario: string
  documentoBeneficiario?: string | null
  valor: number
  valorExtenso: string
  descricao: string
  formaPagamento: string
  dataEmissao: string
  local?: string | null
  observacoes?: string | null
  status: string
  motivoCancelamento?: string | null
  usuarioCancelamentoId?: number | null
  dataCancelamento?: string | null
  tipoVinculo: string
  tituloPagarId?: number | null
  tituloReceberId?: number | null
  parcelaId?: number | null
  quantidadeImpressoes: number
  usercreation?: number | null
  createdAt: string
  updatedAt: string
  tituloPagar?: any
  tituloReceber?: any
}

export interface CreateReciboPayload {
  nomeEmitente: string
  documentoEmitente?: string
  nomeBeneficiario: string
  documentoBeneficiario?: string
  valor: number
  descricao: string
  formaPagamento: string
  dataEmissao: string
  local?: string
  observacoes?: string
  tipoVinculo?: string
  tituloPagarId?: number | null
  tituloReceberId?: number | null
  parcelaId?: number | null
}

export interface UpdateReciboPayload {
  nomeEmitente?: string
  documentoEmitente?: string
  nomeBeneficiario?: string
  documentoBeneficiario?: string
  valor?: number
  descricao?: string
  formaPagamento?: string
  dataEmissao?: string
  local?: string
  observacoes?: string
  tipoVinculo?: string
  tituloPagarId?: number | null
  tituloReceberId?: number | null
  parcelaId?: number | null
}

export interface CancelarReciboPayload {
  motivoCancelamento: string
}

export interface ReciboKpis {
  totalEmitidos: number
  totalCancelados: number
  valorTotalEmitido: number
  quantidadePorFormaPagamento: Record<string, number>
}

export interface ReciboFiltros {
  status?: string
  dataInicio?: string
  dataFim?: string
  beneficiario?: string
}

export interface CreateNumeracaoReciboPayload {
  serie: string
  ativo?: boolean
}

export interface UpdateNumeracaoReciboPayload {
  serie?: string
  ativo?: boolean
}

export interface CreateConfiguracaoReciboPayload {
  nomePropriedade: string
  cnpjCpf?: string
  inscricaoEstadual?: string
  endereco?: string
  telefone?: string
  logoBase64?: string
  observacaoPadrao?: string
  localPadrao?: string
}

export interface UpdateConfiguracaoReciboPayload {
  nomePropriedade?: string
  cnpjCpf?: string
  inscricaoEstadual?: string
  endereco?: string
  telefone?: string
  logoBase64?: string
  observacaoPadrao?: string
  localPadrao?: string
  ativo?: boolean
}
