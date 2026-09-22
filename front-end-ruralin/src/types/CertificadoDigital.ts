export type StatusCertificadoDigital = 'ativo' | 'expirado' | 'revogado'
export type AmbienteCertificadoDigital = 'homologacao' | 'producao'

export interface CertificadoDigital {
  id?: number
  tenantId?: number
  nome: string
  razao_social: string
  cnpj_cpf: string
  arquivo_path: string
  data_validade: string
  status: StatusCertificadoDigital
  ambiente: AmbienteCertificadoDigital
  uf: string
  padrao: boolean
  ativo: boolean
  usercreation?: number
  datecreation?: string
}

export const STATUS_CERTIFICADO_LABELS: Record<StatusCertificadoDigital, string> = {
  ativo: 'Ativo',
  expirado: 'Expirado',
  revogado: 'Revogado',
}

export const STATUS_CERTIFICADO_COLORS: Record<StatusCertificadoDigital, string> = {
  ativo: 'bg-green-100 text-green-700',
  expirado: 'bg-red-100 text-red-700',
  revogado: 'bg-orange-100 text-orange-700',
}

export const AMBIENTE_LABELS: Record<AmbienteCertificadoDigital, string> = {
  homologacao: 'Homologação',
  producao: 'Produção',
}
