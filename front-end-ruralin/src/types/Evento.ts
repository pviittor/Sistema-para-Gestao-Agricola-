export interface Evento {
  id?: number
  usuarioId?: number
  titulo: string
  descricao: string
  data: string // YYYY-MM-DD
  horario_inicio: string // HH:mm
  horario_fim: string // HH:mm
  localId: number
}
