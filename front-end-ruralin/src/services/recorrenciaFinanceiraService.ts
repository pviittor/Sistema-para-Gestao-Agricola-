import api from './api'
import type { RecorrenciaFinanceira, LancamentoRecorrente, PreviewGeracao } from '@/types/RecorrenciaFinanceira'

interface BackendPaginatedResult<T> {
  data: T[]
  page: number
  total: number
  totalPages: number
}

export const recorrenciaFinanceiraService = {
  getAll: async (page = 1, limit = 10, filtros?: Record<string, unknown>) => {
    const { data } = await api.get<BackendPaginatedResult<RecorrenciaFinanceira>>('/recorrenciasFinanceiras', {
      params: { page, limit, ...filtros },
    })
    return data
  },

  getKpis: async () => {
    const { data } = await api.get<any>('/recorrenciasFinanceiras/kpis')
    return data
  },

  getById: async (id: number) => {
    const { data } = await api.get<{ success: boolean; data: RecorrenciaFinanceira }>(`/recorrenciasFinanceiras/${id}`)
    return data
  },

  create: async (dto: Partial<RecorrenciaFinanceira>) => {
    const { data } = await api.post<{ success: boolean; data: RecorrenciaFinanceira }>('/recorrenciasFinanceiras', dto)
    return data
  },

  update: async (id: number, dto: Partial<RecorrenciaFinanceira>) => {
    const { data } = await api.put<{ success: boolean; data: RecorrenciaFinanceira }>(`/recorrenciasFinanceiras/${id}`, dto)
    return data
  },

  delete: async (id: number) => {
    await api.delete(`/recorrenciasFinanceiras/${id}`)
  },

  toggleAtiva: async (id: number) => {
    const { data } = await api.patch<{ success: boolean; data: { ativa: boolean } }>(`/recorrenciasFinanceiras/${id}/toggle-ativa`)
    return data
  },

  getLancamentos: async (id: number, page = 1, limit = 10) => {
    const { data } = await api.get<BackendPaginatedResult<LancamentoRecorrente>>(`/recorrenciasFinanceiras/${id}/lancamentos`, {
      params: { page, limit },
    })
    return data
  },

  gerarAgora: async (id: number) => {
    const { data } = await api.post<{ success: boolean; data: LancamentoRecorrente }>(`/recorrenciasFinanceiras/${id}/gerar-agora`)
    return data
  },

  preview: async (dto: Partial<RecorrenciaFinanceira>, count = 6) => {
    const { data } = await api.post<{ success: boolean; data: PreviewGeracao[] }>('/recorrenciasFinanceiras/preview', { ...dto, count })
    return data
  },
}
