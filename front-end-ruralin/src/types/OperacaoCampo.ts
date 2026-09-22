export interface OperacaoCampo {
  id?: number
  codigo?: string
  descricao: string
  tipo: number // 0: Produção, 1: Máquinas, 2: Administrativo, 3: Benfeitorias
  financeiro: boolean
}

export const OPERACAO_CAMPO_LABELS: Record<number, string> = {
  0: 'ATIVIDADE DE PRODUÇÃO',
  1: 'MANUTENÇÃO DE MÁQUINAS',
  2: 'ATIVIDADES ADMINISTRATIVAS',
  3: 'MANUTENÇÃO DE BENFEITORIAS'
}
