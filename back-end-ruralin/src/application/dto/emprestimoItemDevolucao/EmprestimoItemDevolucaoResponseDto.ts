/**
 * EmprestimoItemDevolucaoResponseDto - DTO para resposta de devolução de item de empréstimo
 *
 * DTO usado para tipar respostas de endpoints de devolução de item de empréstimo.
 *
 * @example
 * ```typescript
 * // GET /api/emprestimoItemDevolucoes/:id
 * {
 *   "id": 1,
 *   "itemDevolucaoId": 1,
 *   "produtoDevolucaoId": 5,
 *   "produtoSimilarId": null,
 *   "datadevolucao_empdev": "2026-02-28",
 *   "quantidadedevolvida_empdev": 5.0,
 *   "devolucaoGeraFinanceiro_empdev": false,
 *   "devolucaoProdutoSimilar_empdev": false,
 *   "createdAt": "2026-02-28T10:00:00.000Z",
 *   "updatedAt": "2026-02-28T10:00:00.000Z"
 * }
 * ```
 */
export interface EmprestimoItemDevolucaoResponseDto {
  /** ID da devolução */
  id: number;

  /** ID do item do empréstimo */
  itemDevolucaoId: number;

  /** ID do produto devolvido */
  produtoDevolucaoId: number;

  /** ID do produto similar devolvido (null se não for produto similar) */
  produtoSimilarId: number | null;

  /** Data da devolução (formato: YYYY-MM-DD) */
  datadevolucao_empdev: string;

  /** Quantidade devolvida nesta operação */
  quantidadedevolvida_empdev: number;

  /** Indica se a devolução gera um lançamento financeiro */
  devolucaoGeraFinanceiro_empdev: boolean;

  /** Indica se a devolução é de produto similar ao emprestado */
  devolucaoProdutoSimilar_empdev: boolean;

  /** Produto devolvido (presente quando carregado com include) */
  produtoDevolucao?: {
    id_prod: number;
    descricao_prod: string;
    [key: string]: any;
  };

  /** Produto similar devolvido (presente quando carregado com include) */
  produtoSimilar?: {
    id_prod: number;
    descricao_prod: string;
    [key: string]: any;
  } | null;

  /** Data de criação */
  createdAt: Date;

  /** Data de atualização */
  updatedAt: Date;
}

/**
 * Resposta detalhada de devolução de item de empréstimo (com relacionamentos)
 */
export interface EmprestimoItemDevolucaoDetailResponseDto extends EmprestimoItemDevolucaoResponseDto {
  /** Produto devolvido */
  produtoDevolucao?: {
    id_prod: number;
    descricao_prod: string;
    [key: string]: any;
  };

  /** Produto similar devolvido */
  produtoSimilar?: {
    id_prod: number;
    descricao_prod: string;
    [key: string]: any;
  } | null;
}
