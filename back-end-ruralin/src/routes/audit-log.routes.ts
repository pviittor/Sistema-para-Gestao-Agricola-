/**
 * Rotas para consulta de logs de auditoria
 * 
 * Endpoints:
 * - GET /api/audit-logs - Lista logs com filtros
 * - GET /api/audit-logs/:id - Obtém log específico
 * - GET /api/audit-logs/user/:userId - Logs de um usuário
 * - GET /api/audit-logs/entity/:entity/:entityId? - Logs de uma entidade
 * 
 * Permissão necessária: audit.read (ou audit.logs.read)
 */

import { Router } from 'express';
import { container } from '../core/di';
import { TYPES } from '../core/di/types';
import { IAuditLogController } from '../controllers/interfaces/IAuditLogController';
import { asyncHandler } from '../middleware/errorHandler';
import { requirePermission } from '../middleware/authorization';

const router = Router();

// Helper para resolver controller de forma lazy
const getAuditLogController = (): IAuditLogController => {
  return container.resolve<IAuditLogController>(TYPES.IAuditLogController);
};

/**
 * GET /api/audit-logs
 * 
 * Lista logs de auditoria com filtros opcionais.
 * 
 * Query params:
 * - userId?: number - Filtrar por usuário
 * - entity?: string - Filtrar por entidade
 * - entityId?: number - Filtrar por ID da entidade
 * - action?: string - Filtrar por ação (CREATE, UPDATE, DELETE, etc.)
 * - startDate?: string - Data de início (ISO date)
 * - endDate?: string - Data de fim (ISO date)
 * - ip?: string - Filtrar por IP
 * - page?: number - Número da página (padrão: 1)
 * - limit?: number - Limite por página (padrão: 10)
 * 
 * Permissão necessária: audit.read
 */
router.get('/', requirePermission('audit.read'), asyncHandler(async (req, res) => {
  await getAuditLogController().index(req, res);
}));

/**
 * GET /api/audit-logs/:id
 * 
 * Obtém um log de auditoria específico por ID.
 * 
 * Permissão necessária: audit.read
 */
router.get('/:id', requirePermission('audit.read'), asyncHandler(async (req, res) => {
  await getAuditLogController().show(req, res);
}));

/**
 * GET /api/audit-logs/user/:userId
 * 
 * Lista logs de auditoria de um usuário específico.
 * 
 * Query params:
 * - page?: number - Número da página (padrão: 1)
 * - limit?: number - Limite por página (padrão: 10)
 * 
 * Permissão necessária: audit.read
 */
router.get('/user/:userId', requirePermission('audit.read'), asyncHandler(async (req, res) => {
  await getAuditLogController().findByUser(req, res);
}));

/**
 * GET /api/audit-logs/entity/:entity/:entityId
 * 
 * Lista logs de auditoria de uma entidade específica com ID.
 * 
 * IMPORTANTE: Esta rota deve vir ANTES da rota /entity/:entity
 * para evitar que o Express capture o entityId como parte do entity.
 * 
 * Params:
 * - entity: string - Nome da entidade (ex: 'Usuario', 'Evento')
 * - entityId: number - ID da entidade
 * 
 * Query params:
 * - page?: number - Número da página (padrão: 1)
 * - limit?: number - Limite por página (padrão: 10)
 * 
 * Permissão necessária: audit.read
 */
router.get('/entity/:entity/:entityId', requirePermission('audit.read'), asyncHandler(async (req, res) => {
  await getAuditLogController().findByEntity(req, res);
}));

/**
 * GET /api/audit-logs/entity/:entity
 * 
 * Lista logs de auditoria de uma entidade específica (todos os logs da entidade).
 * 
 * Params:
 * - entity: string - Nome da entidade (ex: 'Usuario', 'Evento')
 * 
 * Query params:
 * - page?: number - Número da página (padrão: 1)
 * - limit?: number - Limite por página (padrão: 10)
 * 
 * Permissão necessária: audit.read
 */
router.get('/entity/:entity', requirePermission('audit.read'), asyncHandler(async (req, res) => {
  await getAuditLogController().findByEntity(req, res);
}));

export default router;
