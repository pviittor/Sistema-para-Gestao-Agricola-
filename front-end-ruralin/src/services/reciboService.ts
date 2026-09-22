import api from './api'
import type {
  Recibo,
  CreateReciboPayload,
  UpdateReciboPayload,
  CancelarReciboPayload,
  ReciboKpis,
  ReciboFiltros,
} from '@/types/Recibo'

interface BackendPaginatedResult<T> {
  data: T[]
  page: number
  total: number
  totalPages: number
}

export const reciboService = {
  getAll: async (page = 1, limit = 10, filtros?: ReciboFiltros) => {
    const { data } = await api.get<BackendPaginatedResult<Recibo>>('/recibos', {
      params: { page, limit, ...filtros },
    })
    return data
  },

  getById: async (id: number) => {
    const { data } = await api.get<Recibo>(`/recibos/${id}`)
    return data
  },

  create: async (payload: CreateReciboPayload) => {
    const { data } = await api.post<Recibo>('/recibos', payload)
    return data
  },

  update: async (id: number, payload: UpdateReciboPayload) => {
    const { data } = await api.put<Recibo>(`/recibos/${id}`, payload)
    return data
  },

  delete: async (id: number) => {
    await api.delete(`/recibos/${id}`)
  },

  cancelar: async (id: number, payload: CancelarReciboPayload) => {
    const { data } = await api.post<Recibo>(`/recibos/${id}/cancelar`, payload)
    return data
  },

  getKpis: async (filtros?: { dataInicio?: string; dataFim?: string }) => {
    const { data } = await api.get<ReciboKpis>('/recibos/kpis', {
      params: filtros,
    })
    return data
  },

  prePreencherDeParcela: async (parcelaId: number, tipoParcela: string) => {
    const { data } = await api.get<Partial<CreateReciboPayload>>('/recibos/pre-preencher', {
      params: { parcelaId, tipoParcela },
    })
    return data
  },

  downloadPdf: async (id: number): Promise<Blob> => {
    const { data } = await api.get<Blob>(`/recibos/${id}/pdf`, {
      responseType: 'blob',
    })
    return data
  },

  exportarLote: async (ids: number[]): Promise<Blob> => {
    const { data } = await api.post<Blob>('/recibos/exportar-lote', { ids }, {
      responseType: 'blob',
    })
    return data
  },
}
