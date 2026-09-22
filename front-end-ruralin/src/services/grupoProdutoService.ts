import api from './api'
import type { GrupoProduto } from '../types/GrupoProduto'

export interface PaginatedResult<T> {
  data: T[]
  page: number
  limit: number
  total: number
  totalPages: number
}

export const grupoProdutoService = {
  getAll: async (page = 1, limit = 10) => {
    const { data } = await api.get<PaginatedResult<GrupoProduto>>('/gruposProduto', {
      params: { page, limit }
    })
    return data
  },

  getById: async (id: number) => {
    const { data } = await api.get<GrupoProduto>(`/gruposProduto/${id}`)
    return data
  },

  create: async (grupo: GrupoProduto) => {
    const { data } = await api.post<GrupoProduto>('/gruposProduto', grupo)
    return data
  },

  update: async (id: number, grupo: Partial<GrupoProduto>) => {
    const { data } = await api.put<GrupoProduto>(`/gruposProduto/${id}`, grupo)
    return data
  },

  delete: async (id: number) => {
    await api.delete(`/gruposProduto/${id}`)
  }
}
