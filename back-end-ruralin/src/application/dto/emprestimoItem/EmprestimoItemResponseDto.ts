/**
 * EmprestimoItemResponseDto - DTO para resposta de item de empréstimo
 *
 * DTO usado para tipar respostas de endpoints de item de empréstimo.
 *
 * @example
 * ```typescript
 * // GET /api/emprestimoItens/:id
 * {
 *   "id": 1,
 *   "emprestimoId": 1,
 *   "produtoId": 5,
 *   "quantidade_empi": 10.5,
 *   "unitario_empi": 25.00,
 *   "total_empi": 262.50,
 *   "createdAt": "2026-02-28T10:00:00.000Z",
 *   "updatedAt": "2026-02-28T10:00:00.000Z"
 * }
 * ```
 */
export interface EmprestimoItemResponseDto {
  /** ID do item do empréstimo */
  id: number;

  /** ID do empréstimo */
  emprestimoId: number;

  /** ID do produto emprestado */
  produtoId: number;

  /** Quantidade do produto emprestado */
  quantidade_empi: number;

  /** Valor unitário do produto emprestado */
  unitario_empi: number;

  /** Valor total do item (quantidade_empi × unitario_empi) */
  total_empi: number;

  /** Produto associado ao item (presente quando carregado com include) */
  produto?: {
    id_prod: number;
    descricao_prod: string;
    [key: string]: any;
  };

  /** Data de criação */
  createdAt: Date;

  /** Data de atualização */
  updatedAt: Date;
}

/**
 * Resposta detalhada de item de empréstimo (com relacionamentos)
 */
export interface EmprestimoItemDetailResponseDto extends EmprestimoItemResponseDto {
  /** Produto associado ao item */
  produto?: {
    id_prod: number;
    descricao_prod: string;
    [key: string]: any;
  };
}
