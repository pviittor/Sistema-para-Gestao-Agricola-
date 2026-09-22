import api from './api'
import type { PlanoContaGerencial } from '../types/PlanoContaGerencial'

export interface PaginatedResult<T> {
  data: T[]
  page: number
  limit: number
  total: number
  totalPages: number
}

export const planoContaGerencialService = {
  getAll: async (page = 1, limit = 100) => {
    const { data } = await api.get<PaginatedResult<PlanoContaGerencial>>('/planoContasGerenciais', {
      params: { page, limit },
    })
    return data
  },

  getById: async (id: number) => {
    const { data } = await api.get<PlanoContaGerencial>(`/planoContasGerenciais/${id}`)
    return data
  },

  create: async (planoConta: PlanoContaGerencial) => {
    const { data } = await api.post<PlanoContaGerencial>('/planoContasGerenciais', planoConta)
    return data
  },

  update: async (id: number, planoConta: Partial<PlanoContaGerencial>) => {
    const { data } = await api.put<PlanoContaGerencial>(`/planoContasGerenciais/${id}`, planoConta)
    return data
  },

  delete: async (id: number) => {
    await api.delete(`/planoContasGerenciais/${id}`)
  },

  // Helpers de Regra de Negócio (Client-side)
  suggestCode: (currentCode: string, targetLevel: number): string => {
    let parts = currentCode.split('.').map(p => p.trim())
    // Garantir 4 partes
    while (parts.length < 4) parts.push('0')
    parts = parts.slice(0, 4)

    const nums = parts.map(p => parseInt(p) || 0)
    const newNums = [...nums]

    for (let i = 0; i < 4; i++) {
      if (i < targetLevel) {
        // Se for nível necessário e estiver zerado, sugere 1.
        // Se já tiver valor, mantém.
        if (newNums[i] === 0) newNums[i] = 1
      } else {
        // Níveis inferiores devem ser 0
        newNums[i] = 0
      }
    }
    
    return newNums.join('.')
  },

  detectLevel: (code: string): number => {
    const parts = code.split('.').map(p => parseInt(p) || 0)
    if ((parts[3] ?? 0) > 0) return 4
    if ((parts[2] ?? 0) > 0) return 3
    if ((parts[1] ?? 0) > 0) return 2
    if ((parts[0] ?? 0) > 0) return 1
    return 1
  }
}
