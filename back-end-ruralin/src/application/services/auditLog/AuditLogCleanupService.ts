/**
 * AuditLogCleanupService - Serviço de limpeza de logs de auditoria
 * 
 * Fornece métodos para limpar logs de auditoria antigos conforme política de retenção.
 * 
 * @example
 * ```typescript
 * import { container } from '../../core/di';
 * import { TYPES } from '../../core/di/types';
 * import { IAuditLogCleanupService } from './IAuditLogCleanupService';
 * 
 * const service = container.resolve<IAuditLogCleanupService>(TYPES.IAuditLogCleanupService);
 * const deleted = await service.cleanupOldLogs();
 * console.log(`Deleted ${deleted} old audit logs`);
 * ```
 */

import { Injectable, Inject } from '../../../core/di';
import { TYPES } from '../../../core/di/types';
import { IAuditLogCleanupService } from './IAuditLogCleanupService';
import { IAuditLogRepository } from '../../../infrastructure/repository/IAuditLogRepository';
import { ILogger } from '../../../core/logger/ILogger';

/**
 * Serviço de limpeza de logs de auditoria
 * 
 * Implementa IAuditLogCleanupService para fornecer métodos de limpeza
 * de logs antigos conforme política de retenção configurada.
 */
@Injectable()
export class AuditLogCleanupService implements IAuditLogCleanupService {
  /**
   * Número de dias de retenção padrão (365 dias = 1 ano)
   */
  private readonly DEFAULT_RETENTION_DAYS = 365;

  constructor(
    @Inject(TYPES.IAuditLogRepository)
    private repository: IAuditLogRepository,
    @Inject(TYPES.ILogger)
    private logger: ILogger
  ) {}

  /**
   * Limpa logs de auditoria antigos conforme política de retenção
   * 
   * @param retentionDays - Número de dias de retenção (opcional, usa variável de ambiente ou padrão)
   * @returns Promise que resolve com número de logs deletados
   */
  async cleanupOldLogs(retentionDays?: number): Promise<number> {
    // Obter dias de retenção: parâmetro > variável de ambiente > padrão
    const days = retentionDays || 
                 parseInt(process.env.AUDIT_LOG_RETENTION_DAYS || '', 10) || 
                 this.DEFAULT_RETENTION_DAYS;

    // Calcular data limite
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);
    cutoffDate.setHours(0, 0, 0, 0); // Início do dia

    this.logger.info(`Starting audit log cleanup: deleting logs older than ${days} days (before ${cutoffDate.toISOString()})`);

    try {
      const deleted = await this.repository.deleteOlderThan(cutoffDate);

      this.logger.info(`Audit log cleanup completed: ${deleted} logs deleted`, {
        retentionDays: days,
        cutoffDate: cutoffDate.toISOString(),
        deletedCount: deleted,
      });

      return deleted;
    } catch (error: any) {
      this.logger.error(`Failed to cleanup audit logs: ${error.message}`, {
        error,
        retentionDays: days,
        cutoffDate: cutoffDate.toISOString(),
      });
      throw error;
    }
  }

  /**
   * Obtém a política de retenção atual
   * 
   * @returns Número de dias de retenção configurado
   */
  getRetentionDays(): number {
    return parseInt(process.env.AUDIT_LOG_RETENTION_DAYS || '', 10) || this.DEFAULT_RETENTION_DAYS;
  }

  /**
   * Calcula a data limite para retenção
   * 
   * @param retentionDays - Número de dias de retenção (opcional)
   * @returns Data limite (logs anteriores a esta data devem ser deletados)
   */
  getCutoffDate(retentionDays?: number): Date {
    const days = retentionDays || this.getRetentionDays();
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);
    cutoffDate.setHours(0, 0, 0, 0);
    return cutoffDate;
  }
}
