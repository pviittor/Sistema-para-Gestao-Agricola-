export interface Talhao {
  id_talhao?: number
  tenantId?: number
  descricao: string
  idFazenda: number
  area: number
  geometry?: {
    type: string
    coordinates: number[][][]
  } | null
  grupo?: string | null
  usercreation?: number
  datecreation?: string

  // Relacionamentos
  fazenda?: {
    id: number
    descricao: string
  }
  usuarioCriador?: {
    id: number
    nome: string
    email: string
  }
  culturas?: Array<{
    id: number
    descricao: string
    areaPlantada?: number
  }>
}
