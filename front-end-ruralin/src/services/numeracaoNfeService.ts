import api from './api'
import type { NumeracaoNfe, CreateNumeracaoNfe, UpdateNumeracaoNfe } from '@/types/NumeracaoNfe'

export interface PaginatedResult<T> {
  data: T[]
  page: number
  limit: number
  total: number
  totalPages: number
}

export const numeracaoNfeService = {
  getAll: async (page = 1, limit = 100) => {
    const { data } = await api.get<PaginatedResult<NumeracaoNfe>>('/numeracoesNfe', {
      params: { page, limit },
    })
    return data
  },

  getById: async (id: number) => {
    const { data } = await api.get<NumeracaoNfe>(`/numeracoesNfe/${id}`)
    return data
  },

  create: async (payload: CreateNumeracaoNfe) => {
    const { data } = await api.post<NumeracaoNfe>('/numeracoesNfe', payload)
    return data
  },

  update: async (id: number, payload: UpdateNumeracaoNfe) => {
    const { data } = await api.put<NumeracaoNfe>(`/numeracoesNfe/${id}`, payload)
    return data
  },

  delete: async (id: number) => {
    await api.delete(`/numeracoesNfe/${id}`)
  },

  getProximoNumero: async (serie: string, modelo: string) => {
    const { data } = await api.get<number>(`/numeracoesNfe/proximo`, {
      params: { serie, modelo },
    })
    return data
  },
}
