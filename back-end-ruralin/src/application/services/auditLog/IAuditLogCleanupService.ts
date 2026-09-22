/**
 * IAuditLogCleanupService - Interface para serviço de limpeza de logs de auditoria
 * 
 * Define métodos para limpar logs de auditoria antigos conforme política de retenção.
 * 
 * @example
 * ```typescript
 * import { IAuditLogCleanupService } from './IAuditLogCleanupService';
 * 
 * @Injectable()
 * class MeuService {
 *   constructor(
 *     @Inject(TYPES.IAuditLogCleanupService)
 *     private cleanupService: IAuditLogCleanupService
 *   ) {}
 * 
 *   async limparLogs() {
 *     const deleted = await this.cleanupService.cleanupOldLogs();
 *     console.log(`Deleted ${deleted} logs`);
 *   }
 * }
 * ```
 */

/**
 * Interface para serviço de limpeza de logs de auditoria
 * 
 * Define métodos para limpar logs antigos conforme política de retenção.
 */
export interface IAuditLogCleanupService {
  /**
   * Limpa logs de auditoria antigos conforme política de retenção
   * 
   * @param retentionDays - Número de dias de retenção (opcional, usa variável de ambiente ou padrão)
   * @returns Promise que resolve com número de logs deletados
   * 
   * @example
   * ```typescript
   * // Usar retenção padrão (variável de ambiente ou 365 dias)
   * const deleted = await cleanupService.cleanupOldLogs();
   * 
   * // Usar retenção específica
   * const deleted = await cleanupService.cleanupOldLogs(180); // 180 dias
   * ```
   */
  cleanupOldLogs(retentionDays?: number): Promise<number>;

  /**
   * Obtém a política de retenção atual
   * 
   * @returns Número de dias de retenção configurado
   */
  getRetentionDays(): number;

  /**
   * Calcula a data limite para retenção
   * 
   * @param retentionDays - Número de dias de retenção (opcional)
   * @returns Data limite (logs anteriores a esta data devem ser deletados)
   */
  getCutoffDate(retentionDays?: number): Date;
}
