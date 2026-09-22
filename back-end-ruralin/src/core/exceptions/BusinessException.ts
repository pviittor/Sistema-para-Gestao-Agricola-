import { BaseException } from './BaseException';

/**
 * BusinessException - Exceção para erros de regra de negócio
 * 
 * Use esta exceção quando uma regra de negócio for violada.
 * Status HTTP: 400 (Bad Request)
 * 
 * @example
 * ```typescript
 * if (saldo < valor) {
 *   throw new BusinessException('Saldo insuficiente', 'INSUFFICIENT_BALANCE');
 * }
 * ```
 */
export class BusinessException extends BaseException {
  /**
   * Cria uma nova BusinessException
   * 
   * @param message - Mensagem de erro descritiva
   * @param code - Código de erro único (padrão: 'BUSINESS_ERROR')
   * @param details - Detalhes adicionais (opcional)
   */
  constructor(message: string, code: string = 'BUSINESS_ERROR', details?: any) {
    super(message, 400, code, details);
  }
}
