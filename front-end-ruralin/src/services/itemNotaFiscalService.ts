import api from './api'
import type { ItemNotaFiscal } from '../types/ItemNotaFiscal'

export interface PaginatedResult<T> {
  data: T[]
  page: number
  limit: number
  total: number
  totalPages: number
}

export const itemNotaFiscalService = {
  getAll: async (page = 1, limit = 50) => {
    const { data } = await api.get<PaginatedResult<ItemNotaFiscal>>('/itensNotaFiscal', {
      params: { page, limit },
    })
    return data
  },

  getById: async (id: number) => {
    const { data } = await api.get<ItemNotaFiscal>(`/itensNotaFiscal/${id}`)
    return data
  },

  getByNotaFiscal: async (notaFiscalId: number) => {
    const { data } = await api.get<ItemNotaFiscal[]>(
      `/itensNotaFiscal/nota-fiscal/${notaFiscalId}`,
    )
    return data
  },

  create: async (item: Partial<ItemNotaFiscal>) => {
    const { data } = await api.post<ItemNotaFiscal>('/itensNotaFiscal', item)
    return data
  },

  update: async (id: number, item: Partial<ItemNotaFiscal>) => {
    const { data } = await api.put<ItemNotaFiscal>(`/itensNotaFiscal/${id}`, item)
    return data
  },

  delete: async (id: number) => {
    await api.delete(`/itensNotaFiscal/${id}`)
  },
}
