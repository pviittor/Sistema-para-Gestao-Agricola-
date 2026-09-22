import api from './api'
import type { Benfeitoria } from '../types/Benfeitoria'

export interface PaginatedResult<T> {
  data: T[]
  page: number
  limit: number
  total: number
  totalPages: number
}

export const benfeitoriaService = {
  getAll: async (page = 1, limit = 10) => {
    const { data } = await api.get<PaginatedResult<Benfeitoria>>('/benfeitorias', {
      params: { page, limit }
    })
    return data
  },

  getById: async (id: number) => {
    const { data } = await api.get<Benfeitoria>(`/benfeitorias/${id}`)
    return data
  },

  create: async (benfeitoria: Benfeitoria) => {
    const { data } = await api.post<Benfeitoria>('/benfeitorias', benfeitoria)
    return data
  },

  update: async (id: number, benfeitoria: Partial<Benfeitoria>) => {
    const { data } = await api.put<Benfeitoria>(`/benfeitorias/${id}`, benfeitoria)
    return data
  },

  delete: async (id: number) => {
    await api.delete(`/benfeitorias/${id}`)
  }
}
