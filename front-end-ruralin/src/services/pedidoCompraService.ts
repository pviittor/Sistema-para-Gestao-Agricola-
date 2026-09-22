import api from './api'
import type { PedidoCompra, PedidoCompraCompletoDto } from '../types/PedidoCompra'

export interface PaginatedResult<T> {
  data: T[]
  page: number
  limit: number
  total: number
  totalPages: number
}

export const pedidoCompraService = {
  getAll: async (page = 1, limit = 10, filters?: any) => {
    const { data } = await api.get<PaginatedResult<PedidoCompra>>('/pedidosCompra', {
      params: { page, limit, ...filters }
    })
    return data
  },

  getById: async (id: number) => {
    const { data } = await api.get<PedidoCompra>(`/pedidosCompra/${id}`)
    return data
  },

  getItens: async (pedidoId: number) => {
    const { data } = await api.get<any[]>(`/itensPedidoCompra/por-pedido/${pedidoId}`)
    return data
  },

  createCompleto: async (pedido: PedidoCompraCompletoDto) => {
    const { data } = await api.post<PedidoCompra>('/pedidosCompra/completo', pedido)
    return data
  },

  updateCompleto: async (id: number, pedido: PedidoCompraCompletoDto) => {
    const { data } = await api.put<PedidoCompra>(`/pedidosCompra/${id}/completo`, pedido)
    return data
  },

  delete: async (id: number) => {
    await api.delete(`/pedidosCompra/${id}`)
  },

  aprovar: async (id: number) => {
    const { data } = await api.post(`/pedidosCompra/${id}/aprovar`)
    return data
  },

  cancelar: async (id: number, motivo: string) => {
    const { data } = await api.post(`/pedidosCompra/${id}/cancelar`, { motivo })
    return data
  },

  gerarFinanceiro: async (id: number) => {
    const { data } = await api.post(`/pedidosCompra/${id}/gerar-financeiro`)
    return data
  },
}
