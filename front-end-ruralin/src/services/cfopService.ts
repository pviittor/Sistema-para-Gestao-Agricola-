import api from './api'
import type { Cfop } from '../types/Cfop'

interface BackendPaginatedResult<T> {
  data: T[]
  page: number
  limit: number
  total: number
  totalPages: number
}

export const cfopService = {
  getAll: async (page = 1, limit = 10) =>
    api.get<BackendPaginatedResult<Cfop>>('/cfops', { params: { page, limit } }),

  getAllNoPagination: async () => api.get<Cfop[]>('/cfops/all'),

  getById: async (id: number) => api.get<Cfop>(`/cfops/${id}`),

  create: async (cfop: Partial<Cfop>) => api.post<Cfop>('/cfops', cfop),

  update: async (id: number, cfop: Partial<Cfop>) => api.put<Cfop>(`/cfops/${id}`, cfop),

  delete: async (id: number) => api.delete(`/cfops/${id}`),
}
