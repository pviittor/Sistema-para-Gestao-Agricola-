import api from './api'
import type { TipoAtividadeOS, CreateTipoAtividadeOSPayload } from '@/types/TipoAtividadeOS'

interface BackendPaginatedResult<T> {
  data: T[]
  page: number
  total: number
  totalPages: number
}

export const tipoAtividadeOSService = {
  getAll: (page = 1, limit = 10) =>
    api.get<BackendPaginatedResult<TipoAtividadeOS>>('/tipos-atividade-os', {
      params: { page, limit },
    }),
  getAllNoPagination: () => api.get<TipoAtividadeOS[]>('/tipos-atividade-os/all'),
  getById: (id: number) => api.get<TipoAtividadeOS>(`/tipos-atividade-os/${id}`),
  createCompleto: (data: CreateTipoAtividadeOSPayload) =>
    api.post<TipoAtividadeOS>('/tipos-atividade-os/completo', data),
  updateCompleto: (id: number, data: Partial<CreateTipoAtividadeOSPayload>) =>
    api.put<TipoAtividadeOS>(`/tipos-atividade-os/${id}/completo`, data),
  delete: (id: number) => api.delete(`/tipos-atividade-os/${id}`),
}
