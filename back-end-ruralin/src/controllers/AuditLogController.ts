/**
 * AuditLogController - Controller para consulta de logs de auditoria
 * 
 * Este controller atua como camada HTTP, delegando toda a lógica de consulta
 * para o AuditLogQueryService. Sua responsabilidade é apenas:
 * - Receber requisições HTTP
 * - Extrair parâmetros de query/params
 * - Chamar Query Service
 * - Retornar respostas HTTP
 */

import { Request, Response } from 'express';
import { Injectable, Inject } from '../core/di';
import { TYPES } from '../core/di/types';
import { IAuditLogController } from './interfaces/IAuditLogController';
import { IAuditLogQueryService } from '../application/services/auditLog/IAuditLogQueryService';
import { AuditLogQueryDto } from '../application/dto/auditLog/AuditLogQueryDto';
import { NotFoundException } from '../core/exceptions';

/**
 * Controller para consulta de logs de auditoria
 * 
 * Implementa IAuditLogController para fornecer endpoints HTTP
 * para consulta de logs de auditoria.
 */
@Injectable()
export class AuditLogController implements IAuditLogController {
  constructor(
    @Inject(TYPES.IAuditLogQueryService)
    private queryService: IAuditLogQueryService
  ) {}

  /**
   * Lista logs de auditoria com filtros
   * 
   * GET /api/audit-logs
   * 
   * Query params opcionais:
   * - userId: number
   * - entity: string
   * - entityId: number
   * - action: string (CREATE, UPDATE, DELETE, READ, LOGIN, LOGOUT)
   * - startDate: string (ISO date)
   * - endDate: string (ISO date)
   * - ip: string
   * - page: number (padrão: 1)
   * - limit: number (padrão: 10)
   */
  async index(req: Request, res: Response): Promise<Response | void> {
    // Extrair filtros dos query params
    const filters: AuditLogQueryDto = {};

    if (req.query.userId) {
      filters.userId = Number(req.query.userId);
    }

    if (req.query.entity) {
      filters.entity = req.query.entity as string;
    }

    if (req.query.entityId) {
      filters.entityId = Number(req.query.entityId);
    }

    if (req.query.action) {
      filters.action = req.query.action as any;
    }

    if (req.query.startDate) {
      filters.startDate = req.query.startDate as string;
    }

    if (req.query.endDate) {
      filters.endDate = req.query.endDate as string;
    }

    if (req.query.ip) {
      filters.ip = req.query.ip as string;
    }

    filters.page = req.query.page ? Number(req.query.page) : 1;
    filters.limit = req.query.limit ? Number(req.query.limit) : 10;

    // Consultar logs
    const result = await this.queryService.query(filters);

    return res.json(result);
  }

  /**
   * Obtém um log específico por ID
   * 
   * GET /api/audit-logs/:id
   */
  async show(req: Request, res: Response): Promise<Response | void> {
    const { id } = req.params;

    const log = await this.queryService.getById(id);

    if (!log) {
      throw new NotFoundException('Log de auditoria', id);
    }

    return res.json(log);
  }

  /**
   * Lista logs de um usuário específico
   * 
   * GET /api/audit-logs/user/:userId
   * 
   * Query params opcionais:
   * - page: number (padrão: 1)
   * - limit: number (padrão: 10)
   */
  async findByUser(req: Request, res: Response): Promise<Response | void> {
    const { userId } = req.params;
    const page = req.query.page ? Number(req.query.page) : 1;
    const limit = req.query.limit ? Number(req.query.limit) : 10;

    const result = await this.queryService.findByUser(Number(userId), page, limit);

    return res.json(result);
  }

  /**
   * Lista logs de uma entidade específica
   * 
   * GET /api/audit-logs/entity/:entity/:entityId?
   * 
   * Query params opcionais:
   * - page: number (padrão: 1)
   * - limit: number (padrão: 10)
   */
  async findByEntity(req: Request, res: Response): Promise<Response | void> {
    const { entity, entityId } = req.params;
    const page = req.query.page ? Number(req.query.page) : 1;
    const limit = req.query.limit ? Number(req.query.limit) : 10;

    const result = await this.queryService.findByEntity(
      entity,
      entityId ? Number(entityId) : undefined,
      page,
      limit
    );

    return res.json(result);
  }
}
