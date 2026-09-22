/**
 * Decorator para marcar métodos que não requerem tenant
 * 
 * Use este decorator em métodos de repositórios ou services que precisam
 * acessar dados sem filtro de tenant (ex: login, busca de usuário por email).
 * 
 * @example
 * ```typescript
 * class UsuarioRepository extends BaseRepository<Usuario> {
 *   @NoTenantRequired()
 *   async findByEmail(email: string): Promise<Usuario | null> {
 *     return await this.findOneWithoutTenant({ where: { email } });
 *   }
 * }
 * ```
 */

/**
 * Decorator para marcar métodos que não requerem tenant
 * 
 * Este decorator adiciona uma propriedade ao método indicando que
 * ele não deve aplicar filtros de tenant.
 */
export function NoTenantRequired() {
  return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    // Marcar o método como não requerendo tenant
    if (!descriptor) {
      descriptor = Object.getOwnPropertyDescriptor(target, propertyKey) || {};
    }
    
    // Adicionar flag ao descriptor
    (descriptor as any).__noTenantRequired = true;
    
    return descriptor;
  };
}

/**
 * Verifica se um método foi marcado como não requerendo tenant
 * 
 * @param target - Classe ou instância
 * @param propertyKey - Nome do método
 * @returns true se o método não requer tenant, false caso contrário
 */
export function isNoTenantRequired(target: any, propertyKey: string): boolean {
  const descriptor = Object.getOwnPropertyDescriptor(target, propertyKey);
  return !!(descriptor as any)?.__noTenantRequired;
}
