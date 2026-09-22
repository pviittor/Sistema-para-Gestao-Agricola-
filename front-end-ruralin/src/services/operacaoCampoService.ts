import api from './api'
import type { OperacaoCampo } from '../types/OperacaoCampo'

export interface PaginatedResult<T> {
  data: T[]
  page: number
  limit: number
  total: number
  totalPages: number
}

export const operacaoCampoService = {
  getAll: async (page = 1, limit = 10) => {
    const { data } = await api.get<PaginatedResult<OperacaoCampo>>('/operacoescampo', {
      params: { page, limit }
    })
    return data
  },

  getById: async (id: number) => {
    const { data } = await api.get<OperacaoCampo>(`/operacoescampo/${id}`)
    return data
  },

  create: async (operacao: OperacaoCampo) => {
    const { data } = await api.post<OperacaoCampo>('/operacoescampo', operacao)
    return data
  },

  update: async (id: number, operacao: Partial<OperacaoCampo>) => {
    const { data } = await api.put<OperacaoCampo>(`/operacoescampo/${id}`, operacao)
    return data
  },

  delete: async (id: number) => {
    await api.delete(`/operacoescampo/${id}`)
  }
}
