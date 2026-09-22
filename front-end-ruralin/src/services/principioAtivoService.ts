import api from './api'
import type { PrincipioAtivo } from '../types/PrincipioAtivo'

export interface PaginatedResult<T> {
  data: T[]
  page: number
  limit: number
  total: number
  totalPages: number
}

export const principioAtivoService = {
  getAll: async (page = 1, limit = 10) => {
    const { data } = await api.get<PaginatedResult<PrincipioAtivo>>('/principiosAtivo', {
      params: { page, limit }
    })
    return data
  },

  getById: async (id: number) => {
    const { data } = await api.get<PrincipioAtivo>(`/principiosAtivo/${id}`)
    return data
  },

  create: async (principio: PrincipioAtivo) => {
    const { data } = await api.post<PrincipioAtivo>('/principiosAtivo', principio)
    return data
  },

  update: async (id: number, principio: Partial<PrincipioAtivo>) => {
    const { data } = await api.put<PrincipioAtivo>(`/principiosAtivo/${id}`, principio)
    return data
  },

  delete: async (id: number) => {
    await api.delete(`/principiosAtivo/${id}`)
  }
}
