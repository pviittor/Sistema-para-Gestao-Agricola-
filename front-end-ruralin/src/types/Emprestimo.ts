export interface Emprestimo {
  id?: number
  tenantId?: number
  fazendaId: number
  parceiroId: number
  data_emp: string
  devolucao_emp?: string | null
  encerramento_emp?: string | null
  tipo_emp: number
  situacao_emp: number
  observacao_emp?: string | null
  prazo_dias?: number | null
  data_limite_devolucao?: string | null
  multa_percentual?: number | null
  juros_diario_percentual?: number | null
  financeiro_gerado?: boolean
  valor_custo_medio_total?: number | null
  createdAt?: string
  updatedAt?: string
  // Relacionamentos
  fazenda?: { id: number; descricao: string; [key: string]: any }
  parceiro?: { id_pessoa: number; nomerazao_pessoa: string; nomefantasia_pessoa?: string; [key: string]: any }
  itens?: EmprestimoItem[]
}

export interface EmprestimoItem {
  id?: number
  emprestimoId: number
  produtoId: number
  quantidade_empi: number
  unitario_empi: number
  total_empi: number
  produto?: { id_prod: number; descricao_prod: string }
  devolucoes?: EmprestimoItemDevolucao[]
}

export interface EmprestimoItemDevolucao {
  id?: number
  itemDevolucaoId: number
  produtoDevolucaoId: number
  produtoSimilarId?: number | null
  datadevolucao_empdev: string
  quantidadedevolvida_empdev: number
  devolucaoGeraFinanceiro_empdev: boolean
  devolucaoProdutoSimilar_empdev: boolean
}
