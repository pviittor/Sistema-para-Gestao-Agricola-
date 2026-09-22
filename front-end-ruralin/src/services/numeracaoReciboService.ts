import api from './api'
import type {
  NumeracaoRecibo,
  CreateNumeracaoReciboPayload,
  UpdateNumeracaoReciboPayload,
} from '@/types/Recibo'

interface BackendPaginatedResult<T> {
  data: T[]
  page: number
  total: number
  totalPages: number
}

export const numeracaoReciboService = {
  getAll: async (page = 1, limit = 10) => {
    const { data } = await api.get<BackendPaginatedResult<NumeracaoRecibo>>('/numeracao-recibos', {
      params: { page, limit },
    })
    return data
  },

  getById: async (id: number) => {
    const { data } = await api.get<NumeracaoRecibo>(`/numeracao-recibos/${id}`)
    return data
  },

  create: async (payload: CreateNumeracaoReciboPayload) => {
    const { data } = await api.post<NumeracaoRecibo>('/numeracao-recibos', payload)
    return data
  },

  update: async (id: number, payload: UpdateNumeracaoReciboPayload) => {
    const { data } = await api.put<NumeracaoRecibo>(`/numeracao-recibos/${id}`, payload)
    return data
  },

  delete: async (id: number) => {
    await api.delete(`/numeracao-recibos/${id}`)
  },
}
