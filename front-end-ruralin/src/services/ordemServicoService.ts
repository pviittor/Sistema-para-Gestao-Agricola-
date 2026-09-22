import api from './api'
import type {
  OrdemServico,
  CreateOrdemServicoCompletoPayload,
  AtribuirPayload,
  IniciarPayload,
  ConcluirPayload,
  ValidarPayload,
  CancelarPayload,
  OrdemServicoKPIs,
  CusteioTalhao,
  CusteioResumo,
  TimelineEntry,
  MapaCalorEntry,
  CargaTrabalho,
  HistoricoExecucao,
} from '@/types/OrdemServico'

interface BackendPaginatedResult<T> {
  data: T[]
  page: number
  total: number
  totalPages: number
}

interface OrdemServicoFilters {
  status?: string
  fazendaId?: number
  tipoAtividadeOSId?: number
  dataPlanejadaInicio?: string
  dataPlanejadaFim?: string
  prioridade?: string
  safraId?: number
}

export const ordemServicoService = {
  getAll: (page = 1, limit = 10, filters?: OrdemServicoFilters) =>
    api.get<BackendPaginatedResult<OrdemServico>>('/ordens-servico', {
      params: { page, limit, ...filters },
    }),
  getById: (id: number) => api.get<OrdemServico>(`/ordens-servico/${id}`),
  createCompleto: (data: CreateOrdemServicoCompletoPayload) =>
    api.post<OrdemServico>('/ordens-servico/completo', data),
  updateCompleto: (id: number, data: Partial<CreateOrdemServicoCompletoPayload>) =>
    api.put<OrdemServico>(`/ordens-servico/${id}/completo`, data),
  delete: (id: number) => api.delete(`/ordens-servico/${id}`),
  // Workflow
  atribuir: (id: number, data: AtribuirPayload) =>
    api.post<OrdemServico>(`/ordens-servico/${id}/atribuir`, data),
  iniciar: (id: number, data: IniciarPayload) =>
    api.post<OrdemServico>(`/ordens-servico/${id}/iniciar`, data),
  concluir: (id: number, data: ConcluirPayload) =>
    api.post<OrdemServico>(`/ordens-servico/${id}/concluir`, data),
  validar: (id: number, data: ValidarPayload) =>
    api.post<OrdemServico>(`/ordens-servico/${id}/validar`, data),
  cancelar: (id: number, data: CancelarPayload) =>
    api.post<OrdemServico>(`/ordens-servico/${id}/cancelar`, data),
  // KPIs
  getKpis: (filters?: {
    fazendaId?: number
    safraId?: number
    dataInicio?: string
    dataFim?: string
  }) => api.get<OrdemServicoKPIs>('/ordens-servico/kpis', { params: filters }),
  // Custeio
  getCusteio: (filters: {
    talhaoId?: number
    safraId?: number
    fazendaId?: number
    dataInicio?: string
    dataFim?: string
  }) => api.get<CusteioTalhao[]>('/ordens-servico/custeio', { params: filters }),
  getCusteioResumo: (filters: {
    safraId?: number
    fazendaId?: number
    dataInicio?: string
    dataFim?: string
  }) => api.get<CusteioResumo[]>('/ordens-servico/custeio/resumo', { params: filters }),
  // Dashboard
  getTimeline: (filters: {
    fazendaId?: number
    safraId?: number
    dataInicio: string
    dataFim: string
  }) => api.get<TimelineEntry[]>('/ordens-servico/timeline', { params: filters }),
  getMapaCalor: (filters: {
    fazendaId?: number
    safraId?: number
    status?: string
    dataInicio?: string
    dataFim?: string
  }) => api.get<MapaCalorEntry[]>('/ordens-servico/mapa-calor', { params: filters }),
  // Atribuição
  getCargaTrabalho: (filters: { semana?: string; fazendaId?: number }) =>
    api.get<CargaTrabalho[]>('/ordens-servico/carga-trabalho', { params: filters }),
  getHistoricoExecucao: (
    pessoaId: number,
    filters?: { tipoAtividadeOSId?: number; dataInicio?: string; dataFim?: string },
  ) =>
    api.get<HistoricoExecucao>(`/ordens-servico/historico-execucao/${pessoaId}`, {
      params: filters,
    }),
  // Analytics (Sprint 7)
  getProdutividadeOperador(filters: { fazendaId?: number; safraId?: number; dataInicio?: string; dataFim?: string; tipoAtividadeOSId?: number }) {
    return api.get('/ordens-servico/analytics/produtividade-operador', { params: filters })
  },
  getRendimentoMaquina(filters: { fazendaId?: number; safraId?: number; dataInicio?: string; dataFim?: string }) {
    return api.get('/ordens-servico/analytics/rendimento-maquina', { params: filters })
  },
  getCustoCategoria(filters: { fazendaId?: number; safraId?: number; dataInicio?: string; dataFim?: string }) {
    return api.get('/ordens-servico/analytics/custo-categoria', { params: filters })
  },
  getRankingTalhoes(filters: { fazendaId?: number; safraId?: number; dataInicio?: string; dataFim?: string }) {
    return api.get('/ordens-servico/analytics/ranking-talhoes', { params: filters })
  },
  getEvolucaoTemporal(filters: { fazendaId?: number; safraId?: number; agrupamento: 'semana' | 'mes'; dataInicio: string; dataFim: string }) {
    return api.get('/ordens-servico/analytics/evolucao-temporal', { params: filters })
  },
  getSync(since: string, limit?: number) {
    return api.get('/ordens-servico/sync', { params: { since, limit } })
  },
}
