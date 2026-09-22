/**
 * AuditLogQueryService - Serviço de consulta de logs de auditoria
 * 
 * Fornece métodos para consultar logs de auditoria com filtros avançados,
 * paginação e combinações de critérios.
 * 
 * @example
 * ```typescript
 * import { container } from '../../core/di';
 * import { TYPES } from '../../core/di/types';
 * import { IAuditLogQueryService } from './IAuditLogQueryService';
 * 
 * const service = container.resolve<IAuditLogQueryService>(TYPES.IAuditLogQueryService);
 * const logs = await service.query({
 *   userId: 1,
 *   entity: 'Usuario',
 *   startDate: new Date('2025-01-01'),
 *   endDate: new Date('2025-01-31')
 * });
 * ```
 */

import { Injectable, Inject } from '../../../core/di';
import { TYPES } from '../../../core/di/types';
import { IAuditLogQueryService } from './IAuditLogQueryService';
import { IAuditLogRepository } from '../../../infrastructure/repository/IAuditLogRepository';
import { AuditLogQueryDto, AuditLogResponseDto } from '../../dto/auditLog/AuditLogQueryDto';
import { PaginatedResult } from '../../../core/repository/types';
import { AuditAction } from '../../../models/AuditLog';
import AuditLog from '../../../models/AuditLog';
import { Op } from 'sequelize';

/**
 * Serviço de consulta de logs de auditoria
 * 
 * Implementa IAuditLogQueryService para fornecer métodos de consulta
 * com filtros avançados e paginação.
 */
@Injectable()
export class AuditLogQueryService implements IAuditLogQueryService {
  constructor(
    @Inject(TYPES.IAuditLogRepository)
    private repository: IAuditLogRepository
  ) {}

  /**
   * Consulta logs de auditoria com filtros avançados
   * 
   * @param filters - Filtros de consulta
   * @returns Promise que resolve com resultado paginado de logs
   */
  async query(filters: AuditLogQueryDto): Promise<PaginatedResult<AuditLogResponseDto>> {
    const page = filters.page || 1;
    const limit = filters.limit || 10;
    const offset = (page - 1) * limit;

    // Construir condições WHERE
    const where: any = {};

    if (filters.userId !== undefined) {
      where.userId = filters.userId;
    }

    if (filters.entity) {
      where.entity = filters.entity;
    }

    if (filters.entityId !== undefined) {
      where.entityId = filters.entityId;
    }

    if (filters.action) {
      where.action = filters.action;
    }

    if (filters.ip) {
      where.ip = filters.ip;
    }

    // Filtro de data
    if (filters.startDate || filters.endDate) {
      const startDate = filters.startDate
        ? (typeof filters.startDate === 'string' ? new Date(filters.startDate) : filters.startDate)
        : new Date(0); // Data mínima se não fornecido
      
      const endDate = filters.endDate
        ? (typeof filters.endDate === 'string' ? new Date(filters.endDate) : filters.endDate)
        : new Date(); // Data atual se não fornecido

      // Ajustar fim para incluir todo o dia (23:59:59.999)
      const endDateAdjusted = new Date(endDate);
      endDateAdjusted.setHours(23, 59, 59, 999);

      where.timestamp = {
        [Op.between]: [startDate, endDateAdjusted],
      };
    }

    // Buscar com paginação
    const result = await this.repository.findAllPaginated(page, limit, {
      where,
      order: [['timestamp', 'DESC']],
    });

    return {
      ...result,
      data: result.data.map(log => this.toDto(log)),
    };
  }

  /**
   * Busca logs por usuário
   * 
   * @param userId - ID do usuário
   * @param page - Número da página (padrão: 1)
   * @param limit - Limite de registros por página (padrão: 10)
   * @returns Promise que resolve com resultado paginado de logs
   */
  async findByUser(userId: number, page: number = 1, limit: number = 10): Promise<PaginatedResult<AuditLogResponseDto>> {
    const result = await this.repository.findAllPaginated(page, limit, {
      where: { userId },
      order: [['timestamp', 'DESC']],
    });

    return {
      ...result,
      data: result.data.map(log => this.toDto(log)),
    };
  }

  /**
   * Busca logs por entidade
   * 
   * @param entity - Nome da entidade
   * @param entityId - ID da entidade (opcional)
   * @param page - Número da página (padrão: 1)
   * @param limit - Limite de registros por página (padrão: 10)
   * @returns Promise que resolve com resultado paginado de logs
   */
  async findByEntity(
    entity: string,
    entityId?: number,
    page: number = 1,
    limit: number = 10
  ): Promise<PaginatedResult<AuditLogResponseDto>> {
    const where: any = { entity };
    if (entityId !== undefined) {
      where.entityId = entityId;
    }

    const result = await this.repository.findAllPaginated(page, limit, {
      where,
      order: [['timestamp', 'DESC']],
    });

    return {
      ...result,
      data: result.data.map(log => this.toDto(log)),
    };
  }

  /**
   * Busca logs por ação
   * 
   * @param action - Tipo de ação
   * @param page - Número da página (padrão: 1)
   * @param limit - Limite de registros por página (padrão: 10)
   * @returns Promise que resolve com resultado paginado de logs
   */
  async findByAction(action: AuditAction, page: number = 1, limit: number = 10): Promise<PaginatedResult<AuditLogResponseDto>> {
    const result = await this.repository.findAllPaginated(page, limit, {
      where: { action },
      order: [['timestamp', 'DESC']],
    });

    return {
      ...result,
      data: result.data.map(log => this.toDto(log)),
    };
  }

  /**
   * Busca logs por período
   * 
   * @param startDate - Data de início (inclusive)
   * @param endDate - Data de fim (inclusive)
   * @param page - Número da página (padrão: 1)
   * @param limit - Limite de registros por página (padrão: 10)
   * @returns Promise que resolve com resultado paginado de logs
   */
  async findByDateRange(
    startDate: Date | string,
    endDate: Date | string,
    page: number = 1,
    limit: number = 10
  ): Promise<PaginatedResult<AuditLogResponseDto>> {
    const inicio = typeof startDate === 'string' ? new Date(startDate) : startDate;
    const fim = typeof endDate === 'string' ? new Date(endDate) : endDate;

    // Ajustar fim para incluir todo o dia (23:59:59.999)
    const fimAjustado = new Date(fim);
    fimAjustado.setHours(23, 59, 59, 999);

    const result = await this.repository.findAllPaginated(page, limit, {
      where: {
        timestamp: {
          [Op.between]: [inicio, fimAjustado],
        },
      },
      order: [['timestamp', 'DESC']],
    });

    return {
      ...result,
      data: result.data.map(log => this.toDto(log)),
    };
  }

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
  async findByUserAndDateRange(
    userId: number,
    startDate: Date | string,
    endDate: Date | string,
    page: number = 1,
    limit: number = 10
  ): Promise<PaginatedResult<AuditLogResponseDto>> {
    const inicio = typeof startDate === 'string' ? new Date(startDate) : startDate;
    const fim = typeof endDate === 'string' ? new Date(endDate) : endDate;

    // Ajustar fim para incluir todo o dia (23:59:59.999)
    const fimAjustado = new Date(fim);
    fimAjustado.setHours(23, 59, 59, 999);

    const result = await this.repository.findAllPaginated(page, limit, {
      where: {
        userId,
        timestamp: {
          [Op.between]: [inicio, fimAjustado],
        },
      },
      order: [['timestamp', 'DESC']],
    });

    return {
      ...result,
      data: result.data.map(log => this.toDto(log)),
    };
  }

  /**
   * Busca um log por ID
   * 
   * @param id - ID do log
   * @returns Promise que resolve com o log encontrado ou null
   */
  async getById(id: number | string): Promise<AuditLogResponseDto | null> {
    const log = await this.repository.findById(id);
    return log ? this.toDto(log) : null;
  }

  /**
   * Converte entidade AuditLog para DTO
   * 
   * @param log - Entidade AuditLog
   * @returns DTO de resposta
   */
  private toDto(log: AuditLog): AuditLogResponseDto {
    return {
      id: log.id,
      userId: log.userId,
      action: log.action,
      entity: log.entity,
      entityId: log.entityId,
      changes: log.changes,
      ip: log.ip,
      userAgent: log.userAgent,
      timestamp: log.timestamp,
      createdAt: log.createdAt,
      updatedAt: log.updatedAt,
    };
  }
}
