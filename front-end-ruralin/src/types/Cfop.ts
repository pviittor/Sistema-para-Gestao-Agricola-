export type NaturezaCfop = 'entrada' | 'saida'
export type TipoOperacaoCfop =
  | 'venda'
  | 'compra'
  | 'transferencia'
  | 'remessa'
  | 'retorno'
  | 'devolucao'
  | 'bonificacao'
  | 'consignacao'
  | 'outras'

export interface Cfop {
  id?: number
  codigo: string
  descricao: string
  natureza: NaturezaCfop
  tipo_operacao: TipoOperacaoCfop
  gera_financeiro: boolean
  movimenta_estoque: boolean
  aplicacao_ipi: boolean
  aplicacao_icms: boolean
  aplicacao_pis_cofins: boolean
  ativo: boolean
}

export const NATUREZA_LABELS: Record<NaturezaCfop, string> = {
  entrada: 'Entrada',
  saida: 'Saida',
}

export const TIPO_OPERACAO_LABELS: Record<TipoOperacaoCfop, string> = {
  venda: 'Venda',
  compra: 'Compra',
  transferencia: 'Transferencia',
  remessa: 'Remessa',
  retorno: 'Retorno',
  devolucao: 'Devolucao',
  bonificacao: 'Bonificacao',
  consignacao: 'Consignacao',
  outras: 'Outras',
}
