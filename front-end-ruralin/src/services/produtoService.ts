import api from './api'
import type { Produto } from '../types/Produto'

export interface PaginatedResult<T> {
  data: T[]
  page: number
  limit: number
  total: number
  totalPages: number
}

export const produtoService = {
  getAll: async (page = 1, limit = 10) => {
    const { data } = await api.get<PaginatedResult<Produto>>('/produtos', {
      params: { page, limit }
    })
    return data
  },

  getAllNoPagination: async () => {
    const { data } = await api.get<{ success: boolean; data: Produto[] }>('/produtos/all')
    return data
  },

  getById: async (id: number) => {
    const { data } = await api.get<Produto>(`/produtos/${id}`)
    return data
  },

  getByGrupo: async (idGrupo: number) => {
    const { data } = await api.get<Produto[]>(`/produtos/grupo/${idGrupo}`)
    return data
  },

  getBySubGrupo: async (idSubGrupo: number) => {
    const { data } = await api.get<Produto[]>(`/produtos/subgrupo/${idSubGrupo}`)
    return data
  },

  create: async (produto: Produto) => {
    const { data } = await api.post<Produto>('/produtos', produto)
    return data
  },

  update: async (id: number, produto: Partial<Produto>) => {
    const { data } = await api.put<Produto>(`/produtos/${id}`, produto)
    return data
  },

  delete: async (id: number) => {
    await api.delete(`/produtos/${id}`)
  }
}
