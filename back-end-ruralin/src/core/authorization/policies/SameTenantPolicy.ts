/**
 * SameTenantPolicy - Política de Autorização: Mesmo Tenant
 * 
 * Verifica se o usuário e o recurso pertencem ao mesmo tenant.
 * Útil para sistemas multi-tenant onde usuários só podem acessar recursos do seu tenant.
 * 
 * @example
 * ```typescript
 * // Registrar política
 * PolicyRegistry.register(new SameTenantPolicy());
 * 
 * // Usar em decorator
 * @RequirePolicy('sameTenant')
 * async update(id: number, dto: UpdateDto): Promise<ResponseDto> {
 *   const resource = await this.repository.findById(id);
 *   // Política verifica se resource.tenantId === tenantId do usuário
 * }
 * ```
 */

import { IAuthorizationPolicy, AuthorizationContext } from '../IAuthorizationPolicy';

/**
 * Política que verifica se usuário e recurso pertencem ao mesmo tenant
 * 
 * Verifica se o recurso possui uma propriedade `tenantId` que corresponde
 * ao `tenantId` do usuário no contexto de autorização.
 * 
 * NOTA: Esta política assume que o contexto possui `tenantId` do usuário.
 * Se o sistema ainda não implementar multi-tenancy completo, esta política
 * pode ser adaptada ou desabilitada.
 */
export class SameTenantPolicy implements IAuthorizationPolicy {
  /**
   * Nome único da política
   */
  name = 'sameTenant';

  /**
   * Verifica se usuário e recurso pertencem ao mesmo tenant
   * 
   * @param context - Contexto de autorização
   * @returns Promise que resolve com true se mesmo tenant, false caso contrário
   * 
   * Verifica:
   * - Se recurso existe
   * - Se recurso possui propriedade `tenantId`
   * - Se contexto possui `tenantId` do usuário
   * - Se `resource.tenantId` corresponde a `context.tenantId`
   */
  async check(context: AuthorizationContext): Promise<boolean> {
    // Se não houver recurso, não pode verificar tenant
    if (!context.resource) {
      return false;
    }

    // Verificar se recurso possui propriedade tenantId
    if (context.resource.tenantId === undefined || context.resource.tenantId === null) {
      // Se recurso não tem tenantId, assumir que não há multi-tenancy
      // Retornar true para não bloquear acesso
      return true;
    }

    // Verificar se contexto possui tenantId do usuário
    if (context.tenantId === undefined || context.tenantId === null) {
      // Se usuário não tem tenantId, assumir que não há multi-tenancy
      // Retornar true para não bloquear acesso
      return true;
    }

    // Verificar se tenantId do recurso corresponde ao tenantId do usuário
    return context.resource.tenantId === context.tenantId;
  }
}
