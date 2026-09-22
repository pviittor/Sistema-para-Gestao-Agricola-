/**
 * IAuthorizationPolicy - Interface para Políticas de Autorização Customizadas
 * 
 * Define o contrato para políticas de autorização que permitem regras complexas
 * além de simples verificação de permissões e roles.
 * 
 * Políticas são úteis para regras como:
 * - Usuário só pode editar seus próprios recursos
 * - Usuário só pode acessar recursos do mesmo tenant
 * - Regras de negócio específicas
 * 
 * @example
 * ```typescript
 * export class OwnerPolicy implements IAuthorizationPolicy {
 *   name = 'owner';
 * 
 *   async check(context: AuthorizationContext): Promise<boolean> {
 *     return context.resource?.userId === context.userId;
 *   }
 * }
 * ```
 */

/**
 * Contexto de autorização passado para políticas
 * 
 * Contém informações necessárias para verificação de políticas:
 * - userId: ID do usuário que está tentando acessar
 * - resourceId: ID do recurso sendo acessado (opcional)
 * - resource: Recurso completo sendo acessado (opcional)
 * - Outras propriedades customizadas conforme necessário
 */
export interface AuthorizationContext {
  /**
   * ID do usuário que está tentando acessar o recurso
   */
  userId: number;

  /**
   * ID do recurso sendo acessado (opcional)
   * Útil quando apenas o ID está disponível
   */
  resourceId?: number;

  /**
   * Recurso completo sendo acessado (opcional)
   * Útil quando o recurso completo está disponível
   */
  resource?: any;

  /**
   * Permite propriedades adicionais para políticas customizadas
   */
  [key: string]: any;
}

/**
 * Interface para Políticas de Autorização
 * 
 * Políticas permitem implementar regras de autorização complexas
 * que vão além de simples verificação de permissões ou roles.
 */
export interface IAuthorizationPolicy {
  /**
   * Nome único da política
   * 
   * Usado para registrar e resolver políticas do sistema
   * 
   * @example
   * ```typescript
   * name = 'owner';
   * ```
   */
  name: string;

  /**
   * Verifica se o contexto atende aos critérios da política
   * 
   * @param context - Contexto de autorização com informações do usuário e recurso
   * @returns Promise que resolve com true se a política for satisfeita, false caso contrário
   * 
   * @example
   * ```typescript
   * async check(context: AuthorizationContext): Promise<boolean> {
   *   if (!context.resource || !context.resource.userId) {
   *     return false;
   *   }
   *   return context.resource.userId === context.userId;
   * }
   * ```
   */
  check(context: AuthorizationContext): Promise<boolean>;
}
