import api from './api'
import type { ProdutoBenfeitoria } from '../types/ProdutoBenfeitoria'

export interface PaginatedResult<T> {
  data: T[]
  page: number
  limit: number
  total: number
  totalPages: number
}

export const produtoBenfeitoriaService = {
  getAll: async (page = 1, limit = 10) => {
    const { data } = await api.get<PaginatedResult<ProdutoBenfeitoria>>('/produtosBenfeitoria', {
      params: { page, limit }
    })
    return data
  },

  getById: async (id: number) => {
    const { data } = await api.get<ProdutoBenfeitoria>(`/produtosBenfeitoria/${id}`)
    return data
  },

  create: async (produtoBenfeitoria: ProdutoBenfeitoria) => {
    const { data } = await api.post<ProdutoBenfeitoria>('/produtosBenfeitoria', produtoBenfeitoria)
    return data
  },

  update: async (id: number, produtoBenfeitoria: Partial<ProdutoBenfeitoria>) => {
    const { data } = await api.put<ProdutoBenfeitoria>(`/produtosBenfeitoria/${id}`, produtoBenfeitoria)
    return data
  },

  delete: async (id: number) => {
    await api.delete(`/produtosBenfeitoria/${id}`)
  }
}
