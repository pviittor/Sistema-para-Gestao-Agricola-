import api from './api'
import type { Propriedade } from '../types/Propriedade'

export interface PaginatedResult1<T> {
  success: boolean
  data: {
    data: T[]
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

export interface PaginatedResult2<T> {
  success: boolean
  data: T[]
}

export const propriedadeService = {
  getAll: async (page = 1, limit = 10) => {
    const { data } = await api.get<PaginatedResult1<Propriedade>>('/fazendas', {
      params: { page, limit }
    })
    return data
  },

  getAllNoPagination: async () => {
    const { data } = await api.get<PaginatedResult2<Propriedade>>('/fazendas/all')
    return data
  },

  getById: async (id: number) => {
    const { data } = await api.get<Propriedade>(`/fazendas/${id}`)
    return data
  },

  create: async (propriedade: Propriedade) => {
    const { data } = await api.post<Propriedade>('/fazendas', propriedade)
    return data
  },

  update: async (id: number, propriedade: Partial<Propriedade>) => {
    const { data } = await api.put<Propriedade>(`/fazendas/${id}`, propriedade)
    return data
  },

  delete: async (id: number) => {
    await api.delete(`/fazendas/${id}`)
  }
}
