import api from './api'
import type { CertificadoDigital } from '../types/CertificadoDigital'

interface BackendPaginatedResult<T> {
  data: T[]
  page: number
  limit: number
  total: number
  totalPages: number
}

export const certificadoDigitalService = {
  getAll: async (page = 1, limit = 10) =>
    api.get<BackendPaginatedResult<CertificadoDigital>>('/certificados-digitais', {
      params: { page, limit },
    }),

  getById: async (id: number) =>
    api.get<CertificadoDigital>(`/certificados-digitais/${id}`),

  create: async (data: Partial<CertificadoDigital>) =>
    api.post<CertificadoDigital>('/certificados-digitais', data),

  update: async (id: number, data: Partial<CertificadoDigital>) =>
    api.put<CertificadoDigital>(`/certificados-digitais/${id}`, data),

  delete: async (id: number) => api.delete(`/certificados-digitais/${id}`),

  upload: async (file: File) => {
    const formData = new FormData()
    formData.append('arquivo', file)
    return api.post<{ arquivo_path: string }>('/certificados-digitais/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
  },

  setPadrao: async (id: number) =>
    api.post<CertificadoDigital>(`/certificados-digitais/${id}/set-padrao`),
}
