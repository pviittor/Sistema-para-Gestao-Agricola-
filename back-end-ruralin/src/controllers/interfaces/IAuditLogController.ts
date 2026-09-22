/**
 * IAuditLogController - Interface para controller de logs de auditoria
 * 
 * Define os métodos HTTP para consulta de logs de auditoria.
 */

import { Request, Response } from 'express';

/**
 * Interface para controller de logs de auditoria
 */
export interface IAuditLogController {
  /**
   * Lista logs de auditoria com filtros
   * 
   * GET /api/audit-logs
   * 
   * Query params:
   * - userId?: number
   * - entity?: string
   * - entityId?: number
   * - action?: string
   * - startDate?: string (ISO date)
   * - endDate?: string (ISO date)
   * - ip?: string
   * - page?: number
   * - limit?: number
   * 
   * @param req - Request do Express
   * @param res - Response do Express
   */
  index(req: Request, res: Response): Promise<Response | void>;

  /**
   * Obtém um log específico por ID
   * 
   * GET /api/audit-logs/:id
   * 
   * @param req - Request do Express
   * @param res - Response do Express
   */
  show(req: Request, res: Response): Promise<Response | void>;

  /**
   * Lista logs de um usuário específico
   * 
   * GET /api/audit-logs/user/:userId
   * 
   * Query params:
   * - page?: number
   * - limit?: number
   * 
   * @param req - Request do Express
   * @param res - Response do Express
   */
  findByUser(req: Request, res: Response): Promise<Response | void>;

  /**
   * Lista logs de uma entidade específica
   * 
   * GET /api/audit-logs/entity/:entity/:entityId?
   * 
   * Query params:
   * - page?: number
   * - limit?: number
   * 
   * @param req - Request do Express
   * @param res - Response do Express
   */
  findByEntity(req: Request, res: Response): Promise<Response | void>;
}
