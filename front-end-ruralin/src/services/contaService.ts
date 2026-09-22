import api from './api'
import type { Conta } from '../types/Conta'

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

export const contaService = {
  getAll: async (page = 1, limit = 10) => {
    const { data } = await api.get<PaginatedResult<Conta>>('/contas', {
      params: { page, limit },
    })
    return data
  },

  getAllNoPagination: async () => {
    const { data } = await api.get<Conta[]>('/contas/all')
    return data
  },

  getById: async (id: number) => {
    const { data } = await api.get<Conta>(`/contas/${id}`)
    return data
  },

  create: async (conta: Conta) => {
    const { data } = await api.post<Conta>('/contas', conta)
    return data
  },

  update: async (id: number, conta: Partial<Conta>) => {
    const { data } = await api.put<Conta>(`/contas/${id}`, conta)
    return data
  },

  delete: async (id: number) => {
    await api.delete(`/contas/${id}`)
  },
}
