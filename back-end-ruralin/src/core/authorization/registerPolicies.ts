/**
 * Registro de Políticas de Autorização Padrão
 * 
 * Este arquivo registra as políticas de autorização padrão do sistema.
 * Deve ser chamado durante a inicialização da aplicação.
 * 
 * @example
 * ```typescript
 * import { registerDefaultPolicies } from './core/authorization/registerPolicies';
 * 
 * registerDefaultPolicies();
 * ```
 */

import { PolicyRegistry } from './PolicyRegistry';
import { OwnerPolicy } from './policies/OwnerPolicy';
import { SameTenantPolicy } from './policies/SameTenantPolicy';

/**
 * Registra as políticas de autorização padrão do sistema
 * 
 * Políticas registradas:
 * - 'owner': Verifica se usuário é dono do recurso
 * - 'sameTenant': Verifica se usuário e recurso pertencem ao mesmo tenant
 * 
 * Esta função deve ser chamada durante a inicialização da aplicação,
 * antes de usar decorators @RequirePolicy.
 */
export function registerDefaultPolicies(): void {
  // Registrar OwnerPolicy
  PolicyRegistry.register(new OwnerPolicy());

  // Registrar SameTenantPolicy
  PolicyRegistry.register(new SameTenantPolicy());

  console.log('Políticas de autorização padrão registradas:', PolicyRegistry.list());
}
