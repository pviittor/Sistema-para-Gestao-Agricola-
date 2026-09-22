import api from './api'
import type { MaquinaVeiculo } from '../types/MaquinaVeiculo'

export interface PaginatedResult<T> {
  data: T[]
  page: number
  limit: number
  total: number
  totalPages: number
}

export const maquinaService = {
  getAll: async (page = 1, limit = 10) => {
    const { data } = await api.get<PaginatedResult<MaquinaVeiculo>>('/maquinas', {
      params: { page, limit },
    })
    return data
  },

  getById: async (id: number) => {
    const { data } = await api.get<MaquinaVeiculo>(`/maquinas/${id}`)
    return data
  },

  create: async (maquina: Omit<MaquinaVeiculo, 'id_mqn' | 'tenantId' | 'usercreation' | 'datecreation' | 'grupoEquipamento' | 'fornecedor' | 'motorista' | 'seguradora' | 'fazenda' | 'usuarioCriador'>) => {
    const { data } = await api.post<MaquinaVeiculo>('/maquinas', maquina)
    return data
  },

  update: async (id: number, maquina: Partial<Omit<MaquinaVeiculo, 'id_mqn' | 'tenantId' | 'usercreation' | 'datecreation' | 'grupoEquipamento' | 'fornecedor' | 'motorista' | 'seguradora' | 'fazenda' | 'usuarioCriador'>>) => {
    const { data } = await api.put<MaquinaVeiculo>(`/maquinas/${id}`, maquina)
    return data
  },

  delete: async (id: number) => {
    await api.delete(`/maquinas/${id}`)
  },
}
