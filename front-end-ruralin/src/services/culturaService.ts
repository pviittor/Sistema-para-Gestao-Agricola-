import api from './api'
import type { Cultura } from '../types/Cultura'

export interface PaginatedResult<T> {
  data: T[]
  page: number
  limit: number
  total: number
  totalPages: number
}

export const culturaService = {
  getAll: async (page = 1, limit = 10) => {
    const { data } = await api.get<PaginatedResult<Cultura>>('/culturas', {
      params: { page, limit }
    })
    return data
  },

  getAllNoPagination: async () => {
    const { data } = await api.get<{ success: boolean; data: Cultura[] }>('/culturas/all')
    return data
  },

  getById: async (id: number) => {
    const { data } = await api.get<Cultura>(`/culturas/${id}`)
    return data
  },

  create: async (cultura: Cultura) => {
    const { data } = await api.post<Cultura>('/culturas', cultura)
    return data
  },

  update: async (id: number, cultura: Partial<Cultura>) => {
    const { data } = await api.put<Cultura>(`/culturas/${id}`, cultura)
    return data
  },

  delete: async (id: number) => {
    await api.delete(`/culturas/${id}`)
  }
}
