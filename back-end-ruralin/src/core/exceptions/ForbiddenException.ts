import { BaseException } from './BaseException';

/**
 * ForbiddenException - Exceção para erros de autorização
 * 
 * Use esta exceção quando o usuário estiver autenticado mas não tiver
 * permissão para acessar o recurso ou executar a ação.
 * Status HTTP: 403 (Forbidden)
 * 
 * @example
 * ```typescript
 * if (!user.hasPermission('usuario.delete')) {
 *   throw new ForbiddenException('Você não tem permissão para deletar usuários');
 * }
 * 
 * if (user.role !== 'ADMIN' && resource.userId !== user.id) {
 *   throw new ForbiddenException('Acesso negado a este recurso', 'ACCESS_DENIED');
 * }
 * ```
 */
export class ForbiddenException extends BaseException {
  /**
   * Cria uma nova ForbiddenException
   * 
   * @param message - Mensagem de erro descritiva (padrão: 'Acesso negado')
   * @param code - Código de erro único (padrão: 'FORBIDDEN')
   * @param details - Detalhes adicionais (opcional)
   */
  constructor(
    message: string = 'Acesso negado',
    code: string = 'FORBIDDEN',
    details?: any
  ) {
    super(message, 403, code, details);
  }
}
