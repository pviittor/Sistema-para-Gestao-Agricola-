/**
 * IAuditLogQueryService - Interface para serviço de consulta de logs de auditoria
 * 
 * Define métodos para consultar logs de auditoria com filtros avançados,
 * paginação e combinações de critérios.
 * 
 * @example
 * ```typescript
 * import { IAuditLogQueryService } from './IAuditLogQueryService';
 * 
 * @Injectable()
 * class MeuService {
 *   constructor(
 *     @Inject(TYPES.IAuditLogQueryService)
 *     private auditLogQueryService: IAuditLogQueryService
 *   ) {}
 * 
 *   async buscarLogs() {
 *     const logs = await this.auditLogQueryService.query({
 *       userId: 1,
 *       startDate: new Date('2025-01-01'),
 *       endDate: new Date('2025-01-31')
 *     });
 *   }
 * }
 * ```
 */

import { PaginatedResult } from '../../../core/repository/types';
import { AuditLogQueryDto, AuditLogResponseDto } from '../../dto/auditLog/AuditLogQueryDto';
import { AuditAction } from '../../../models/AuditLog';

/**
 * Interface para serviço de consulta de logs de auditoria
 * 
 * Define métodos para consultar logs com diferentes filtros e combinações.
 */
export interface IAuditLogQueryService {
  /**
   * Consulta logs de auditoria com filtros avançados
   * 
   * @param filters - Filtros de consulta
   * @returns Promise que resolve com resultado paginado de logs
   * 
   * @example
   * ```typescript
   * const result = await auditLogQueryService.query({
   *   userId: 1,
   *   entity: 'Usuario',
   *   startDate: new Date('2025-01-01'),
   *   endDate: new Date('2025-01-31'),
   *   page: 1,
   *   limit: 20
   * });
   * ```
   */
  query(filters: AuditLogQueryDto): Promise<PaginatedResult<AuditLogResponseDto>>;

  /**
   * Busca logs por usuário
   * 
   * @param userId - ID do usuário
   * @param page - Número da página (padrão: 1)
   * @param limit - Limite de registros por página (padrão: 10)
   * @returns Promise que resolve com resultado paginado de logs
   */
  findByUser(userId: number, page?: number, limit?: number): Promise<PaginatedResult<AuditLogResponseDto>>;

  /**
   * Busca logs por entidade
   * 
   * @param entity - Nome da entidade
   * @param entityId - ID da entidade (opcional)
   * @param page - Número da página (padrão: 1)
   * @param limit - Limite de registros por página (padrão: 10)
   * @returns Promise que resolve com resultado paginado de logs
   */
  findByEntity(entity: string, entityId?: number, page?: number, limit?: number): Promise<PaginatedResult<AuditLogResponseDto>>;

  /**
   * Busca logs por ação
   * 
   * @param action - Tipo de ação
   * @param page - Número da página (padrão: 1)
   * @param limit - Limite de registros por página (padrão: 10)
   * @returns Promise que resolve com resultado paginado de logs
   */
  findByAction(action: AuditAction, page?: number, limit?: number): Promise<PaginatedResult<AuditLogResponseDto>>;

  /**
   * Busca logs por período
   * 
   * @param startDate - Data de início (inclusive)
   * @param endDate - Data de fim (inclusive)
   * @param page - Número da página (padrão: 1)
   * @param limit - Limite de registros por página (padrão: 10)
   * @returns Promise que resolve com resultado paginado de logs
   */
  findByDateRange(startDate: Date | string, endDate: Date | string, page?: number, limit?: number): Promise<PaginatedResult<AuditLogResponseDto>>;

  /**
   * Busca logs por usuário e período
   * 
   * @param userId - ID do usuário
   * @param startDate - Data de início (inclusive)
   * @param endDate - Data de fim (inclusive)
   * @param page - Número da página (padrão: 1)
   * @param limit - Limite de registros por página (padrão: 10)
   * @returns Promise que resolve com resultado paginado de logs
   */
  findByUserAndDateRange(
    userId: number,
    startDate: Date | string,
    endDate: Date | string,
    page?: number,
    limit?: number
  ): Promise<PaginatedResult<AuditLogResponseDto>>;

  /**
   * Busca um log por ID
   * 
   * @param id - ID do log
   * @returns Promise que resolve com o log encontrado ou null
   */
  getById(id: number | string): Promise<AuditLogResponseDto | null>;
}
