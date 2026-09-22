import api from './api'
import type { ServicoAgricola } from '../types/ServicoAgricola'

export interface PaginatedResult<T> {
  data: T[]
  page: number
  limit: number
  total: number
  totalPages: number
}

export const servicoAgricolaService = {
  getAll: async (page = 1, limit = 10) => {
    const { data } = await api.get<PaginatedResult<ServicoAgricola>>('/servicosAgricola', {
      params: { page, limit }
    })
    return data
  },

  getById: async (id: number) => {
    const { data } = await api.get<ServicoAgricola>(`/servicosAgricola/${id}`)
    return data
  },

  create: async (servico: ServicoAgricola) => {
    const { data } = await api.post<ServicoAgricola>('/servicosAgricola', servico)
    return data
  },

  update: async (id: number, servico: Partial<ServicoAgricola>) => {
    const { data } = await api.put<ServicoAgricola>(`/servicosAgricola/${id}`, servico)
    return data
  },

  delete: async (id: number) => {
    await api.delete(`/servicosAgricola/${id}`)
  }
}
