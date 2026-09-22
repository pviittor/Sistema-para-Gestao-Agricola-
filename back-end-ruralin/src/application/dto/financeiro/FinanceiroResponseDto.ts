/**
 * FinanceiroResponseDto - DTO para resposta de registro financeiro
 * 
 * DTO usado para tipar respostas de endpoints de registro financeiro.
 * 
 * @example
 * ```typescript
 * // GET /api/financeiros/:id
 * {
 *   "id": 1,
 *   "usuarioId": 1,
 *   "contaId": 1,
 *   "historicoId": 2,
 *   "planoFinanceiroId": 3,
 *   "tipoDocuentoId": 1,
 *   "tipoPagamentoId": 1,
 *   "contaDesc": "Conta Corrente",
 *   "historicoDesc": "Venda de produtos",
 *   "planoFinanceiroDesc": "Receitas",
 *   "tipoDocuentoDesc": "Nota Fiscal",
 *   "tipoPagamentoDesc": "Dinheiro",
 *   "dataEmissao": "2025-01-20",
 *   "dataVencimento": "2025-01-25",
 *   "valor": 1500.50,
 *   "observacao": "Pagamento recebido",
 *   "createdAt": "2025-01-14T10:00:00.000Z",
 *   "updatedAt": "2025-01-14T10:00:00.000Z"
 * }
 * ```
 */

/**
 * Informações do registro financeiro
 */
export interface FinanceiroResponseDto {
  /**
   * ID do registro financeiro
   */
  id: number;

  /**
   * ID do usuário dono do registro
   */
  usuarioId: number;

  /**
   * ID da conta
   */
  contaId?: number;

  /**
   * ID do histórico
   */
  historicoId?: number;

  /**
   * ID do plano financeiro
   */
  planoFinanceiroId?: number;

  /**
   * ID do tipo de documento
   */
  tipoDocuentoId?: number;

  /**
   * ID do tipo de pagamento
   */
  tipoPagamentoId?: number;

  /**
   * Descrição da conta
   */
  contaDesc?: string;

  /**
   * Descrição do histórico
   */
  historicoDesc?: string;

  /**
   * Descrição do plano financeiro
   */
  planoFinanceiroDesc?: string;

  /**
   * Descrição do tipo de documento
   */
  tipoDocuentoDesc?: string;

  /**
   * Descrição do tipo de pagamento
   */
  tipoPagamentoDesc?: string;

  /**
   * Data de emissão (formato: YYYY-MM-DD)
   */
  dataEmissao: string;

  /**
   * Data de vencimento (formato: YYYY-MM-DD)
   */
  dataVencimento: string;

  /**
   * Valor da transação
   */
  valor: number;

  /**
   * Observações
   */
  observacao?: string;

  /**
   * Data de criação
   */
  createdAt: Date;

  /**
   * Data de atualização
   */
  updatedAt: Date;
}
