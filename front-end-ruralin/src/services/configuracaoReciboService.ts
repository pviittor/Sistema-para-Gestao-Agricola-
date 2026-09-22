import api from './api'
import type {
  ConfiguracaoRecibo,
  CreateConfiguracaoReciboPayload,
  UpdateConfiguracaoReciboPayload,
} from '@/types/Recibo'

interface BackendPaginatedResult<T> {
  data: T[]
  page: number
  total: number
  totalPages: number
}

export const configuracaoReciboService = {
  getAll: async (page = 1, limit = 10) => {
    const { data } = await api.get<BackendPaginatedResult<ConfiguracaoRecibo>>('/configuracao-recibos', {
      params: { page, limit },
    })
    return data
  },

  getById: async (id: number) => {
    const { data } = await api.get<ConfiguracaoRecibo>(`/configuracao-recibos/${id}`)
    return data
  },

  create: async (payload: CreateConfiguracaoReciboPayload) => {
    const { data } = await api.post<ConfiguracaoRecibo>('/configuracao-recibos', payload)
    return data
  },

  update: async (id: number, payload: UpdateConfiguracaoReciboPayload) => {
    const { data } = await api.put<ConfiguracaoRecibo>(`/configuracao-recibos/${id}`, payload)
    return data
  },

  delete: async (id: number) => {
    await api.delete(`/configuracao-recibos/${id}`)
  },

  getMinhaConfig: async () => {
    const { data } = await api.get<ConfiguracaoRecibo>('/configuracao-recibos/minha-config')
    return data
  },
}
