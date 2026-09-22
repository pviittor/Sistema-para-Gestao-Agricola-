/**
 * EmprestimoResponseDto - DTO para resposta de empréstimo
 *
 * DTO usado para tipar respostas de endpoints de empréstimo.
 *
 * @example
 * ```typescript
 * // GET /api/emprestimos/:id
 * {
 *   "id": 1,
 *   "tenantId": 1,
 *   "fazendaId": 1,
 *   "parceiroId": 10,
 *   "data_emp": "2026-02-28",
 *   "devolucao_emp": "2026-03-15",
 *   "encerramento_emp": null,
 *   "tipo_emp": 0,
 *   "situacao_emp": 0,
 *   "observacao_emp": "Empréstimo de sementes",
 *   "fazenda": { "id": 1, "descricao": "Fazenda São João" },
 *   "parceiro": { "id_pessoa": 10, "nomerazao_pessoa": "João Silva" },
 *   "createdAt": "2026-02-28T10:00:00.000Z",
 *   "updatedAt": "2026-02-28T10:00:00.000Z"
 * }
 * ```
 */

/**
 * Informações básicas do empréstimo (sem relacionamentos)
 */
export interface EmprestimoResponseDto {
  /**
   * ID do empréstimo
   */
  id: number;

  /**
   * ID do tenant ao qual o empréstimo pertence
   */
  tenantId: number;

  /**
   * ID da fazenda vinculada ao empréstimo
   */
  fazendaId: number;

  /**
   * ID do parceiro (pessoa) vinculado ao empréstimo
   */
  parceiroId: number;

  /**
   * Data do empréstimo (formato: YYYY-MM-DD)
   */
  data_emp: string;

  /**
   * Data prevista de devolução (formato: YYYY-MM-DD)
   */
  devolucao_emp: string | null;

  /**
   * Data de encerramento efetivo (formato: YYYY-MM-DD)
   */
  encerramento_emp: string | null;

  /**
   * Tipo do empréstimo: 0=Produto, 1=Máquina
   */
  tipo_emp: number;

  /**
   * Situação do empréstimo: 0=Em aberto, 1=Parcialmente devolvido, 2=Concluído
   */
  situacao_emp: number;

  /**
   * Observações gerais sobre o empréstimo
   */
  observacao_emp: string | null;

  /**
   * Prazo em dias para devolução
   */
  prazo_dias: number | null;

  /**
   * Data limite de devolução (data_emp + prazo_dias, calculado pelo service)
   */
  data_limite_devolucao: string | null;

  /**
   * Percentual de multa sobre valor total
   */
  multa_percentual: number | null;

  /**
   * Percentual de juros ao dia sobre valor total
   */
  juros_diario_percentual: number | null;

  /**
   * Se já gerou título financeiro de cobrança
   */
  financeiro_gerado: boolean;

  /**
   * Soma dos total_empi dos itens — custo total do empréstimo
   */
  valor_custo_medio_total: number | null;

  /**
   * Data de criação
   */
  createdAt: Date;

  /**
   * Data de atualização
   */
  updatedAt: Date;
}

/**
 * Resposta completa de empréstimo (com relacionamentos)
 */
export interface EmprestimoDetailResponseDto extends EmprestimoResponseDto {
  /**
   * Fazenda associada ao empréstimo
   */
  fazenda?: {
    id: number;
    descricao: string;
    [key: string]: any;
  };

  /**
   * Parceiro (pessoa) associado ao empréstimo
   */
  parceiro?: {
    id_pessoa: number;
    nomerazao_pessoa: string | null;
    [key: string]: any;
  };

  /**
   * Itens do empréstimo com seus produtos e devoluções
   */
  itens?: {
    id: number;
    emprestimoId: number;
    produtoId: number;
    quantidade_empi: number;
    unitario_empi: number;
    total_empi: number;
    produto?: { id_prod: number; descricao_prod: string | null } | null;
    devolucoes?: {
      id: number;
      itemDevolucaoId: number;
      produtoDevolucaoId: number;
      produtoSimilarId: number | null;
      datadevolucao_empdev: string;
      quantidadedevolvida_empdev: number;
      devolucaoGeraFinanceiro_empdev: boolean;
      devolucaoProdutoSimilar_empdev: boolean;
      produtoDevolucao?: { id_prod: number; descricao_prod: string | null } | null;
      produtoSimilar?: { id_prod: number; descricao_prod: string | null } | null;
    }[] | null;
  }[] | null;
}
