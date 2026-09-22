import api from './api'
import type { AgingReport, AgingFiltros } from '@/types/Aging'

export const agingService = {
  getAging: async (filtros: AgingFiltros) => {
    const { data } = await api.get<{ success: boolean; data: AgingReport }>('/agingReports', {
      params: filtros,
    })
    return data
  },

  exportAging: async (filtros: AgingFiltros & { format: 'csv' | 'xlsx' | 'pdf' }) => {
    const response = await api.get('/agingReports/export', {
      params: filtros,
      responseType: 'blob',
    })
    return response.data as Blob
  },
}
