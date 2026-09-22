import api from './api'
import type {
  TituloPagar,
  ParcelaTituloPagar,
  CreateTituloPagarDto,
  BaixaParcelaDto,
  BaixaParcelaResponse,
  TituloPagarKpis,
} from '@/types/TituloPagar'

interface BackendPaginatedResult<T> {
  data: T[]
  page: number
  total: number
  totalPages: number
}

export const tituloPagarService = {
  getAll: async (page = 1, limit = 10, filtros?: Record<string, unknown>) => {
    const { data } = await api.get<BackendPaginatedResult<TituloPagar>>('/titulosPagar', {
      params: { page, limit, ...filtros },
    })
    return data
  },

  getBySafra: async (safraId: number, page = 1, limit = 10) => {
    const { data } = await api.get<BackendPaginatedResult<TituloPagar>>(`/titulosPagar/safra/${safraId}`, {
      params: { page, limit },
    })
    return data
  },

  getById: async (id: number) => {
    const { data } = await api.get<TituloPagar>(`/titulosPagar/${id}`)
    return data
  },

  create: async (dto: CreateTituloPagarDto) => {
    const { data } = await api.post<{ success: boolean; data: TituloPagar }>('/titulosPagar/completo', dto)
    return data
  },

  update: async (id: number, dto: Partial<CreateTituloPagarDto>) => {
    const { data } = await api.put<{ success: boolean; data: TituloPagar }>(`/titulosPagar/${id}`, dto)
    return data
  },

  delete: async (id: number) => {
    await api.delete(`/titulosPagar/${id}`)
  },

  getParcelas: async (tituloId: number) => {
    // Parcelas vêm incluídas no getById via Sequelize include
    const { data } = await api.get<TituloPagar>(`/titulosPagar/${tituloId}`)
    return { data: (data as any).parcelas || [] } as { data: ParcelaTituloPagar[] }
  },

  getKpis: async (filtros?: { idFazenda?: number; idSafra?: number }) => {
    const { data } = await api.get<TituloPagarKpis>('/titulosPagar/kpis', {
      params: filtros,
    })
    return data
  },

  baixarParcela: async (dto: BaixaParcelaDto) => {
    const { data } = await api.post<{ success: boolean; data: BaixaParcelaResponse }>(
      `/parcelas/tituloPagar/${dto.idParcela}/baixar`,
      { dataBaixa: dto.dataBaixa, valorBaixa: dto.valorBaixa, observacao: dto.observacao }
    )
    return data
  },

  estornarBaixa: async (movimentoId: number) => {
    const { data } = await api.delete<{ success: boolean; data: ParcelaTituloPagar }>(
      `/parcelas/${movimentoId}/estornar`
    )
    return data
  },
}
