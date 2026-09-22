import api from './api'
import type { UnidadeDeposito } from '../types/UnidadeDeposito'

export interface PaginatedResult<T> {
  data: T[]
  page: number
  limit: number
  total: number
  totalPages: number
}

export const unidadeDepositoService = {
  getAll: async (page = 1, limit = 10) => {
    const { data } = await api.get<PaginatedResult<UnidadeDeposito>>('/unidadesDeposito', {
      params: { page, limit },
    })
    return data
  },

  getById: async (id: number) => {
    const { data } = await api.get<UnidadeDeposito>(`/unidadesDeposito/${id}`)
    return data
  },

  getComSaldo: async () => {
    const { data } = await api.get<UnidadeDeposito[]>('/unidadesDeposito/com-saldo')
    return data
  },

  getByProduto: async (idProduto: number) => {
    const { data } = await api.get<UnidadeDeposito[]>(`/unidadesDeposito/produto/${idProduto}`)
    return data
  },

  create: async (unidadeDeposito: Omit<UnidadeDeposito, 'id' | 'tenantId' | 'usercreation' | 'datecreation' | 'unidadeMedida' | 'produto' | 'usuarioCriador' | 'saldoAtual' | 'percentualUtilizado'>) => {
    const { data } = await api.post<UnidadeDeposito>('/unidadesDeposito', unidadeDeposito)
    return data
  },

  update: async (id: number, unidadeDeposito: Partial<Omit<UnidadeDeposito, 'id' | 'tenantId' | 'usercreation' | 'datecreation' | 'unidadeMedida' | 'produto' | 'usuarioCriador' | 'saldoAtual' | 'percentualUtilizado'>>) => {
    const { data } = await api.put<UnidadeDeposito>(`/unidadesDeposito/${id}`, unidadeDeposito)
    return data
  },

  delete: async (id: number) => {
    await api.delete(`/unidadesDeposito/${id}`)
  },
}
