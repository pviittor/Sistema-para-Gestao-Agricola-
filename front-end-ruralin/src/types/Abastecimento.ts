import type { MaquinaVeiculo } from './MaquinaVeiculo'
import type { ParceiroNegocio } from './ParceiroNegocio'
import type { Produto } from './Produto'
import type { Propriedade } from './Propriedade'
import type { Safra } from './Safra'

export interface Abastecimento {
  id_abast?: number
  tenantId?: number
  data: string
  idMaquina: number
  kminicio: number
  kmfim: number
  idOperador?: number | null
  idCombustivel: number
  volume: number
  preco: number
  total: number
  idFazenda: number
  idCicloAbastecimento?: number | null
  idOperadorAbastecimento?: number | null
  usercreation?: number
  datecreation?: string | Date

  // Relacionamentos
  maquina?: MaquinaVeiculo
  operador?: ParceiroNegocio
  combustivel?: Produto
  fazenda?: Propriedade
  cicloAbastecimento?: Safra
  operadorAbastecimento?: ParceiroNegocio
}
