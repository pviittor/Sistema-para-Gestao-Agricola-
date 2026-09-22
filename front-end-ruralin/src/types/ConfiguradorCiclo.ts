export interface ConfiguradorCiclo {
  id_cfg?: number
  tenantId?: number
  idTalhao: number
  idCiclo: number
  idCultura: number
  idVariedadeCiclo?: number | null
  inicioPlantio?: string | null
  fimPlantio?: string | null
  previsaoColheita?: string | null
  inicioColheita?: string | null
  fimColheita?: string | null
  observacao?: string | null
  areaPlantada?: number | null
  estimativaProducao?: number | null
  usercreation?: number
  datecreation?: string

  // Relacionamentos
  talhao?: {
    id_talhao: number
    descricao: string
  } | null
  cultura?: {
    id: number
    descricao: string
  } | null
  variedadeCiclo?: {
    id_prod: number
    descricao_prod: string
  } | null
  ciclo?: {
    id: number
    descricao: string
  } | null
}
