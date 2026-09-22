import api from './api'
import type { CentroCusto } from '../types/CentroCusto'

export interface PaginatedResult<T> {
  success: boolean
  data: {
    data: T[]
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

export const centroCustoService = {
  getAll: async (page = 1, limit = 10) => {
    const { data } = await api.get<PaginatedResult<CentroCusto>>('/centrosCusto', {
      params: { page, limit },
    })
    return data
  },

  getAllNoPagination: async () => {
    const { data } = await api.get<PaginatedResult<CentroCusto>>('/centrosCusto')
    return data
  },

  getById: async (id: number) => {
    const { data } = await api.get<CentroCusto>(`/centrosCusto/${id}`)
    return data
  },

  getByPaiId: async (id: number) => {
    const { data } = await api.get<CentroCusto>(`/centrosCusto/pai/${id}`)
    return data
  },

  create: async (centroCusto: CentroCusto) => {
    const { data } = await api.post<CentroCusto>('/centrosCusto', centroCusto)
    return data
  },

  update: async (id: number, centroCusto: Partial<CentroCusto>) => {
    const { data } = await api.put<CentroCusto>(`/centrosCusto/${id}`, centroCusto)
    return data
  },

  delete: async (id: number) => {
    await api.delete(`/centrosCusto/${id}`)
  },
}
