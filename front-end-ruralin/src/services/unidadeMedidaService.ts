import api from './api'
import type { UnidadeMedida } from '../types/UnidadeMedida'

export interface PaginatedResult<T> {
  data: T[]
  page: number
  limit: number
  total: number
  totalPages: number
}

export const unidadeMedidaService = {
  getAll: async (page = 1, limit = 10) => {
    const { data } = await api.get<PaginatedResult<UnidadeMedida>>('/unidadesMedida', {
      params: { page, limit }
    })
    return data
  },

  getAllNoPagination: async () => {
    const { data } = await api.get<PaginatedResult<UnidadeMedida>>('/unidadesMedida')
    return data
  },

  getById: async (id: number) => {
    const { data } = await api.get<UnidadeMedida>(`/unidadesMedida/${id}`)
    return data
  },

  create: async (unidade: UnidadeMedida) => {
    const { data } = await api.post<UnidadeMedida>('/unidadesMedida', unidade)
    return data
  },

  update: async (id: number, unidade: Partial<UnidadeMedida>) => {
    const { data } = await api.put<UnidadeMedida>(`/unidadesMedida/${id}`, unidade)
    return data
  },

  delete: async (id: number) => {
    await api.delete(`/unidadesMedida/${id}`)
  }
}
