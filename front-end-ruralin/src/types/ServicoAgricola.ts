export interface ServicoAgricola {
  id_srv?: number
  tenantId?: number
  descricao_srv: string
  financeiro_srv: boolean
  observacao_srv?: string | null
  usercreation?: number
  datecreation?: Date
}
