import api from './api'
import type { Estado } from '../types/Estado'

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

export const estadoService = {
  getAll: async (page = 1, limit = 100) => {
    const { data } = await api.get<PaginatedResult<Estado>>('/estados', {
      params: { page, limit },
    })
    return data
  },

  getById: async (id: number) => {
    const { data } = await api.get<Estado>(`/estados/${id}`)
    return data
  },

  create: async (estado: Estado) => {
    const { data } = await api.post<Estado>('/estados', estado)
    return data
  },

  update: async (id: number, estado: Partial<Estado>) => {
    const { data } = await api.put<Estado>(`/estados/${id}`, estado)
    return data
  },

  delete: async (id: number) => {
    await api.delete(`/estados/${id}`)
  },
}
