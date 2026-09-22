import api from './api'
import type { Municipio } from '../types/Municipio'

export interface PaginatedResult<T> {
  success: boolean
  data: {
    data: T[]
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

export const municipioService = {
  getAll: async (page = 1, limit = 10) => {
    const { data } = await api.get<PaginatedResult<Municipio>>('/municipios', {
      params: { page, limit }
    })
    return data
  },

  getById: async (id: number) => {
    const { data } = await api.get<Municipio>(`/municipios/${id}`)
    return data
  },

  create: async (municipio: Municipio) => {
    const { data } = await api.post<Municipio>('/municipios', municipio)
    return data
  },

  update: async (id: number, municipio: Partial<Municipio>) => {
    const { data } = await api.put<Municipio>(`/municipios/${id}`, municipio)
    return data
  },

  delete: async (id: number) => {
    await api.delete(`/municipios/${id}`)
  }
}
