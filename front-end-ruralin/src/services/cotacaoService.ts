import api from './api'
import type { Cotacao, CreateCotacaoCompleto } from '../types/Cotacao'

export interface BackendPaginatedResult<T> {
  data: T[]
  page: number
  limit: number
  total: number
  totalPages: number
}

export const cotacaoService = {
  getAll: async (page = 1, limit = 100) => {
    const { data } = await api.get<BackendPaginatedResult<Cotacao>>('/cotacoes', {
      params: { page, limit },
    })
    return data
  },

  getById: async (id: number) => {
    const { data } = await api.get<Cotacao>(`/cotacoes/${id}`)
    return data
  },

  create: async (cotacao: Partial<Cotacao>) => {
    const { data } = await api.post<Cotacao>('/cotacoes', cotacao)
    return data
  },

  createCompleto: async (cotacao: CreateCotacaoCompleto) => {
    const { data } = await api.post<Cotacao>('/cotacoes/completo', cotacao)
    return data
  },

  update: async (id: number, cotacao: Partial<Cotacao>) => {
    const { data } = await api.put<Cotacao>(`/cotacoes/${id}`, cotacao)
    return data
  },

  updateCompleto: async (id: number, cotacao: any) => {
    const { data } = await api.put<Cotacao>(`/cotacoes/${id}/completo`, cotacao)
    return data
  },

  delete: async (id: number) => {
    await api.delete(`/cotacoes/${id}`)
  },

  getByPedidoCompra: async (pedidoCompraId: number) => {
    const { data } = await api.get<Cotacao[]>(
      `/cotacoes/por-pedido-compra/${pedidoCompraId}`
    )
    return data
  },

  getRanking: async (pedidoCompraId: number) => {
    const { data } = await api.get<Cotacao[]>(
      `/cotacoes/por-pedido-compra/${pedidoCompraId}/ranking`
    )
    return data
  },

  selecionarVencedora: async (cotacaoId: number) => {
    const { data } = await api.post<Cotacao>(`/cotacoes/${cotacaoId}/selecionar`, {})
    return data
  },
}
