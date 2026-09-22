import api from './api'
import type {
  FluxoCaixaConsolidadoDto,
  FluxoCaixaConfiguracaoDto,
  UpdateFluxoCaixaConfiguracaoDto,
  FluxoCaixaSimulacaoDto,
  FluxoCaixaSimulacaoDetailDto,
  FluxoCaixaSimulacaoItemDto,
  FluxoCaixaEntryDto,
  FluxoCaixaSaldoContaDto,
  FluxoCaixaAlertaDto,
  FluxoCaixaFiltros,
  CreateFluxoCaixaSimulacaoDto,
  CreateFluxoCaixaSimulacaoCompletoDto,
  CreateFluxoCaixaSimulacaoItemDto,
} from '../types/FluxoCaixa'

// ========================================
// Fluxo de Caixa — Cálculos (Format B — Unwrapped)
// ========================================

export const fluxoCaixaService = {
  // Consolidado (realizado + projetado)
  getConsolidado: async (filtros: FluxoCaixaFiltros) => {
    const { data } = await api.get<FluxoCaixaConsolidadoDto>('/fluxo-caixa/consolidado', {
      params: {
        dataInicio: filtros.dataInicio,
        dataFim: filtros.dataFim,
        periodicidade: filtros.periodicidade,
        ...(filtros.contaBancariaIds.length > 0 && {
          contaBancariaIds: filtros.contaBancariaIds.join(','),
        }),
        ...(filtros.idSafra && { idSafra: filtros.idSafra }),
      },
    })
    return data
  },

  // Apenas realizado
  getRealizado: async (filtros: FluxoCaixaFiltros) => {
    const { data } = await api.get<FluxoCaixaConsolidadoDto>('/fluxo-caixa/realizado', {
      params: {
        dataInicio: filtros.dataInicio,
        dataFim: filtros.dataFim,
        periodicidade: filtros.periodicidade,
        ...(filtros.contaBancariaIds.length > 0 && {
          contaBancariaIds: filtros.contaBancariaIds.join(','),
        }),
        ...(filtros.idSafra && { idSafra: filtros.idSafra }),
      },
    })
    return data
  },

  // Apenas projetado
  getProjetado: async (filtros: FluxoCaixaFiltros) => {
    const { data } = await api.get<FluxoCaixaConsolidadoDto>('/fluxo-caixa/projetado', {
      params: {
        dataInicio: filtros.dataInicio,
        dataFim: filtros.dataFim,
        periodicidade: filtros.periodicidade,
        ...(filtros.contaBancariaIds.length > 0 && {
          contaBancariaIds: filtros.contaBancariaIds.join(','),
        }),
        ...(filtros.idSafra && { idSafra: filtros.idSafra }),
      },
    })
    return data
  },

  // Saldos por conta bancária
  getSaldosPorConta: async (filtros: FluxoCaixaFiltros) => {
    const { data } = await api.get<FluxoCaixaSaldoContaDto[]>('/fluxo-caixa/saldos-por-conta', {
      params: {
        dataInicio: filtros.dataInicio,
        dataFim: filtros.dataFim,
        periodicidade: filtros.periodicidade,
        ...(filtros.contaBancariaIds.length > 0 && {
          contaBancariaIds: filtros.contaBancariaIds.join(','),
        }),
        ...(filtros.idSafra && { idSafra: filtros.idSafra }),
      },
    })
    return data
  },

  // Alertas
  getAlertas: async (filtros: FluxoCaixaFiltros) => {
    const { data } = await api.get<FluxoCaixaAlertaDto[]>('/fluxo-caixa/alertas', {
      params: {
        dataInicio: filtros.dataInicio,
        dataFim: filtros.dataFim,
        periodicidade: filtros.periodicidade,
        ...(filtros.contaBancariaIds.length > 0 && {
          contaBancariaIds: filtros.contaBancariaIds.join(','),
        }),
        ...(filtros.idSafra && { idSafra: filtros.idSafra }),
      },
    })
    return data
  },

  // Autocomplete de lançamentos projetados
  autocompleteProjetados: async (dataInicio: string, dataFim: string, search?: string) => {
    const { data } = await api.get<FluxoCaixaEntryDto[]>('/fluxo-caixa/autocomplete-projetados', {
      params: { dataInicio, dataFim, ...(search && { search }) },
    })
    return data
  },

  // ========================================
  // Configuração do tenant
  // ========================================

  getConfiguracao: async () => {
    const { data } = await api.get<FluxoCaixaConfiguracaoDto>('/fluxo-caixa/configuracao')
    return data
  },

  salvarConfiguracao: async (dto: UpdateFluxoCaixaConfiguracaoDto) => {
    const { data } = await api.put<FluxoCaixaConfiguracaoDto>('/fluxo-caixa/configuracao', dto)
    return data
  },

  // ========================================
  // Simulações
  // ========================================

  listarSimulacoes: async () => {
    const { data } = await api.get<FluxoCaixaSimulacaoDto[]>('/fluxo-caixa/simulacoes')
    return data
  },

  getSimulacao: async (id: number) => {
    const { data } = await api.get<FluxoCaixaSimulacaoDetailDto>(`/fluxo-caixa/simulacoes/${id}`)
    return data
  },

  criarSimulacao: async (dto: CreateFluxoCaixaSimulacaoDto) => {
    const { data } = await api.post<FluxoCaixaSimulacaoDto>('/fluxo-caixa/simulacoes', dto)
    return data
  },

  criarSimulacaoCompleto: async (dto: CreateFluxoCaixaSimulacaoCompletoDto) => {
    const { data } = await api.post<FluxoCaixaSimulacaoDetailDto>(
      '/fluxo-caixa/simulacoes/completo',
      dto,
    )
    return data
  },

  atualizarSimulacao: async (id: number, dto: Partial<CreateFluxoCaixaSimulacaoDto>) => {
    const { data } = await api.put<FluxoCaixaSimulacaoDto>(`/fluxo-caixa/simulacoes/${id}`, dto)
    return data
  },

  deletarSimulacao: async (id: number) => {
    await api.delete(`/fluxo-caixa/simulacoes/${id}`)
  },

  calcularSimulacao: async (id: number, params?: { dataInicio: string; dataFim: string; periodicidade: string }) => {
    const { data } = await api.post<FluxoCaixaConsolidadoDto>(
      `/fluxo-caixa/simulacoes/${id}/calcular`,
      undefined,
      params ? { params } : undefined,
    )
    return data
  },

  // ========================================
  // Itens de simulação
  // ========================================

  adicionarItem: async (simulacaoId: number, dto: CreateFluxoCaixaSimulacaoItemDto) => {
    const { data } = await api.post<FluxoCaixaSimulacaoItemDto>(
      `/fluxo-caixa/simulacoes/${simulacaoId}/itens`,
      dto,
    )
    return data
  },

  atualizarItem: async (
    simulacaoId: number,
    itemId: number,
    dto: Partial<CreateFluxoCaixaSimulacaoItemDto>,
  ) => {
    const { data } = await api.put<FluxoCaixaSimulacaoItemDto>(
      `/fluxo-caixa/simulacoes/${simulacaoId}/itens/${itemId}`,
      dto,
    )
    return data
  },

  deletarItem: async (simulacaoId: number, itemId: number) => {
    await api.delete(`/fluxo-caixa/simulacoes/${simulacaoId}/itens/${itemId}`)
  },
}
