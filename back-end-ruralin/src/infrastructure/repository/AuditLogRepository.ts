/**
 * AuditLogRepository - Repositório para entidade AuditLog
 * 
 * Implementa IAuditLogRepository estendendo BaseRepository e adiciona
 * métodos específicos para busca de logs de auditoria.
 * 
 * @example
 * ```typescript
 * import { AuditLogRepository } from './AuditLogRepository';
 * 
 * const repository = new AuditLogRepository();
 * const logs = await repository.findByUsuario(1);
 * ```
 */

import { Injectable, Inject } from '../../core/di';
import { TYPES } from '../../core/di/types';
import { BaseRepository } from '../../core/repository/BaseRepository';
import { IAuditLogRepository } from './IAuditLogRepository';
import { ICacheService } from '../../core/cache/ICacheService';
import { ITenantService } from '../../core/tenant/ITenantService';
import AuditLog, { AuditAction } from '../../models/AuditLog';
import { Op } from 'sequelize';
import sequelize from '../../config/database';

/**
 * Repositório para entidade AuditLog
 * 
 * Estende BaseRepository para fornecer métodos CRUD padrão e adiciona
 * métodos específicos para busca de logs de auditoria.
 */
@Injectable()
export class AuditLogRepository extends BaseRepository<AuditLog> implements IAuditLogRepository {
  /**
   * Construtor do repositório
   * 
   * Inicializa o BaseRepository com o modelo AuditLog, cacheService e tenantService.
   */
  constructor(
    @Inject(TYPES.ICacheService) cacheService: ICacheService,
    @Inject(TYPES.ITenantService) tenantService: ITenantService
  ) {
    super(AuditLog, cacheService, tenantService);
  }

  /**
   * Busca logs de auditoria por usuário
   * 
   * @param userId - ID do usuário
   * @param limit - Limite de registros (opcional, padrão: 100)
   * @returns Promise que resolve com array de logs do usuário ordenados por timestamp (DESC)
   */
  async findByUsuario(userId: number, limit: number = 100): Promise<AuditLog[]> {
    return await this.findAll({
      where: { userId },
      order: [['timestamp', 'DESC']],
      limit,
    });
  }

  /**
   * Busca logs de auditoria por entidade
   * 
   * @param entity - Nome da entidade (ex: 'Usuario', 'Evento')
   * @param entityId - ID da entidade (opcional)
   * @param limit - Limite de registros (opcional, padrão: 100)
   * @returns Promise que resolve com array de logs da entidade ordenados por timestamp (DESC)
   */
  async findByEntity(entity: string, entityId?: number, limit: number = 100): Promise<AuditLog[]> {
    const where: any = { entity };
    
    if (entityId !== undefined) {
      where.entityId = entityId;
    }

    return await this.findAll({
      where,
      order: [['timestamp', 'DESC']],
      limit,
    });
  }

  /**
   * Busca logs de auditoria por ação
   * 
   * @param action - Tipo de ação (CREATE, UPDATE, DELETE, etc.)
   * @param limit - Limite de registros (opcional, padrão: 100)
   * @returns Promise que resolve com array de logs da ação ordenados por timestamp (DESC)
   */
  async findByAction(action: AuditAction, limit: number = 100): Promise<AuditLog[]> {
    return await this.findAll({
      where: { action },
      order: [['timestamp', 'DESC']],
      limit,
    });
  }

  /**
   * Busca logs de auditoria por período
   * 
   * @param dataInicio - Data de início do período (inclusive)
   * @param dataFim - Data de fim do período (inclusive)
   * @param limit - Limite de registros (opcional, padrão: 1000)
   * @returns Promise que resolve com array de logs no período ordenados por timestamp (DESC)
   */
  async findByPeriodo(
    dataInicio: Date | string,
    dataFim: Date | string,
    limit: number = 1000
  ): Promise<AuditLog[]> {
    const inicio = typeof dataInicio === 'string' ? new Date(dataInicio) : dataInicio;
    const fim = typeof dataFim === 'string' ? new Date(dataFim) : dataFim;

    // Ajustar fim para incluir todo o dia (23:59:59.999)
    const fimAjustado = new Date(fim);
    fimAjustado.setHours(23, 59, 59, 999);

    return await this.findAll({
      where: {
        timestamp: {
          [Op.between]: [inicio, fimAjustado],
        },
      },
      order: [['timestamp', 'DESC']],
      limit,
    });
  }

  /**
   * Busca logs de auditoria por usuário e período
   * 
   * @param userId - ID do usuário
   * @param dataInicio - Data de início do período (inclusive)
   * @param dataFim - Data de fim do período (inclusive)
   * @param limit - Limite de registros (opcional, padrão: 1000)
   * @returns Promise que resolve com array de logs do usuário no período ordenados por timestamp (DESC)
   */
  async findByUsuarioAndPeriodo(
    userId: number,
    dataInicio: Date | string,
    dataFim: Date | string,
    limit: number = 1000
  ): Promise<AuditLog[]> {
    const inicio = typeof dataInicio === 'string' ? new Date(dataInicio) : dataInicio;
    const fim = typeof dataFim === 'string' ? new Date(dataFim) : dataFim;

    // Ajustar fim para incluir todo o dia (23:59:59.999)
    const fimAjustado = new Date(fim);
    fimAjustado.setHours(23, 59, 59, 999);

    return await this.findAll({
      where: {
        userId,
        timestamp: {
          [Op.between]: [inicio, fimAjustado],
        },
      },
      order: [['timestamp', 'DESC']],
      limit,
    });
  }

  /**
   * Deleta logs de auditoria mais antigos que a data especificada
   * 
   * IMPORTANTE: Filtra automaticamente por tenantId para garantir isolamento de dados.
   * 
   * @param cutoffDate - Data limite (logs anteriores a esta data serão deletados)
   * @returns Promise que resolve com número de logs deletados
   */
  async deleteOlderThan(cutoffDate: Date): Promise<number> {
    const tenantFilter = this.getTenantFilter();
    if (!tenantFilter) {
      throw new Error('Tenant não identificado. Não é possível deletar logs sem tenantId.');
    }

    const result = await AuditLog.destroy({
      where: {
        ...tenantFilter,
        timestamp: {
          [Op.lt]: cutoffDate,
        },
      },
    });

    return result;
  }
}
