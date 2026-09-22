import type { GrupoProduto } from './GrupoProduto'

export interface SubGrupoProduto {
  id_sub?: number
  tenantId?: number
  descricao_sub: string
  idGrupo: number
  createdAt?: string
  updatedAt?: string
  grupo?: GrupoProduto
}
