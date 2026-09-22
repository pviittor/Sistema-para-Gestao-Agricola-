export interface EmprestimoItem {
  id?: number
  emprestimoId: number
  produtoId: number
  quantidade_empi: number
  unitario_empi: number
  total_empi?: number
  createdAt?: string
  updatedAt?: string
  // Relacionamentos
  produto?: { id_prod: number; descricao_prod: string; [key: string]: any }
}
