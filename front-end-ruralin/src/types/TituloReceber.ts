import type { StatusParcela, TipoGeracao, IndiceCorrecao, ModeloJuros, TipoMovimento } from './TituloPagar'

export interface TituloReceber {
  id: number
  tenantId: number
  numeroTitulo: string
  idCliente: number
  idPortador: number
  idProdutor: number
  idFazenda: number
  idSafra: number
  idTalhao?: number | null
  idMoeda: number
  dataLancamento: string
  valorTitulo: number
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
  valorTituloMoedaOriginal?: number | null
  valorTituloMoedaPadrao?: number | null
  // includes
  cliente?: { id_pessoa: number; nomerazao_pessoa: string | null; cpfcnpj_pessoa?: string | null }
  portador?: { id_pessoa: number; nomerazao_pessoa: string | null; cpfcnpj_pessoa?: string | null }
  produtor?: { id_pessoa: number; nomerazao_pessoa: string | null; cpfcnpj_pessoa?: string | null }
  fazenda?: { id: number; descricao: string; idMunicipio?: number }
  safra?: { id: number; nome: string; dataInicio?: string; dataFim?: string | null; status?: string }
  parcelas?: ParcelaTituloReceber[]
  rateiosPlanoConta?: RateioPlanoContaTituloReceber[]
  rateiosCentroCusto?: RateioCentroCustoTituloReceber[]
}

export interface RateioPlanoContaTituloReceber {
  id: number
  idPlanoContaGerencial: number
  valorRateio: number
  percentualRateio: number
  observacao?: string | null
}

export interface RateioCentroCustoTituloReceber {
  id: number
  idCentroCusto: number
  valorRateio: number
  percentualRateio: number
  observacao?: string | null
}

export interface ParcelaTituloReceber {
  id: number
  idTituloReceber: number
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

export interface MovimentoFinanceiroTituloReceber {
  id: number
  idParcelaTituloReceber: number
  dataMovimento: string
  valorMovimento: number
  tipoMovimento: TipoMovimento
  idConta: number
  observacao?: string | null
}

export interface TituloReceberKpis {
  totalAberto: number
  totalVencido: number
  totalAVencer30Dias: number
  totalRecebidoMes: number
  quantidadeAberto: number
  quantidadeVencido: number
}
