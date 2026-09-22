import api from './api'
import type { Usuario } from '../types/Usuario'

export interface PaginatedResult<T> {
  data: T[]
  page: number
  limit: number
  total: number
  totalPages: number
}

export const usuarioService = {
  getAll: async (page = 1, limit = 100) => {
    const { data } = await api.get<PaginatedResult<Usuario>>('/usuarios', {
      params: { page, limit }
    })
    return data
  },

  getAllNoPagination: async () => {
    // If the backend doesn't support a specific "all" endpoint, we can request a large limit
    const { data } = await api.get<PaginatedResult<Usuario>>('/usuarios', {
      params: { limit: 1000 }
    })
    return data.data
  },

  getById: async (id: number) => {
    const { data } = await api.get<Usuario>(`/usuarios/${id}`)
    return data
  },

  create: async (usuario: Usuario) => {
    const { data } = await api.post<Usuario>('/usuarios', usuario)
    return data
  },

  update: async (id: number, usuario: Partial<Usuario>) => {
    const { data } = await api.put<Usuario>(`/usuarios/${id}`, usuario)
    return data
  },

  delete: async (id: number) => {
    await api.delete(`/usuarios/${id}`)
  }
}
