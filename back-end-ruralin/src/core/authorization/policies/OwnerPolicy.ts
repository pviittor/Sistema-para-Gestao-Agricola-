/**
 * OwnerPolicy - Política de Autorização: Dono do Recurso
 * 
 * Verifica se o usuário é o dono do recurso sendo acessado.
 * Útil para garantir que usuários só possam editar/deletar seus próprios recursos.
 * 
 * @example
 * ```typescript
 * // Registrar política
 * PolicyRegistry.register(new OwnerPolicy());
 * 
 * // Usar em decorator
 * @RequirePolicy('owner')
 * async update(id: number, dto: UpdateDto): Promise<ResponseDto> {
 *   const resource = await this.repository.findById(id);
 *   // Política verifica se resource.userId === userId do contexto
 * }
 * ```
 */

import { IAuthorizationPolicy, AuthorizationContext } from '../IAuthorizationPolicy';

/**
 * Política que verifica se o usuário é dono do recurso
 * 
 * Verifica se o recurso possui uma propriedade que identifica o dono (`userId` ou `usuarioId`)
 * e se corresponde ao `userId` do contexto de autorização.
 * 
 * Suporta múltiplas convenções de nomenclatura:
 * - `userId`: Convenção padrão
 * - `usuarioId`: Convenção usada em alguns modelos do sistema
 */
export class OwnerPolicy implements IAuthorizationPolicy {
  /**
   * Nome único da política
   */
  name = 'owner';

  /**
   * Verifica se o usuário é dono do recurso
   * 
   * @param context - Contexto de autorização
   * @returns Promise que resolve com true se usuário é dono, false caso contrário
   * 
   * Verifica:
   * - Se recurso existe
   * - Se recurso possui propriedade `userId` ou `usuarioId`
   * - Se propriedade do recurso corresponde a `context.userId`
   */
  async check(context: AuthorizationContext): Promise<boolean> {
    // Se não houver recurso, não pode verificar propriedade de dono
    if (!context.resource) {
      return false;
    }

    // Tentar obter userId do recurso (suporta múltiplas convenções)
    const resourceUserId = context.resource.userId ?? context.resource.usuarioId;

    // Verificar se recurso possui propriedade de dono
    if (resourceUserId === undefined || resourceUserId === null) {
      return false;
    }

    // Verificar se userId do recurso corresponde ao userId do contexto
    return resourceUserId === context.userId;
  }
}
