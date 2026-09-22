export interface UnidadeDeposito {
  id?: number
  tenantId?: number
  descricao: string
  tipo: 'Silo' | 'Bag' | 'Armazem' | 'Outros'
  capacidade_total: number
  idUnidadeMedida: number
  idProduto: number
  saldo_inicial: number
  ativo: boolean
  usercreation?: number
  datecreation?: string

  // Relacionamentos
  unidadeMedida?: {
    id_unidade: number
    descricao_unidade: string
    abreviatura_unidade?: string
  } | null
  produto?: {
    id_prod: number
    descricao_prod: string
    idGrupo?: number
    idSubGrupo?: number
  } | null
  usuarioCriador?: {
    id: number
    nome: string
    email: string
  } | null

  // Campos com saldo (opcionais, presentes via getComSaldo)
  saldoAtual?: number
  percentualUtilizado?: number
}
