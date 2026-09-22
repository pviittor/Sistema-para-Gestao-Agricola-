import { BaseException } from './BaseException';

/**
 * ValidationException - Exceção para erros de validação
 * 
 * Use esta exceção quando dados de entrada não passarem na validação.
 * Status HTTP: 400 (Bad Request)
 * 
 * @example
 * ```typescript
 * if (!email || !isValidEmail(email)) {
 *   throw new ValidationException('Email inválido', 'INVALID_EMAIL');
 * }
 * 
 * // Com múltiplos erros
 * const errors = [
 *   { field: 'email', message: 'Email inválido' },
 *   { field: 'senha', message: 'Senha muito curta' }
 * ];
 * throw new ValidationException('Dados inválidos', 'VALIDATION_ERROR', errors);
 * ```
 */
export class ValidationException extends BaseException {
  /**
   * Cria uma nova ValidationException
   * 
   * @param message - Mensagem de erro descritiva
   * @param code - Código de erro único (padrão: 'VALIDATION_ERROR')
   * @param details - Detalhes de validação (geralmente array de erros)
   */
  constructor(
    message: string = 'Dados de entrada inválidos',
    code: string = 'VALIDATION_ERROR',
    details?: any
  ) {
    super(message, 400, code, details);
  }
}
