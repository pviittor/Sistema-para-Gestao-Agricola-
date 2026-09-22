import api from './api'
import type {
  Agreement,
  AgreementType,
  CreateAgreementCompletoDto,
  UpdateAgreementCompletoDto,
} from '../types/Agreement'

export interface PaginatedResult<T> {
  data: T[]
  page: number
  limit: number
  total: number
  totalPages: number
}

export const agreementService = {
  getAll: async (page = 1, limit = 10, filters?: Record<string, unknown>) => {
    const { data } = await api.get<PaginatedResult<Agreement>>('/agreements', {
      params: { page, limit, ...filters },
    })
    return data
  },

  getById: async (id: number) => {
    const { data } = await api.get<Agreement>(`/agreements/${id}`)
    return data
  },

  getByFazenda: async (fazendaId: number) => {
    const { data } = await api.get<PaginatedResult<Agreement>>(`/agreements/fazenda/${fazendaId}`, {
      params: { page: 1, limit: 1000 },
    })
    return data.data
  },

  getByType: async (type: AgreementType, fazendaId?: number) => {
    const { data } = await api.get<PaginatedResult<Agreement>>(`/agreements/tipo/${type}`, {
      params: { page: 1, limit: 1000, ...(fazendaId ? { fazendaId } : {}) },
    })
    return data.data
  },

  getByField: async (fieldId: number) => {
    const { data } = await api.get<Agreement[]>(`/agreements/talhao/${fieldId}`)
    return data
  },

  createCompleto: async (payload: CreateAgreementCompletoDto) => {
    const { data } = await api.post<Agreement>('/agreements/completo', payload)
    return data
  },

  updateCompleto: async (id: number, payload: UpdateAgreementCompletoDto) => {
    const { data } = await api.put<Agreement>(`/agreements/${id}/completo`, payload)
    return data
  },

  delete: async (id: number) => {
    await api.delete(`/agreements/${id}`)
  },
}
