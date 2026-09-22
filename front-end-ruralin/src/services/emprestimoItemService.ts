import api from './api'
import type { EmprestimoItem } from '../types/EmprestimoItem'

export interface PaginatedResult<T> {
  data: T[]
  page: number
  limit: number
  total: number
  totalPages: number
}

export const emprestimoItemService = {
  getAll: async (page = 1, limit = 50) => {
    const { data } = await api.get<PaginatedResult<EmprestimoItem>>('/emprestimoItens', {
      params: { page, limit },
    })
    return data
  },

  getById: async (id: number) => {
    const { data } = await api.get<EmprestimoItem>(`/emprestimoItens/${id}`)
    return data
  },

  create: async (item: Partial<EmprestimoItem>) => {
    const { data } = await api.post<EmprestimoItem>('/emprestimoItens', item)
    return data
  },

  update: async (id: number, item: Partial<EmprestimoItem>) => {
    const { data } = await api.put<EmprestimoItem>(`/emprestimoItens/${id}`, item)
    return data
  },

  delete: async (id: number) => {
    await api.delete(`/emprestimoItens/${id}`)
  },

  findByEmprestimo: async (emprestimoId: number) => {
    const { data } = await api.get<EmprestimoItem[]>(`/emprestimoItens/por-emprestimo/${emprestimoId}`)
    return data
  },
}
