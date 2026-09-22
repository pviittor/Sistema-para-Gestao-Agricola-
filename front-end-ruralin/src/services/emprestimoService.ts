import api from './api'
import type { Emprestimo } from '../types/Emprestimo'

export interface PaginatedResult<T> {
  data: T[]
  page: number
  limit: number
  total: number
  totalPages: number
}

export const emprestimoService = {
  getAll: async (page = 1, limit = 100) => {
    const { data } = await api.get<PaginatedResult<Emprestimo>>('/emprestimos', {
      params: { page, limit },
    })
    return data
  },

  getById: async (id: number) => {
    const { data } = await api.get<Emprestimo>(`/emprestimos/${id}`)
    return data
  },

  create: async (emprestimo: Partial<Emprestimo>) => {
    const { data } = await api.post<Emprestimo>('/emprestimos', emprestimo)
    return data
  },

  update: async (id: number, emprestimo: Partial<Emprestimo>) => {
    const { data } = await api.put<Emprestimo>(`/emprestimos/${id}`, emprestimo)
    return data
  },

  delete: async (id: number) => {
    await api.delete(`/emprestimos/${id}`)
  },

  findByFazenda: async (fazendaId: number) => {
    const { data } = await api.get<Emprestimo[]>(`/emprestimos/por-fazenda/${fazendaId}`)
    return data
  },

  findByParceiro: async (parceiroId: number) => {
    const { data } = await api.get<Emprestimo[]>(`/emprestimos/por-parceiro/${parceiroId}`)
    return data
  },

  findBySituacao: async (situacao: number) => {
    const { data } = await api.get<Emprestimo[]>(`/emprestimos/por-situacao/${situacao}`)
    return data
  },

  gerarFinanceiro: async (id: number) => {
    const { data } = await api.post(`/emprestimos/${id}/gerar-financeiro`)
    return data
  },
}
