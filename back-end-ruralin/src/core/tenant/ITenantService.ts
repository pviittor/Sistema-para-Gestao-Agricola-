/**
 * ITenantService - Interface para serviço de gerenciamento de tenants
 * 
 * Este serviço é responsável por:
 * - Gerenciar o tenantId atual da requisição
 * - Validar se um tenant existe
 * - Validar se um usuário tem acesso a um tenant
 * 
 * @example
 * ```typescript
 * const tenantService = container.resolve<ITenantService>(TYPES.ITenantService);
 * 
 * // Definir tenant atual
 * tenantService.setCurrentTenantId(1);
 * 
 * // Obter tenant atual
 * const tenantId = tenantService.getCurrentTenantId();
 * 
 * // Validar tenant
 * const isValid = await tenantService.validateTenant(1);
 * ```
 */

/**
 * Interface para serviço de gerenciamento de tenants
 */
export interface ITenantService {
  /**
   * Obtém o ID do tenant atual da requisição
   * 
   * @returns ID do tenant atual ou null se não definido
   * 
   * @example
   * ```typescript
   * const tenantId = tenantService.getCurrentTenantId();
   * if (tenantId) {
   *   console.log(`Tenant atual: ${tenantId}`);
   * }
   * ```
   */
  getCurrentTenantId(): number | null;

  /**
   * Define o ID do tenant atual da requisição
   * 
   * @param tenantId - ID do tenant a ser definido
   * 
   * @example
   * ```typescript
   * tenantService.setCurrentTenantId(1);
   * ```
   */
  setCurrentTenantId(tenantId: number): void;

  /**
   * Valida se um tenant existe e se o usuário atual tem acesso a ele
   * 
   * @param tenantId - ID do tenant a ser validado
   * @returns Promise que resolve com true se o tenant é válido e o usuário tem acesso, false caso contrário
   * 
   * @example
   * ```typescript
   * const isValid = await tenantService.validateTenant(1);
   * if (!isValid) {
   *   throw new ForbiddenException('Acesso negado ao tenant');
   * }
   * ```
   */
  validateTenant(tenantId: number): Promise<boolean>;

  /**
   * Define o RequestContext para esta instância
   * 
   * Este método deve ser chamado pelo middleware tenantMiddleware
   * para associar o RequestContext da requisição atual.
   * 
   * @param context - RequestContext da requisição atual
   */
  setRequestContext(context: any): void;

  /**
   * Limpa o tenant atual (útil para testes ou mudança de contexto)
   * 
   * @example
   * ```typescript
   * tenantService.clear();
   * ```
   */
  clear(): void;
}
