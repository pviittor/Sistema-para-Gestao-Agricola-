import api from './api'
import type { EmprestimoItemDevolucao } from '../types/EmprestimoItemDevolucao'

export interface PaginatedResult<T> {
  data: T[]
  page: number
  limit: number
  total: number
  totalPages: number
}

export const emprestimoItemDevolucaoService = {
  getAll: async (page = 1, limit = 50) => {
    const { data } = await api.get<PaginatedResult<EmprestimoItemDevolucao>>(
      '/emprestimoItensDevolucao',
      { params: { page, limit } },
    )
    return data
  },

  getById: async (id: number) => {
    const { data } = await api.get<EmprestimoItemDevolucao>(`/emprestimoItensDevolucao/${id}`)
    return data
  },

  create: async (devolucao: Partial<EmprestimoItemDevolucao>) => {
    const { data } = await api.post<EmprestimoItemDevolucao>('/emprestimoItensDevolucao', devolucao)
    return data
  },

  update: async (id: number, devolucao: Partial<EmprestimoItemDevolucao>) => {
    const { data } = await api.put<EmprestimoItemDevolucao>(
      `/emprestimoItensDevolucao/${id}`,
      devolucao,
    )
    return data
  },

  delete: async (id: number) => {
    await api.delete(`/emprestimoItensDevolucao/${id}`)
  },

  findByItem: async (itemId: number) => {
    const { data } = await api.get<EmprestimoItemDevolucao[]>(
      `/emprestimoItensDevolucao/por-item/${itemId}`,
    )
    return data
  },
}
