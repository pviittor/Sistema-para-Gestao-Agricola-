import api from './api'
import type { ConfiguradorCiclo } from '../types/ConfiguradorCiclo'
import type { ConfiguradorCicloOption } from '../types/OutraDespesaReceita'

export interface PaginatedResult<T> {
  data: T[]
  page: number
  limit: number
  total: number
  totalPages: number
}

export const configuradorCicloService = {
  getAll: async (page = 1, limit = 100) => {
    const { data } = await api.get<PaginatedResult<ConfiguradorCicloOption>>('/configuradoresCiclo', {
      params: { page, limit },
    })
    return data
  },

  getById: async (id: number) => {
    const { data } = await api.get<ConfiguradorCicloOption>(`/configuradoresCiclo/${id}`)
    return data
  },

  getByFazendaAndSafra: async (fazendaId: number, safraId: number) => {
    const { data } = await api.get<{ success: boolean; data: ConfiguradorCiclo[] }>(
      `/configuradoresCiclo/fazenda/${fazendaId}/safra/${safraId}`
    )
    return data
  },

  create: async (dto: Partial<ConfiguradorCiclo>) => {
    const { data } = await api.post<ConfiguradorCiclo>('/configuradoresCiclo', dto)
    return data
  },

  update: async (id: number, dto: Partial<ConfiguradorCiclo>) => {
    const { data } = await api.put<ConfiguradorCiclo>(`/configuradoresCiclo/${id}`, dto)
    return data
  },

  delete: async (id: number) => {
    await api.delete(`/configuradoresCiclo/${id}`)
  },
}
