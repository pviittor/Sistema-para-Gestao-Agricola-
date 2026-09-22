export enum TipoConta {
  BANCO = 'BANCO',
  CAIXA = 'CAIXA'
}

export interface Conta {
  id?: number
  tenantId?: number
  bancoId: number
  nome: string
  agencia?: string | null
  conta?: string | null
  tipo: TipoConta
  saldoInicial: number
  ativo: boolean
  usercreation?: number
  datecreation?: Date

  banco?: {
    id: number
    nome: string
    codigo: string
  }
}
