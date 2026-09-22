export interface EmprestimoItemDevolucao {
  id?: number
  itemDevolucaoId: number
  produtoDevolucaoId: number
  produtoSimilarId?: number | null
  datadevolucao_empdev: string
  quantidadedevolvida_empdev: number
  devolucaoGeraFinanceiro_empdev: boolean
  devolucaoProdutoSimilar_empdev: boolean
  createdAt?: string
  updatedAt?: string
  // Relacionamentos
  produtoDevolucao?: { id_prod: number; descricao_prod: string; [key: string]: any }
  produtoSimilar?: { id_prod: number; descricao_prod: string; [key: string]: any }
}
