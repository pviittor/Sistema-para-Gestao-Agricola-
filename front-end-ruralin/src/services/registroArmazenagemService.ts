import api from './api'
import type { RegistroArmazenagem } from '../types/RegistroArmazenagem'

export interface PaginatedResult<T> {
  data: T[]
  page: number
  limit: number
  total: number
  totalPages: number
}

export const registroArmazenagemService = {
  getAll: async (page = 1, limit = 10) => {
    const { data } = await api.get<PaginatedResult<RegistroArmazenagem>>('/registrosArmazenagem', {
      params: { page, limit },
    })
    return data
  },

  getById: async (id: number) => {
    const { data } = await api.get<RegistroArmazenagem>(`/registrosArmazenagem/${id}`)
    return data
  },

  getByUnidadeDeposito: async (idUnidadeDeposito: number) => {
    const { data } = await api.get<RegistroArmazenagem[]>(`/registrosArmazenagem/unidade-deposito/${idUnidadeDeposito}`)
    return data
  },

  getByPeriodo: async (dataInicio: string, dataFim: string) => {
    const { data } = await api.get<RegistroArmazenagem[]>('/registrosArmazenagem/periodo', {
      params: { dataInicio, dataFim },
    })
    return data
  },

  getByProduto: async (idProduto: number) => {
    const { data } = await api.get<RegistroArmazenagem[]>(`/registrosArmazenagem/produto/${idProduto}`)
    return data
  },

  getSaldoByUnidade: async (idUnidadeDeposito: number) => {
    const { data } = await api.get<{ saldo: number }>(`/registrosArmazenagem/saldo/${idUnidadeDeposito}`)
    return data
  },

  create: async (registro: Omit<RegistroArmazenagem, 'id' | 'tenantId' | 'usercreation' | 'datecreation' | 'desconto_total' | 'produto' | 'unidadeMedida' | 'origem' | 'unidadeDeposito' | 'motorista' | 'usuario'>) => {
    const { data } = await api.post<RegistroArmazenagem>('/registrosArmazenagem', registro)
    return data
  },

  update: async (id: number, registro: Partial<Omit<RegistroArmazenagem, 'id' | 'tenantId' | 'usercreation' | 'datecreation' | 'desconto_total' | 'produto' | 'unidadeMedida' | 'origem' | 'unidadeDeposito' | 'motorista' | 'usuario'>>) => {
    const { data } = await api.put<RegistroArmazenagem>(`/registrosArmazenagem/${id}`, registro)
    return data
  },

  delete: async (id: number) => {
    await api.delete(`/registrosArmazenagem/${id}`)
  },
}
