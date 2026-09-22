import api from './api'
import type { AlertaVencimentoConfig } from '@/types/RecorrenciaFinanceira'

export const alertaVencimentoConfigService = {
  findByUsuario: async () => {
    const { data } = await api.get<{ success: boolean; data: AlertaVencimentoConfig[] }>('/alertasVencimentoConfig')
    return data
  },

  create: async (dto: Partial<AlertaVencimentoConfig>) => {
    const { data } = await api.post<{ success: boolean; data: AlertaVencimentoConfig }>('/alertasVencimentoConfig', dto)
    return data
  },

  update: async (id: number, dto: Partial<AlertaVencimentoConfig>) => {
    const { data } = await api.put<{ success: boolean; data: AlertaVencimentoConfig }>(`/alertasVencimentoConfig/${id}`, dto)
    return data
  },

  delete: async (id: number) => {
    await api.delete(`/alertasVencimentoConfig/${id}`)
  },
}
