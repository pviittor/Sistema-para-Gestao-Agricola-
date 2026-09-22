import api from './api'
import type { Talhao } from '../types/Talhao'

export interface PaginatedResult<T> {
  data: T[]
  page: number
  limit: number
  total: number
  totalPages: number
}

export const talhaoService = {
  getAll: async (page = 1, limit = 10) => {
    const { data } = await api.get<PaginatedResult<Talhao>>('/talhoes', {
      params: { page, limit }
    })
    return data
  },

  getAllNoPagination: async () => {
    const { data } = await api.get<Talhao[]>('/talhoes/all')
    return data
  },

  getById: async (id: number) => {
    const { data } = await api.get<Talhao>(`/talhoes/${id}`)
    return data
  },

  create: async (talhao: Talhao) => {
    const { data } = await api.post<Talhao>('/talhoes', talhao)
    return data
  },

  update: async (id: number, talhao: Partial<Talhao>) => {
    const { data } = await api.put<Talhao>(`/talhoes/${id}`, talhao)
    return data
  },

  delete: async (id: number) => {
    await api.delete(`/talhoes/${id}`)
  },

  getByFazenda: async (fazendaId: number) => {
    const { data } = await api.get<Talhao[]>(`/talhoes/fazenda/${fazendaId}`)
    return data
  },

  getNdvi: async (talhaoId: number, startDate?: number, endDate?: number) => {
    const params: Record<string, number> = {}
    if (startDate) params.start = startDate
    if (endDate) params.end = endDate
    const { data } = await api.get(`/talhoes/${talhaoId}/ndvi`, { params })
    return data as {
      talhaoId: number
      polygonId?: string
      images: Array<{
        dt: number
        type: string
        cl: number
        image: {
          truecolor: string
          falsecolor: string
          ndvi: string
          evi: string
        }
        stats?: {
          min: number
          max: number
          mean: number
          median: number
        }
      }>
      provider: string
    }
  }
}
