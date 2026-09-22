import api from './api'
import type { Banco } from '../types/Banco'

export interface PaginatedResult<T> {
  data: T[]
  page: number
  limit: number
  total: number
  totalPages: number
}

export const bancoService = {
  getAll: async (page = 1, limit = 10) => {
    const { data } = await api.get<PaginatedResult<Banco>>('/listaBancos', {
      params: { page, limit },
    })
    return data
  },

  getAllNoPagination: async () => {
    const { data } = await api.get<PaginatedResult<Banco>>('/listaBancos')
    return data
  },

  getById: async (id: number) => {
    const { data } = await api.get<Banco>(`/listaBancos/${id}`)
    return data
  },

  create: async (banco: Omit<Banco, 'id'>) => {
    const { data } = await api.post<Banco>('/listaBancos', banco)
    return data
  },

  update: async (id: number, banco: Partial<Banco>) => {
    const { data } = await api.put<Banco>(`/listaBancos/${id}`, banco)
    return data
  },

  delete: async (id: number) => {
    await api.delete(`/listaBancos/${id}`)
  },
}
