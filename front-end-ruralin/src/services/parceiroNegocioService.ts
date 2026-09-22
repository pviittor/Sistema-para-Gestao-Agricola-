import api from './api'
import type { ParceiroNegocio } from '../types/ParceiroNegocio'

export interface PaginatedResult<T> {
  data: T[]
  page: number
  limit: number
  total: number
  totalPages: number
}

export const parceiroNegocioService = {
  getAll: async (page = 1, limit = 100) => {
    const { data } = await api.get<PaginatedResult<ParceiroNegocio>>('/pessoas', {
      params: { page, limit },
    })
    return data
  },

  getAllNoPagination: async () => {
    const { data } = await api.get<PaginatedResult<ParceiroNegocio>>('/pessoas')
    return data
  },

  getById: async (id: number) => {
    const { data } = await api.get<ParceiroNegocio>(`/pessoas/${id}`)
    return data
  },

  create: async (parceiro: ParceiroNegocio) => {
    const { data } = await api.post<ParceiroNegocio>('/pessoas', parceiro)
    return data
  },

  update: async (id: number, parceiro: Partial<ParceiroNegocio>) => {
    const { data } = await api.put<ParceiroNegocio>(`/pessoas/${id}`, parceiro)
    return data
  },

  delete: async (id: number) => {
    await api.delete(`/pessoas/${id}`)
  },
}
