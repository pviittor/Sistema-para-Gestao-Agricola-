import api from './api'
import type { Safra } from '../types/Safra'

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

export const safraService = {
  getAll: async (page = 1, limit = 10) => {
    const { data } = await api.get<PaginatedResult<Safra>>('/safras', {
      params: { page, limit }
    })
    return data
  },

  getAllNoPagination: async () => {
    const { data } = await api.get<{ success: boolean; data: Safra[] }>('/safras/all')
    return data
  },

  getById: async (id: number) => {
    const { data } = await api.get<Safra>(`/safras/${id}`)
    return data
  },

  create: async (safra: Safra) => {
    const { data } = await api.post<Safra>('/safras', safra)
    return data
  },

  update: async (id: number, safra: Partial<Safra>) => {
    const { data } = await api.put<Safra>(`/safras/${id}`, safra)
    return data
  },

  delete: async (id: number) => {
    await api.delete(`/safras/${id}`)
  }
}
