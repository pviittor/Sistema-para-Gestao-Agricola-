import api from './api'
import type { Moeda } from '../types/Moeda'

export interface PaginatedResult<T> {
  data: T[]
  page: number
  limit: number
  total: number
  totalPages: number
}

export const moedaService = {
  getAll: async (page = 1, limit = 10) => {
    const { data } = await api.get<PaginatedResult<Moeda>>('/moedas', {
      params: { page, limit }
    })
    return data
  },

  getById: async (id: number) => {
    const { data } = await api.get<Moeda>(`/moedas/${id}`)
    return data
  },

  create: async (moeda: Moeda) => {
    const { data } = await api.post<Moeda>('/moedas', moeda)
    return data
  },

  update: async (id: number, moeda: Partial<Moeda>) => {
    const { data } = await api.put<Moeda>(`/moedas/${id}`, moeda)
    return data
  },

  delete: async (id: number) => {
    await api.delete(`/moedas/${id}`)
  }
}
