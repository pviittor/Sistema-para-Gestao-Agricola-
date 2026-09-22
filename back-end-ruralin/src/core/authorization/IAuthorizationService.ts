/**
 * IAuthorizationService - Interface para Authorization Service
 * 
 * Define o contrato para verificação de permissões e roles de usuários.
 * Este serviço centraliza a lógica de autorização, permitindo verificar
 * se um usuário tem permissões ou roles específicas.
 * 
 * @example
 * ```typescript
 * const authService = container.resolve<IAuthorizationService>(TYPES.IAuthorizationService);
 * 
 * const canCreate = await authService.hasPermission(userId, 'usuario.create');
 * if (!canCreate) {
 *   throw new ForbiddenException('Permissão necessária');
 * }
 * ```
 */

/**
 * Interface para Authorization Service
 * 
 * Define métodos para verificação de permissões e roles de usuários.
 * A implementação deve buscar roles do usuário e permissões das roles
 * para determinar se o usuário tem acesso a recursos específicos.
 */
export interface IAuthorizationService {
  /**
   * Verifica se o usuário tem uma permissão específica
   * 
   * Busca todas as roles do usuário e verifica se alguma delas
   * possui a permissão especificada.
   * 
   * @param userId - ID do usuário
   * @param permission - Nome da permissão (ex: 'usuario.create')
   * @returns Promise que resolve com true se o usuário tem a permissão, false caso contrário
   * 
   * @example
   * ```typescript
   * const hasPermission = await authService.hasPermission(userId, 'usuario.create');
   * ```
   */
  hasPermission(userId: number, permission: string): Promise<boolean>;

  /**
   * Verifica se o usuário tem uma role específica
   * 
   * @param userId - ID do usuário
   * @param role - Nome da role (ex: 'ADMIN')
   * @returns Promise que resolve com true se o usuário tem a role, false caso contrário
   * 
   * @example
   * ```typescript
   * const isAdmin = await authService.hasRole(userId, 'ADMIN');
   * ```
   */
  hasRole(userId: number, role: string): Promise<boolean>;

  /**
   * Verifica se o usuário tem pelo menos uma das roles especificadas (OR)
   * 
   * @param userId - ID do usuário
   * @param roles - Array de nomes de roles
   * @returns Promise que resolve com true se o usuário tem pelo menos uma das roles, false caso contrário
   * 
   * @example
   * ```typescript
   * const hasRole = await authService.hasAnyRole(userId, ['ADMIN', 'MANAGER']);
   * ```
   */
  hasAnyRole(userId: number, roles: string[]): Promise<boolean>;

  /**
   * Verifica se o usuário tem todas as roles especificadas (AND)
   * 
   * @param userId - ID do usuário
   * @param roles - Array de nomes de roles
   * @returns Promise que resolve com true se o usuário tem todas as roles, false caso contrário
   * 
   * @example
   * ```typescript
   * const hasAllRoles = await authService.hasAllRoles(userId, ['ADMIN', 'MANAGER']);
   * ```
   */
  hasAllRoles(userId: number, roles: string[]): Promise<boolean>;

  /**
   * Verifica se o usuário é do tipo GOD (bypass de permissões)
   * 
   * @param userId - ID do usuário
   * @returns Promise que resolve com true se o usuário é GOD, false caso contrário
   * 
   * @example
   * ```typescript
   * const isGod = await authService.isGod(userId);
   * if (isGod) {
   *   // Bypass de validações
   * }
   * ```
   */
  isGod(userId: number): Promise<boolean>;

  /**
   * Verifica se o usuário é do tipo CONSULTOR
   * 
   * @param userId - ID do usuário
   * @returns Promise que resolve com true se o usuário é CONSULTOR, false caso contrário
   * 
   * @example
   * ```typescript
   * const isConsultor = await authService.isConsultor(userId);
   * ```
   */
  isConsultor(userId: number): Promise<boolean>;

  /**
   * Verifica se o usuário pode acessar um tenant específico
   * 
   * @param userId - ID do usuário
   * @param tenantId - ID do tenant
   * @returns Promise que resolve com true se pode acessar, false caso contrário
   * 
   * @example
   * ```typescript
   * const canAccess = await authService.canAccessTenant(userId, tenantId);
   * ```
   */
  canAccessTenant(userId: number, tenantId: number): Promise<boolean>;

  /**
   * Verifica se o usuário pode acessar uma consultoria específica
   * 
   * @param userId - ID do usuário
   * @param consultoriaId - ID da consultoria
   * @returns Promise que resolve com true se pode acessar, false caso contrário
   * 
   * @example
   * ```typescript
   * const canAccess = await authService.canAccessConsultoria(userId, consultoriaId);
   * ```
   */
  canAccessConsultoria(userId: number, consultoriaId: number): Promise<boolean>;
}
