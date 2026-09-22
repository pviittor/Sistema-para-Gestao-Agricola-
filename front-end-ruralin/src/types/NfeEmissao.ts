import type { NotaFiscal } from './NotaFiscal'

/**
 * Retorno de operação SEFAZ
 */
export interface RetornoSefaz {
  status: string
  motivo: string
  protocolo?: string | null
  chaveAcesso?: string | null
  xmlRetorno?: string | null
  codigoStatus: number
  dataProcessamento: string
}

/**
 * Resultado completo de emissão NF-e
 */
export interface EmitirNfeResult {
  sucesso: boolean
  notaFiscal: NotaFiscal
  retornoSefaz: RetornoSefaz
  xmlAutorizado?: string | null
}

/**
 * Status do serviço SEFAZ
 */
export interface StatusServicoSefaz {
  disponivel: boolean
  motivo: string
  tempoMedioResposta?: number
  dataConsulta: string
  uf: string
  ambiente: string
}

/**
 * Dados para inutilização de faixa de numeração
 */
export interface InutilizarFaixaPayload {
  cnpj: string
  serie: string
  numInicial: number
  numFinal: number
  justificativa: string
  certificadoId?: number
  uf?: string
  ambiente?: string
}

/**
 * Dados para ativação de contingência
 */
export interface ContingenciaPayload {
  tipo: 'SVC-AN' | 'SVC-RS'
  justificativa: string
}
