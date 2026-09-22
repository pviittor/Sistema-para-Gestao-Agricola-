import api from './api'
import type { NotaFiscal } from '../types/NotaFiscal'
import type { ParsedNfe } from '../types/ParsedNfe'
import type {
  EmitirNfeResult,
  RetornoSefaz,
  StatusServicoSefaz,
  InutilizarFaixaPayload,
  ContingenciaPayload,
} from '../types/NfeEmissao'

export interface PaginatedResult<T> {
  data: T[]
  page: number
  limit: number
  total: number
  totalPages: number
}

export const notaFiscalService = {
  getAll: async (page = 1, limit = 100) => {
    const { data } = await api.get<PaginatedResult<NotaFiscal>>('/notasFiscais', {
      params: { page, limit },
    })
    return data
  },

  getById: async (id: number) => {
    const { data } = await api.get<NotaFiscal>(`/notasFiscais/${id}`)
    return data
  },

  create: async (nf: Partial<NotaFiscal>) => {
    const { data } = await api.post<NotaFiscal>('/notasFiscais', nf)
    return data
  },

  createCompleto: async (nf: any) => {
    const { data } = await api.post<NotaFiscal>('/notasFiscais/completo', nf)
    return data
  },

  update: async (id: number, nf: Partial<NotaFiscal>) => {
    const { data } = await api.put<NotaFiscal>(`/notasFiscais/${id}`, nf)
    return data
  },

  delete: async (id: number) => {
    await api.delete(`/notasFiscais/${id}`)
  },

  cancelar: async (id: number, motivo: string) => {
    const { data } = await api.post<NotaFiscal>(`/notasFiscais/${id}/cancelar`, { motivo })
    return data
  },

  autorizar: async (
    id: number,
    payload?: { chave_acesso?: string; protocolo_autorizacao?: string },
  ) => {
    const { data } = await api.post<NotaFiscal>(`/notasFiscais/${id}/autorizar`, payload ?? {})
    return data
  },

  inutilizar: async (id: number, motivo: string) => {
    const { data } = await api.post<NotaFiscal>(`/notasFiscais/${id}/inutilizar`, { motivo })
    return data
  },

  movimentarEstoque: async (id: number) => {
    const { data } = await api.post<NotaFiscal>(`/notasFiscais/${id}/movimentar-estoque`, {})
    return data
  },

  gerarFinanceiro: async (id: number) => {
    const { data } = await api.post<NotaFiscal>(`/notasFiscais/${id}/gerar-financeiro`, {})
    return data
  },

  findByPeriodo: async (dataInicio: string, dataFim: string, tipo?: string, status?: string) => {
    const { data } = await api.get<NotaFiscal[]>('/notasFiscais/por-periodo', {
      params: {
        dataInicio,
        dataFim,
        ...(tipo && { tipo }),
        ...(status && { status }),
      },
    })
    return data
  },

  importarXml: async (file: File) => {
    const formData = new FormData()
    formData.append('arquivo', file)
    const { data } = await api.post<ParsedNfe>('/notasFiscais/importar-xml', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
    return data
  },

  consultarSefaz: async (chaveAcesso: string, certificadoId?: number) => {
    const { data } = await api.post<ParsedNfe>('/notasFiscais/consultar-sefaz', {
      chaveAcesso,
      certificadoId,
    })
    return data
  },

  emitir: async (id: number, certificadoId?: number) => {
    const { data } = await api.post<EmitirNfeResult>(`/notasFiscais/${id}/emitir`, {
      ...(certificadoId && { certificadoId }),
    })
    return data
  },

  inutilizarFaixa: async (payload: InutilizarFaixaPayload) => {
    const { data } = await api.post<RetornoSefaz>('/notasFiscais/inutilizar-faixa', payload)
    return data
  },

  ativarContingencia: async (payload: ContingenciaPayload) => {
    const { data } = await api.post('/notasFiscais/contingencia/ativar', payload)
    return data
  },

  desativarContingencia: async () => {
    const { data } = await api.post('/notasFiscais/contingencia/desativar')
    return data
  },

  statusContingencia: async () => {
    const { data } = await api.get('/notasFiscais/contingencia/status')
    return data
  },

  statusServico: async (uf?: string, ambiente?: string) => {
    const { data } = await api.get<StatusServicoSefaz>('/notasFiscais/sefaz/status-servico', {
      params: { ...(uf && { uf }), ...(ambiente && { ambiente }) },
    })
    return data
  },
}
