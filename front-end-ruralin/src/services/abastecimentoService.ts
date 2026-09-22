import api from './api'
import type { Abastecimento } from '../types/Abastecimento'


export interface PaginatedResult<T> {
  data: T[]
  page: number
  limit: number
  total: number
  totalPages: number
}

export const abastecimentoService = {
  getAll: async (page = 1, limit = 10) => {
    const { data } = await api.get<PaginatedResult<Abastecimento>>('/abastecimentos', {
      params: { page, limit },
    })
    return data
  },

  getById: async (id: number) => {
    const { data } = await api.get<Abastecimento>(`/abastecimentos/${id}`)
    return data
  },

  getByMaquina: async (idMaquina: number) => {
    const { data } = await api.get<Abastecimento[]>(`/abastecimentos/maquina/${idMaquina}`)
    return data
  },

  getByPeriodo: async (dataInicio: string, dataFim: string) => {
    const { data } = await api.get<PaginatedResult<Abastecimento>>('/abastecimentos/periodo', {
      params: { dataInicio, dataFim },
    })
    return data
  },

  create: async (abastecimento: Abastecimento) => {
    const { data } = await api.post<Abastecimento>('/abastecimentos', abastecimento)
    return data
  },

  update: async (id: number, abastecimento: Partial<Abastecimento>) => {
    const { data } = await api.put<Abastecimento>(`/abastecimentos/${id}`, abastecimento)
    return data
  },

  delete: async (id: number) => {
    await api.delete(`/abastecimentos/${id}`)
  },
}
