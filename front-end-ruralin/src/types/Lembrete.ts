export interface Lembrete {
  id?: number
  usuarioId?: number
  desc_simples: string
  desc_completa: string

  lembrete_data_hora: LembreteDataHora[]
}

export interface LembreteDataHora{
  id?: number
  lembreteId?: number

  dia: string
  data: string
  horario: string
}
