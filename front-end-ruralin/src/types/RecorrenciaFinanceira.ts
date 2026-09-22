export type Periodicidade = 'SEMANAL' | 'QUINZENAL' | 'MENSAL' | 'BIMESTRAL' | 'TRIMESTRAL' | 'SEMESTRAL' | 'ANUAL' | 'SAFRA'
export type TipoRecorrencia = 'PAGAR' | 'RECEBER'

export interface RecorrenciaFinanceira {
  id: number
  tenantId: number
  usuarioId: number
  tipo: TipoRecorrencia
  descricao: string
  valor: number
  periodicidade: Periodicidade
  diaVencimento: number
  dataInicio: string
  dataFim: string | null
  ativa: boolean
  idFornecedorCliente: number | null
  idPortador: number | null
  idProdutor: number | null
  idContaDebCred: number | null
  idPlanoContaGerencial: number | null
  idCentroCusto: number | null
  idFazenda: number | null
  idSafra: number | null
  idTalhao: number | null
  idMoeda: number | null
  antecedenciaGeracaoDias: number
  numeroMaximoGeracoes: number | null
  geracoesRealizadas: number
  observacao: string | null
  // includes
  fornecedorCliente?: { id_pessoa: number; nome_pessoa: string }
  fazenda?: { id: number; nome: string }
  safra?: { id: number; descricao: string }
  lancamentos?: LancamentoRecorrente[]
}

export interface LancamentoRecorrente {
  id: number
  recorrenciaFinanceiraId: number
  tituloPagarId: number | null
  tituloReceberId: number | null
  dataReferencia: string
  dataVencimentoGerado: string
  valorGerado: number
  status: 'GERADO' | 'CANCELADO'
  observacao: string | null
}

export interface PreviewGeracao {
  dataReferencia: string
  dataVencimento: string
  valor: number
}

export interface RecorrenciaFinanceiraKpis {
  totalAtivasPagar: number
  totalAtivasReceber: number
  valorTotalPagar: number
  valorTotalReceber: number
  totalInativas: number
  proximasGeracoes: number
}

export interface AlertaVencimentoConfig {
  id: number
  usuarioId: number
  tipoTitulo: 'PAGAR' | 'RECEBER' | 'AMBOS'
  antecedenciaAlerta1Dias: number
  antecedenciaAlerta2Dias: number
  antecedenciaAlerta3Dias: number
  notificarNoVencimento: boolean
  notificarVencidos: boolean
  frequenciaRenotificacaoVencidosDias: number
  ativo: boolean
}
