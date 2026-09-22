export enum StatusOrdemServico {
  PLANEJADA = 'PLANEJADA',
  ATRIBUIDA = 'ATRIBUIDA',
  EM_EXECUCAO = 'EM_EXECUCAO',
  CONCLUIDA = 'CONCLUIDA',
  VALIDADA = 'VALIDADA',
  CANCELADA = 'CANCELADA',
}

export enum PrioridadeOrdemServico {
  BAIXA = 'BAIXA',
  MEDIA = 'MEDIA',
  ALTA = 'ALTA',
  URGENTE = 'URGENTE',
}

export enum FuncaoResponsavelOS {
  RESPONSAVEL = 'RESPONSAVEL',
  OPERADOR = 'OPERADOR',
  AUXILIAR = 'AUXILIAR',
  FISCAL = 'FISCAL',
}

// Child interfaces
export interface OrdemServicoTalhao {
  id: number
  talhaoId: number
  talhao?: { descricao: string; areaTotalHa?: number }
  areaPlanejada: number | null
  areaReal: number | null
  percentualArea: number | null
  custoRateado: number | null
  observacoes: string | null
}

export interface OrdemServicoInsumo {
  id: number
  produtoId: number
  produto?: { descricao: string }
  unidadeMedidaId: number | null
  unidadeMedida?: { nome: string }
  quantidadePlanejada: number | null
  custoUnitarioPlanejado: number | null
  quantidadeReal: number | null
  custoUnitarioReal: number | null
  dosagem: number | null
  areaAplicada: number | null
  observacoes: string | null
}

export interface OrdemServicoMaquina {
  id: number
  maquinaId: number
  maquina?: { descricao: string }
  implementoId: number | null
  implemento?: { descricao: string }
  operadorId: number | null
  operador?: { nomerazao_pessoa: string }
  horasPlanejadas: number | null
  custoHoraPlanejado: number | null
  horasReais: number | null
  custoHoraReal: number | null
  horimetroInicio: number | null
  horimetroFim: number | null
  areaTrabalhada: number | null
  consumoCombustivel: number | null
  observacoes: string | null
}

export interface OrdemServicoResponsavel {
  id: number
  pessoaId: number
  pessoa?: { nomerazao_pessoa: string }
  funcao: FuncaoResponsavelOS
  horasPlanejadas: number | null
  custoHoraPlanejado: number | null
  horasReais: number | null
  custoHoraReal: number | null
  observacoes: string | null
}

// Main entity
export interface OrdemServico {
  id: number
  numero: number
  tipoAtividadeOSId: number
  tipoAtividade?: { id: number; nome: string; categoria: string; icone: string | null; cor: string | null }
  fazendaId: number
  fazenda?: { id: number; nome: string }
  safraId: number | null
  safra?: { id: number; nome: string }
  descricao: string | null
  status: StatusOrdemServico
  prioridade: PrioridadeOrdemServico
  dataPlanejadaInicio: string | null
  dataPlanejadaFim: string | null
  dataInicioReal: string | null
  dataFimReal: string | null
  areaPlanejadaTotal: number | null
  areaRealTotal: number | null
  custoEstimado: number | null
  custoReal: number | null
  varianciaAreaPercent: number | null
  varianciaCustoPercent: number | null
  varianciaDias: number | null
  camposCondicionais: Record<string, any> | null
  observacoes: string | null
  observacoesConclusao: string | null
  motivoCancelamento: string | null
  estoqueProcessado: boolean
  financeiroProcessado: boolean
  criadoPorId: number | null
  atribuidoPorId: number | null
  iniciadoPorId: number | null
  concluidoPorId: number | null
  validadoPorId: number | null
  canceladoPorId: number | null
  dataValidacao: string | null
  talhoes: OrdemServicoTalhao[]
  insumos: OrdemServicoInsumo[]
  maquinas: OrdemServicoMaquina[]
  responsaveis: OrdemServicoResponsavel[]
  createdAt: string
  updatedAt: string
}

// Create/Update payloads
export interface CreateOrdemServicoCompletoPayload {
  tipoAtividadeOSId: number
  fazendaId: number
  safraId?: number
  descricao?: string
  prioridade?: PrioridadeOrdemServico
  dataPlanejadaInicio?: string
  dataPlanejadaFim?: string
  custoEstimado?: number
  camposCondicionais?: Record<string, any>
  observacoes?: string
  talhoes?: Omit<OrdemServicoTalhao, 'id' | 'talhao'>[]
  insumos?: Omit<OrdemServicoInsumo, 'id' | 'produto' | 'unidadeMedida'>[]
  maquinas?: Omit<OrdemServicoMaquina, 'id' | 'maquina' | 'implemento' | 'operador'>[]
  responsaveis?: Omit<OrdemServicoResponsavel, 'id' | 'pessoa'>[]
}

// Workflow DTOs
export interface AtribuirPayload {
  responsaveis?: Omit<OrdemServicoResponsavel, 'id' | 'pessoa'>[]
}

export interface IniciarPayload {
  dataInicioReal?: string
}

export interface ConcluirPayload {
  dataFimReal: string
  observacoesConclusao?: string
  talhoes?: Omit<OrdemServicoTalhao, 'id' | 'talhao'>[]
  insumos?: Omit<OrdemServicoInsumo, 'id' | 'produto' | 'unidadeMedida'>[]
  maquinas?: Omit<OrdemServicoMaquina, 'id' | 'maquina' | 'implemento' | 'operador'>[]
  responsaveis?: Omit<OrdemServicoResponsavel, 'id' | 'pessoa'>[]
}

export interface ValidarPayload {
  observacoes?: string
}

export interface CancelarPayload {
  motivoCancelamento: string
}

// KPIs
export interface OrdemServicoKPIs {
  totalPorStatus: Record<StatusOrdemServico, number>
  totalAtrasadas: number
  custoTotalReal: number
  custoTotalEstimado: number
  totalOS: number
}

// === Sprint 6 — Custeio ===
export interface CusteioTalhao {
  talhaoId: number
  talhaoDescricao: string
  safraId: number
  safraNome: string
  totalOS: number
  custoRealTotal: number
  custoEstimadoTotal: number
  varianciaCustoPercent: number
  areaTotal: number
  custoPorHa: number
}

export interface CusteioResumo {
  safraId: number
  safraNome: string
  totalTalhoes: number
  custoTotal: number
  custoMedioHa: number
  areaTotal: number
}

// === Sprint 6 — Dashboard ===
export interface TimelineEntry {
  data: string
  totalPorStatus: Record<string, number>
  totalOS: number
}

export interface MapaCalorEntry {
  talhaoId: number
  talhaoDescricao: string
  totalOS: number
  totalConcluidas: number
  totalEmExecucao: number
  custoTotal: number
  areaTotal: number
}

// === Sprint 6 — Atribuição ===
export interface CargaTrabalho {
  pessoaId: number
  nomerazaoPessoa: string
  totalOSSemana: number
  horasPlanejadas: number
  horasReais: number
  osAtivas: number
}

export interface TipoAtividadeExecutado {
  tipoId: number
  tipoNome: string
  count: number
}

export interface HistoricoExecucao {
  pessoaId: number
  totalOS: number
  totalConcluidas: number
  totalValidadas: number
  mediaHorasPorOS: number
  tiposAtividadeExecutados: TipoAtividadeExecutado[]
}

// === Sprint 7 — Analytics ===
export interface ProdutividadeOperador {
  pessoaId: number
  nomerazaoPessoa: string
  totalOS: number
  totalConcluidas: number
  horasReaisTotal: number
  areaTrabalhadaTotal: number
  hasPorHora: number
  custoTotal: number
  mediaHorasPorOS: number
}

export interface RendimentoMaquina {
  maquinaId: number
  maquinaDescricao: string
  totalOS: number
  horasReaisTotal: number
  areaTrabalhadaTotal: number
  hasPorHora: number
  consumoCombustivelTotal: number
  litrosPorHa: number
  custoTotalHora: number
  custoPorHa: number
}

export interface CustoCategoria {
  categoria: string
  tipoAtividadeOSId: number
  tipoNome: string
  totalOS: number
  custoEstimadoTotal: number
  custoRealTotal: number
  varianciaCustoPercent: number
  custoMedioOS: number
}

export interface RankingTalhao {
  talhaoId: number
  talhaoDescricao: string
  totalOS: number
  custoRealTotal: number
  areaTotal: number
  custoPorHa: number
  custoEstimadoTotal: number
  varianciaPercent: number
}

export interface EvolucaoTemporal {
  periodo: string
  totalOS: number
  totalConcluidas: number
  totalCanceladas: number
  custoRealTotal: number
  areaTotal: number
}
