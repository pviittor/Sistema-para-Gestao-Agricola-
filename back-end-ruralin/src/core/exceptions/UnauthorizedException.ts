import { BaseException } from './BaseException';

/**
 * UnauthorizedException - Exceção para erros de autenticação
 * 
 * Use esta exceção quando o usuário não estiver autenticado ou
 * as credenciais forem inválidas.
 * Status HTTP: 401 (Unauthorized)
 * 
 * @example
 * ```typescript
 * if (!token || !isValidToken(token)) {
 *   throw new UnauthorizedException('Token inválido ou expirado');
 * }
 * 
 * if (!user || !isValidPassword(password, user.senha)) {
 *   throw new UnauthorizedException('Credenciais inválidas', 'INVALID_CREDENTIALS');
 * }
 * ```
 */
export class UnauthorizedException extends BaseException {
  /**
   * Cria uma nova UnauthorizedException
   * 
   * @param message - Mensagem de erro descritiva (padrão: 'Não autorizado')
   * @param code - Código de erro único (padrão: 'UNAUTHORIZED')
   * @param details - Detalhes adicionais (opcional)
   */
  constructor(
    message: string = 'Não autorizado',
    code: string = 'UNAUTHORIZED',
    details?: any
  ) {
    super(message, 401, code, details);
  }
}
