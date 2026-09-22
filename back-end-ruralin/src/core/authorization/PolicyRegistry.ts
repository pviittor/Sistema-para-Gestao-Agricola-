/**
 * PolicyRegistry - Registro de Políticas de Autorização
 * 
 * Sistema centralizado para registro e resolução de políticas de autorização.
 * Permite registrar políticas customizadas e resolvê-las por nome.
 * 
 * @example
 * ```typescript
 * import { PolicyRegistry } from './PolicyRegistry';
 * import { OwnerPolicy } from './policies/OwnerPolicy';
 * 
 * // Registrar política
 * PolicyRegistry.register(new OwnerPolicy());
 * 
 * // Resolver política
 * const policy = PolicyRegistry.resolve('owner');
 * ```
 */

import { IAuthorizationPolicy } from './IAuthorizationPolicy';

/**
 * Registro de políticas de autorização
 * 
 * Armazena políticas registradas por nome para resolução posterior.
 */
class PolicyRegistryClass {
  private policies: Map<string, IAuthorizationPolicy> = new Map();

  /**
   * Registra uma política de autorização
   * 
   * @param policy - Política a ser registrada
   * @throws Error se política com mesmo nome já estiver registrada
   * 
   * @example
   * ```typescript
   * PolicyRegistry.register(new OwnerPolicy());
   * ```
   */
  register(policy: IAuthorizationPolicy): void {
    if (this.policies.has(policy.name)) {
      throw new Error(`Política '${policy.name}' já está registrada`);
    }
    this.policies.set(policy.name, policy);
  }

  /**
   * Resolve uma política por nome
   * 
   * @param name - Nome da política
   * @returns Política encontrada ou undefined se não existir
   * 
   * @example
   * ```typescript
   * const policy = PolicyRegistry.resolve('owner');
   * if (policy) {
   *   const allowed = await policy.check(context);
   * }
   * ```
   */
  resolve(name: string): IAuthorizationPolicy | undefined {
    return this.policies.get(name);
  }

  /**
   * Verifica se uma política está registrada
   * 
   * @param name - Nome da política
   * @returns true se política está registrada, false caso contrário
   */
  has(name: string): boolean {
    return this.policies.has(name);
  }

  /**
   * Lista todas as políticas registradas
   * 
   * @returns Array com nomes de todas as políticas registradas
   */
  list(): string[] {
    return Array.from(this.policies.keys());
  }

  /**
   * Remove uma política do registro
   * 
   * @param name - Nome da política a ser removida
   * @returns true se política foi removida, false se não existia
   */
  unregister(name: string): boolean {
    return this.policies.delete(name);
  }

  /**
   * Limpa todas as políticas registradas
   * 
   * Útil para testes
   */
  clear(): void {
    this.policies.clear();
  }
}

/**
 * Instância singleton do registro de políticas
 */
export const PolicyRegistry = new PolicyRegistryClass();
