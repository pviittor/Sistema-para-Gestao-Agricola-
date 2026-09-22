export type TipoGeracao = 'MANUAL' | 'PARCELADO' | 'RECORRENTE'
export type IndiceCorrecao = 'NENHUM' | 'IPCA' | 'IGPM' | 'FIXO'
export type ModeloJuros = 'SIMPLES' | 'PRICE'
export type StatusParcela = 'ABERTA' | 'PARCIAL' | 'BAIXADA' | 'CANCELADA'
export type TipoMovimento = 'BAIXA_TOTAL' | 'BAIXA_PARCIAL'

export interface TituloPagar {
  id: number
  tenantId: number
  numeroTitulo: string
  idFornecedor: number
  idPortador: number
  idProdutor: number
  idFazenda: number
  idSafra: number
  idTalhao?: number | null
  idMoeda: number
  dataLancamento: string
  valorTitulo: number
  valorTituloMoedaOriginal?: number | null
  valorTituloMoedaPadrao?: number | null
  quantidadeParcelas: number
  status: string
  observacao?: string | null
  impostoRenda?: boolean
  idNotaFiscal?: number | null
  tipoGeracao: TipoGeracao
  origemTipo?: string | null
  origemId?: number | null
  recorrenciaFinanceiraId?: number | null
  taxaJurosAm?: number | null
  indiceCorrecao: IndiceCorrecao
  taxaCorrecaoFixaAm?: number | null
  taxaMulta?: number | null
  intervaloParcelasDias?: number | null
  dataPrimeiraParcela?: string | null
  modeloJuros: ModeloJuros
  // includes
  fornecedor?: { id_pessoa: number; nomerazao_pessoa: string | null; cpfcnpj_pessoa?: string | null }
  portador?: { id_pessoa: number; nomerazao_pessoa: string | null; cpfcnpj_pessoa?: string | null }
  produtor?: { id_pessoa: number; nomerazao_pessoa: string | null; cpfcnpj_pessoa?: string | null }
  fazenda?: { id: number; descricao: string; idMunicipio?: number }
  safra?: { id: number; nome: string; dataInicio?: string; dataFim?: string | null; status?: string }
  parcelas?: ParcelaTituloPagar[]
  rateiosPlanoConta?: RateioPlanoContaTituloPagar[]
  rateiosCentroCusto?: RateioCentroCustoTituloPagar[]
}

export interface RateioPlanoContaTituloPagar {
  id: number
  idPlanoContaGerencial: number
  valorRateio: number
  percentualRateio: number
  observacao?: string | null
}

export interface RateioCentroCustoTituloPagar {
  id: number
  idCentroCusto: number
  valorRateio: number
  percentualRateio: number
  observacao?: string | null
}

export interface ParcelaTituloPagar {
  id: number
  idTituloPagar: number
  numeroParcela: number
  numeroTotalParcelas: number
  dataVencimento: string
  valorParcela: number
  taxaJuros: number
  valorJuros: number
  valorCorrecao: number
  taxaMulta: number
  valorMulta: number
  valorDesconto: number
  valorTotal: number
  valorPago: number
  valorSaldo: number
  dataBaixa?: string | null
  valorBaixa?: number | null
  status: StatusParcela
  idConta?: number | null
  observacao?: string | null
  diasAtraso?: number
}

export interface MovimentoFinanceiroTituloPagar {
  id: number
  idParcelaTituloPagar: number
  dataMovimento: string
  valorMovimento: number
  tipoMovimento: TipoMovimento
  idConta: number
  observacao?: string | null
}

export interface TituloPagarKpis {
  totalAberto: number
  totalVencido: number
  totalAVencer30Dias: number
  totalBaixadoMes: number
  quantidadeAberto: number
  quantidadeVencido: number
}

export interface CreateTituloPagarDto {
  numeroTitulo: string
  idFornecedor: number
  idPortador: number
  idProdutor: number
  idFazenda: number
  idSafra: number
  idTalhao?: number | null
  idMoeda: number
  dataLancamento: string
  valorTitulo: number
  quantidadeParcelas: number
  observacao?: string | null
  impostoRenda?: boolean
  idNotaFiscal?: number | null
  // Parcelamento
  tipoGeracao?: TipoGeracao
  taxaJurosAm?: number | null
  indiceCorrecao?: IndiceCorrecao
  taxaCorrecaoFixaAm?: number | null
  taxaMulta?: number | null
  intervaloParcelasDias?: number
  dataPrimeiraParcela?: string | null
  modeloJuros?: ModeloJuros
}

export interface BaixaParcelaDto {
  idParcela: number
  tipo: 'PAGAR' | 'RECEBER'
  dataBaixa: string
  valorBaixa: number
  observacao?: string
}

export interface BaixaParcelaResponse {
  parcela: ParcelaTituloPagar
  movimento: MovimentoFinanceiroTituloPagar
  statusTitulo: string
}
