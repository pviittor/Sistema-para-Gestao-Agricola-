export type NotaFiscalTipo = 'entrada' | 'saida'
export type NotaFiscalFinalidade = 'normal' | 'complementar' | 'ajuste' | 'devolucao'
export type NotaFiscalStatus = 'rascunho' | 'pendente' | 'autorizada' | 'cancelada' | 'denegada' | 'inutilizada'
export type NotaFiscalModelo = '55' | '65' | '01' | '04'
export type NotaFiscalModalidadeFrete = 'emitente' | 'destinatario' | 'terceiros' | 'proprio_remetente' | 'proprio_destinatario' | 'sem_frete'

export interface NotaFiscal {
  id_nf?: number
  tenantId?: number
  tipo: NotaFiscalTipo
  numero: string
  serie: string
  modelo: NotaFiscalModelo
  chave_acesso?: string
  natureza_operacao: string
  cfop: string
  cfopId?: number | null
  finalidade: NotaFiscalFinalidade
  data_emissao: string
  data_entrada_saida: string
  hora_entrada_saida?: string
  status?: NotaFiscalStatus
  emitenteId: number
  destinatarioId: number
  empresaId: number
  transportadoraId?: number
  modalidade_frete?: NotaFiscalModalidadeFrete
  vl_produtos?: number
  vl_frete?: number
  vl_seguro?: number
  vl_desconto?: number
  vl_outros?: number
  vl_ipi?: number
  vl_icms?: number
  vl_pis?: number
  vl_cofins?: number
  vl_total?: number
  volumes_qtd?: number
  volumes_especie?: string
  peso_bruto?: number
  peso_liquido?: number
  informacoes_adicionais?: string
  informacoes_complementares?: string
  xml_autorizacao?: string
  protocolo_autorizacao?: string
  data_autorizacao?: string
  motivo_cancelamento?: string
  data_cancelamento?: string
  estoque_movimentado?: boolean
  certificadoDigitalId?: number | null
  ambiente_sefaz?: string | null
  contingencia_tipo?: string | null
  contingencia_justificativa?: string | null
  contingencia_data_inicio?: string | null
  numero_sequencial?: number | null
  condicao_pagamento?: string | null
  parcelas_qtd?: number | null
  financeiro_gerado?: boolean
  ativo?: boolean
  notaFiscalRefId?: number
  usercreation?: number
  datecreation?: string
  // Relations
  emitente?: { id_pessoa: number; nomerazao_pessoa: string }
  destinatario?: { id_pessoa: number; nomerazao_pessoa: string }
  empresa?: { id_pessoa: number; nomerazao_pessoa: string }
  transportadora?: { id_pessoa: number; nomerazao_pessoa: string }
  notaFiscalRef?: { id_nf: number; numero: string; serie: string; modelo: string }
}

export const NF_STATUS_LABELS: Record<NotaFiscalStatus, string> = {
  rascunho: 'Rascunho',
  pendente: 'Pendente',
  autorizada: 'Autorizada',
  cancelada: 'Cancelada',
  denegada: 'Denegada',
  inutilizada: 'Inutilizada',
}

export const NF_STATUS_COLORS: Record<NotaFiscalStatus, string> = {
  rascunho: 'bg-gray-100 text-gray-700',
  pendente: 'bg-yellow-100 text-yellow-700',
  autorizada: 'bg-green-100 text-green-700',
  cancelada: 'bg-red-100 text-red-700',
  denegada: 'bg-red-100 text-red-700',
  inutilizada: 'bg-orange-100 text-orange-700',
}

export const NF_FINALIDADE_LABELS: Record<NotaFiscalFinalidade, string> = {
  normal: 'Normal',
  complementar: 'Complementar',
  ajuste: 'Ajuste',
  devolucao: 'Devolução',
}

export const NF_MODALIDADE_FRETE: Record<NotaFiscalModalidadeFrete, string> = {
  emitente: 'Por conta do Emitente',
  destinatario: 'Por conta do Destinatário',
  terceiros: 'Por conta de Terceiros',
  proprio_remetente: 'Transporte Próprio por conta do Remetente',
  proprio_destinatario: 'Transporte Próprio por conta do Destinatário',
  sem_frete: 'Sem Frete',
}

export const NF_MODELO_LABELS: Record<NotaFiscalModelo, string> = {
  '55': 'NF-e',
  '65': 'NFC-e',
  '01': 'NF papel',
  '04': 'NFS-e',
}
