import api from './api'
import type { TituloReceber, ParcelaTituloReceber, TituloReceberKpis, RateioPlanoContaTituloReceber, RateioCentroCustoTituloReceber } from '@/types/TituloReceber'
import type { BaixaParcelaDto, BaixaParcelaResponse } from '@/types/TituloPagar'

interface BackendPaginatedResult<T> {
  data: T[]
  page: number
  total: number
  totalPages: number
}

export const tituloReceberService = {
  getAll: async (page = 1, limit = 10, filtros?: Record<string, unknown>) => {
    const { data } = await api.get<BackendPaginatedResult<TituloReceber>>('/titulosReceber', {
      params: { page, limit, ...filtros },
    })
    return data
  },

  getBySafra: async (safraId: number, page = 1, limit = 10) => {
    const { data } = await api.get<BackendPaginatedResult<TituloReceber>>(`/titulosReceber/safra/${safraId}`, {
      params: { page, limit },
    })
    return data
  },

  getById: async (id: number) => {
    const { data } = await api.get<TituloReceber>(`/titulosReceber/${id}`)
    return data
  },

  create: async (dto: Record<string, unknown>) => {
    const { data } = await api.post<TituloReceber>('/titulosReceber/completo', dto)
    return data
  },

  update: async (id: number, dto: Record<string, unknown>) => {
    const { data } = await api.put<TituloReceber>(`/titulosReceber/${id}`, dto)
    return data
  },

  delete: async (id: number) => {
    await api.delete(`/titulosReceber/${id}`)
  },

  getParcelas: async (tituloId: number) => {
    const { data } = await api.get<TituloReceber>(`/titulosReceber/${tituloId}`)
    return { data: (data as any).parcelas || [] } as { data: ParcelaTituloReceber[] }
  },

  getKpis: async (filtros?: { idFazenda?: number; idSafra?: number }) => {
    const { data } = await api.get<TituloReceberKpis>('/titulosReceber/kpis', { params: filtros })
    return data
  },

  baixarParcela: async (dto: BaixaParcelaDto) => {
    const { data } = await api.post<{ success: boolean; data: BaixaParcelaResponse }>(
      `/parcelas/tituloReceber/${dto.idParcela}/baixar`,
      { dataBaixa: dto.dataBaixa, valorBaixa: dto.valorBaixa, observacao: dto.observacao }
    )
    return data
  },

  estornarBaixa: async (movimentoId: number) => {
    const { data } = await api.delete<{ success: boolean; data: ParcelaTituloReceber }>(
      `/parcelas/${movimentoId}/estornar`
    )
    return data
  },
}
