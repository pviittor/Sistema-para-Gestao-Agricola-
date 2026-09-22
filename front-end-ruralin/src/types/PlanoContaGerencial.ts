export interface PlanoContaGerencial {
  id?: number
  tenantId?: number
  item: string
  descricao: string
  tipo: 'SINTETICA' | 'ANALITICA'
  classificacao?: string | null
  contaPaiId?: number | null
  nivel: number
  ativo: boolean
  usercreation?: number
  datecreation?: string | Date
}
