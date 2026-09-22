/**
 * BadRequestException - Exceção para requisições inválidas (400)
 * 
 * Deve ser lançada quando a requisição está malformada ou contém dados inválidos.
 * 
 * @example
 * ```typescript
 * throw new BadRequestException('Dados inválidos', 'INVALID_DATA');
 * ```
 */

import { BaseException } from './BaseException';

/**
 * Exceção para requisições inválidas (HTTP 400)
 * 
 * Deve ser lançada quando:
 * - Dados obrigatórios estão faltando
 * - Formato de dados está incorreto
 * - Parâmetros inválidos foram fornecidos
 */
export class BadRequestException extends BaseException {
  constructor(
    message: string,
    code: string = 'BAD_REQUEST',
    details?: any
  ) {
    super(message, 400, code, details);
    this.name = 'BadRequestException';
  }
}
