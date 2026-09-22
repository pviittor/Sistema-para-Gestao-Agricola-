import api from './api'
import type { OutraDespesaReceita, CreateOutraDespesaReceitaDto, UpdateOutraDespesaReceitaDto } from '../types/OutraDespesaReceita'

export interface PaginatedResult<T> {
  data: T[]
  page: number
  limit: number
  total: number
  totalPages: number
}

export interface OutraDespesaReceitaFilters {
  planoGerencialId?: number
  dataInicio?: string
  dataFim?: string
  configuradorCicloId?: number
  cultura?: string
}

export const outraDespesaReceitaService = {
  getAll: async (page = 1, limit = 100) => {
    const { data } = await api.get<PaginatedResult<OutraDespesaReceita>>('/outrasDespesasReceitas', {
      params: { page, limit },
    })
    return data
  },

  getById: async (id: number) => {
    const { data } = await api.get<OutraDespesaReceita>(`/outrasDespesasReceitas/${id}`)
    return data
  },

  create: async (dto: CreateOutraDespesaReceitaDto) => {
    const { data } = await api.post<OutraDespesaReceita>('/outrasDespesasReceitas', dto)
    return data
  },

  update: async (id: number, dto: UpdateOutraDespesaReceitaDto) => {
    const { data } = await api.put<OutraDespesaReceita>(`/outrasDespesasReceitas/${id}`, dto)
    return data
  },

  delete: async (id: number) => {
    await api.delete(`/outrasDespesasReceitas/${id}`)
  },

  findByFilters: async (params: OutraDespesaReceitaFilters) => {
    const { data } = await api.get<OutraDespesaReceita[]>('/outrasDespesasReceitas/por-filtros', {
      params: {
        ...(params.planoGerencialId && { planoGerencialId: params.planoGerencialId }),
        ...(params.dataInicio && { dataInicio: params.dataInicio }),
        ...(params.dataFim && { dataFim: params.dataFim }),
        ...(params.configuradorCicloId && { configuradorCicloId: params.configuradorCicloId }),
        ...(params.cultura && { cultura: params.cultura }),
      },
    })
    return data
  },

  findByCultura: async (cultura: string) => {
    const { data } = await api.get<OutraDespesaReceita[]>('/outrasDespesasReceitas/por-cultura', {
      params: { cultura },
    })
    return data
  },
}
