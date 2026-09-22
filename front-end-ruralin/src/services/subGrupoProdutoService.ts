import api from './api'
import type { SubGrupoProduto } from '../types/SubGrupoProduto'

export interface PaginatedResult<T> {
  data: T[]
  page: number
  limit: number
  total: number
  totalPages: number
}

export const subGrupoProdutoService = {
  getAll: async (page = 1, limit = 10) => {
    const { data } = await api.get<PaginatedResult<SubGrupoProduto>>('/subGruposProduto', {
      params: { page, limit }
    })
    return data
  },

  getById: async (id: number) => {
    const { data } = await api.get<SubGrupoProduto>(`/subGruposProduto/${id}`)
    return data
  },

  findByGrupo: async (idGrupo: number) => {
    const { data } = await api.get<SubGrupoProduto[]>(`/subGruposProduto/grupo/${idGrupo}`)
    return data
  },

  create: async (subGrupo: SubGrupoProduto) => {
    const { data } = await api.post<SubGrupoProduto>('/subGruposProduto', subGrupo)
    return data
  },

  update: async (id: number, subGrupo: Partial<SubGrupoProduto>) => {
    const { data } = await api.put<SubGrupoProduto>(`/subGruposProduto/${id}`, subGrupo)
    return data
  },

  delete: async (id: number) => {
    await api.delete(`/subGruposProduto/${id}`)
  }
}
