export type OutraDespesaReceitaTipo = 'RECEITA' | 'DESPESA'
export type OutraDespesaReceitaTipoAlocacao = 'PROPRIEDADE' | 'CONFIGURADOR_CICLO'

export interface OutraDespesaReceita {
  id?: number
  tenantId?: number
  planoGerencialId: number
  dataMovimento: string
  valor: number
  observacoes?: string | null
  tipo: OutraDespesaReceitaTipo
  tipoAlocacao: OutraDespesaReceitaTipoAlocacao
  configuradorCicloId?: number | null
  usercreation?: number
  datecreation?: string | Date

  // Relacionamentos
  planoGerencial?: {
    id: number
    item: string
    descricao: string
    tipo: 'SINTETICA' | 'ANALITICA'
  } | null

  configuradorCiclo?: {
    id_cfg: number
    areaPlantada?: number | null
    observacao?: string | null
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
  } | null

  usuarioCriador?: {
    id: number
    nome: string
    email: string
  } | null
}

export interface CreateOutraDespesaReceitaDto {
  planoGerencialId: number
  dataMovimento: string
  valor: number
  observacoes?: string | null
  tipo: OutraDespesaReceitaTipo
  tipoAlocacao: OutraDespesaReceitaTipoAlocacao
  configuradorCicloId?: number | null
}

export interface UpdateOutraDespesaReceitaDto {
  planoGerencialId?: number
  dataMovimento?: string
  valor?: number
  observacoes?: string | null
  tipo?: OutraDespesaReceitaTipo
  tipoAlocacao?: OutraDespesaReceitaTipoAlocacao
  configuradorCicloId?: number | null
}

export const TIPO_LABELS: Record<OutraDespesaReceitaTipo, string> = {
  RECEITA: 'Receita',
  DESPESA: 'Despesa',
}

export const TIPO_COLORS: Record<OutraDespesaReceitaTipo, string> = {
  RECEITA: 'bg-green-100 text-green-700',
  DESPESA: 'bg-red-100 text-red-700',
}

export const TIPO_ALOCACAO_LABELS: Record<OutraDespesaReceitaTipoAlocacao, string> = {
  PROPRIEDADE: 'Toda a Propriedade',
  CONFIGURADOR_CICLO: 'Configurador de Ciclo',
}

export interface ConfiguradorCicloOption {
  id_cfg: number
  areaPlantada?: number | null
  observacao?: string | null
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
