/**
 * Enums para Nota Fiscal
 */

/**
 * Tipo de nota fiscal
 *
 * entrada - Nota de entrada de mercadorias/servicos
 * saida   - Nota de saida de mercadorias/servicos
 */
export enum TipoNotaFiscal {
  ENTRADA = 'entrada',
  SAIDA = 'saida',
}

/**
 * Modelo do documento fiscal
 *
 * 55 - NF-e (Nota Fiscal Eletronica)
 * 65 - NFC-e (Nota Fiscal de Consumidor Eletronica)
 * 01 - NF papel (modelo 1/1A)
 * 04 - NFS-e (Nota Fiscal de Servico Eletronica)
 */
export enum ModeloNotaFiscal {
  NFE = '55',
  NFCE = '65',
  NF_PAPEL = '01',
  NFSE = '04',
}

/**
 * Finalidade da nota fiscal
 *
 * normal       - Emissao normal
 * complementar - Nota complementar
 * ajuste       - Nota de ajuste
 * devolucao    - Nota de devolucao
 */
export enum FinalidadeNotaFiscal {
  NORMAL = 'normal',
  COMPLEMENTAR = 'complementar',
  AJUSTE = 'ajuste',
  DEVOLUCAO = 'devolucao',
}

/**
 * Status da nota fiscal
 *
 * rascunho    - Em elaboracao
 * pendente    - Aguardando transmissao/autorizacao
 * autorizada  - Autorizada pela SEFAZ
 * cancelada   - Cancelada
 * denegada    - Denegada pela SEFAZ
 * inutilizada - Numeracao inutilizada
 */
export enum StatusNotaFiscal {
  RASCUNHO = 'rascunho',
  PENDENTE = 'pendente',
  AUTORIZADA = 'autorizada',
  CANCELADA = 'cancelada',
  DENEGADA = 'denegada',
  INUTILIZADA = 'inutilizada',
}

/**
 * Modalidade de frete
 *
 * emitente              - Frete por conta do emitente (CIF)
 * destinatario          - Frete por conta do destinatario (FOB)
 * terceiros             - Frete por conta de terceiros
 * proprio_remetente     - Transporte proprio por conta do remetente
 * proprio_destinatario  - Transporte proprio por conta do destinatario
 * sem_frete             - Sem frete
 */
export enum ModalidadeFrete {
  EMITENTE = 'emitente',
  DESTINATARIO = 'destinatario',
  TERCEIROS = 'terceiros',
  PROPRIO_REMETENTE = 'proprio_remetente',
  PROPRIO_DESTINATARIO = 'proprio_destinatario',
  SEM_FRETE = 'sem_frete',
}
