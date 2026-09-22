/**
 * IAuditLogRepository - Interface para repositório de AuditLog
 * 
 * Esta interface estende IRepository<AuditLog> e adiciona métodos específicos
 * para busca de logs de auditoria por usuário, entidade, período, etc.
 * 
 * @example
 * ```typescript
 * import { IAuditLogRepository } from './IAuditLogRepository';
 * 
 * @Injectable()
 * class AuditService {
 *   constructor(
 *     @Inject(TYPES.IAuditLogRepository)
 *     private repository: IAuditLogRepository
 *   ) {}
 * 
 *   async getByUsuario(usuarioId: number) {
 *     return await this.repository.findByUsuario(usuarioId);
 *   }
 * }
 * ```
 */

import { IRepository } from '../../core/repository/IRepository';
import AuditLog from '../../models/AuditLog';
import { AuditAction } from '../../models/AuditLog';

/**
 * Interface para repositório de AuditLog
 * 
 * Define métodos específicos para busca de logs de auditoria além dos métodos
 * padrão da interface IRepository.
 */
export interface IAuditLogRepository extends IRepository<AuditLog> {
  /**
   * Busca logs de auditoria por usuário
   * 
   * @param userId - ID do usuário
   * @param limit - Limite de registros (opcional)
   * @returns Promise que resolve com array de logs do usuário
   * 
   * @example
   * ```typescript
   * const logs = await auditLogRepository.findByUsuario(1, 100);
   * ```
   */
  findByUsuario(userId: number, limit?: number): Promise<AuditLog[]>;

  /**
   * Busca logs de auditoria por entidade
   * 
   * @param entity - Nome da entidade (ex: 'Usuario', 'Evento')
   * @param entityId - ID da entidade (opcional)
   * @param limit - Limite de registros (opcional)
   * @returns Promise que resolve com array de logs da entidade
   * 
   * @example
   * ```typescript
   * const logs = await auditLogRepository.findByEntity('Usuario', 123);
   * ```
   */
  findByEntity(entity: string, entityId?: number, limit?: number): Promise<AuditLog[]>;

  /**
   * Busca logs de auditoria por ação
   * 
   * @param action - Tipo de ação (CREATE, UPDATE, DELETE, etc.)
   * @param limit - Limite de registros (opcional)
   * @returns Promise que resolve com array de logs da ação
   * 
   * @example
   * ```typescript
   * const logs = await auditLogRepository.findByAction('DELETE', 50);
   * ```
   */
  findByAction(action: AuditAction, limit?: number): Promise<AuditLog[]>;

  /**
   * Busca logs de auditoria por período
   * 
   * @param dataInicio - Data de início do período (inclusive)
   * @param dataFim - Data de fim do período (inclusive)
   * @param limit - Limite de registros (opcional)
   * @returns Promise que resolve com array de logs no período
   * 
   * @example
   * ```typescript
   * const logs = await auditLogRepository.findByPeriodo(
   *   new Date('2025-01-01'),
   *   new Date('2025-01-31')
   * );
   * ```
   */
  findByPeriodo(dataInicio: Date | string, dataFim: Date | string, limit?: number): Promise<AuditLog[]>;

  /**
   * Busca logs de auditoria por usuário e período
   * 
   * @param userId - ID do usuário
   * @param dataInicio - Data de início do período (inclusive)
   * @param dataFim - Data de fim do período (inclusive)
   * @param limit - Limite de registros (opcional)
   * @returns Promise que resolve com array de logs do usuário no período
   * 
   * @example
   * ```typescript
   * const logs = await auditLogRepository.findByUsuarioAndPeriodo(
   *   1,
   *   new Date('2025-01-01'),
   *   new Date('2025-01-31')
   * );
   * ```
   */
  findByUsuarioAndPeriodo(
    userId: number,
    dataInicio: Date | string,
    dataFim: Date | string,
    limit?: number
  ): Promise<AuditLog[]>;

  /**
   * Deleta logs de auditoria mais antigos que a data especificada
   * 
   * @param cutoffDate - Data limite (logs anteriores a esta data serão deletados)
   * @returns Promise que resolve com número de logs deletados
   * 
   * @example
   * ```typescript
   * const cutoffDate = new Date();
   * cutoffDate.setDate(cutoffDate.getDate() - 365); // 365 dias atrás
   * const deleted = await auditLogRepository.deleteOlderThan(cutoffDate);
   * console.log(`Deleted ${deleted} audit logs`);
   * ```
   */
  deleteOlderThan(cutoffDate: Date): Promise<number>;
}
