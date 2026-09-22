/**
 * Tenant Activation Middleware
 * 
 * Middleware para verificar se o tenant e consultoria estão ativos antes de permitir acesso.
 * Bloqueia acesso imediato se tenant ou consultoria estiverem inativos.
 * 
 * IMPORTANTE: Este middleware deve ser usado APÓS o authMiddleware,
 * pois depende de req.userId e req.context estarem definidos.
 * 
 * Ordem recomendada de middlewares:
 * 1. requestContextMiddleware
 * 2. authMiddleware
 * 3. tenantActivationMiddleware ← **NOVO**
 * 4. tenantMiddleware
 * 5. authorizationMiddleware
 * 
 * @example
 * ```typescript
 * import { tenantActivationMiddleware } from './middleware/tenantActivation';
 * 
 * router.get('/eventos',
 *   authMiddleware,
 *   tenantActivationMiddleware,
 *   tenantMiddleware,
 *   eventoController.index
 * );
 * ```
 */

/// <reference path="../types/express.d.ts" />
import { Request, Response, NextFunction } from 'express';
import { container } from '../core/di/container';
import { TYPES } from '../core/di/types';
import { ITenantActivationService } from '../core/tenant/ITenantActivationService';
import { ForbiddenException } from '../core/exceptions';
import Usuario from '../models/Usuario';
import Tenant from '../models/Tenant';
import Consultoria from '../models/Consultoria';

/**
 * Middleware para verificar se tenant e consultoria estão ativos
 * 
 * Este middleware:
 * 1. Verifica o tipo de usuário (GOD, CONSULTOR, ROOT, CLIENT)
 * 2. Para ROOT/CLIENT: verifica se tenant está ativo
 * 3. Para ROOT/CLIENT: verifica se consultoria do tenant está ativa
 * 4. Para CONSULTOR: verifica se consultoria está ativa
 * 5. Para GOD: bypass (não verifica)
 * 
 * Se tenant ou consultoria estiverem inativos, retorna 403 Forbidden.
 */
export const tenantActivationMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    // Resolver TenantActivationService do container
    const activationService = container.resolve<ITenantActivationService>(TYPES.ITenantActivationService);

    // Obter userId do request
    const userId = (req as any).userId;
    if (!userId) {
      // Se não houver userId, deixar authMiddleware tratar
      return next();
    }

    // Buscar usuário para verificar tipo
    const usuario = await Usuario.findByPk(userId, {
      attributes: ['id', 'tipo', 'tenantId', 'consultoriaId'],
    });

    if (!usuario) {
      return next();
    }

    // GOD: bypass completo (não verifica nada)
    if (usuario.tipo === 'GOD') {
      return next();
    }

    // CONSULTOR: verificar se consultoria está ativa
    if (usuario.tipo === 'CONSULTOR') {
      if (!usuario.consultoriaId) {
        throw new ForbiddenException(
          'Usuário CONSULTOR não possui consultoria associada',
          'CONSULTOR_WITHOUT_CONSULTORIA'
        );
      }

      const isActive = await activationService.isConsultoriaActive(usuario.consultoriaId);
      if (!isActive) {
        const consultoria = await activationService.getConsultoriaWithStatus(usuario.consultoriaId);
        throw new ForbiddenException(
          'A consultoria está inativa e não pode acessar o sistema',
          'CONSULTORIA_INACTIVE',
          {
            consultoriaId: usuario.consultoriaId,
            dataDesativacao: consultoria?.dataDesativacao || null,
          }
        );
      }

      return next();
    }

    // ROOT/CLIENT: verificar se tenant está ativo e se consultoria está ativa
    if (usuario.tipo === 'ROOT' || usuario.tipo === 'CLIENT') {
      if (!usuario.tenantId) {
        // Se não houver tenantId, deixar tenantMiddleware tratar
        return next();
      }

      // Verificar se tenant está ativo
      const isTenantActive = await activationService.isTenantActive(usuario.tenantId);
      if (!isTenantActive) {
        const tenant = await activationService.getTenantWithStatus(usuario.tenantId);
        throw new ForbiddenException(
          'O tenant está inativo e não pode acessar o sistema',
          'TENANT_INACTIVE',
          {
            tenantId: usuario.tenantId,
            dataDesativacao: tenant?.dataDesativacao || null,
          }
        );
      }

      // Buscar tenant para obter consultoriaId
      const tenant = await Tenant.findByPk(usuario.tenantId, {
        attributes: ['id', 'consultoriaId'],
      });

      if (tenant && tenant.consultoriaId) {
        // Verificar se consultoria está ativa
        const isConsultoriaActive = await activationService.isConsultoriaActive(tenant.consultoriaId);
        if (!isConsultoriaActive) {
          const consultoria = await activationService.getConsultoriaWithStatus(tenant.consultoriaId);
          throw new ForbiddenException(
            'A consultoria do tenant está inativa e não pode acessar o sistema',
            'CONSULTORIA_INACTIVE',
            {
              consultoriaId: tenant.consultoriaId,
              tenantId: usuario.tenantId,
              dataDesativacao: consultoria?.dataDesativacao || null,
            }
          );
        }
      }

      return next();
    }

    // Se chegou aqui, tipo de usuário não reconhecido, deixar passar
    // (outros middlewares podem tratar)
    return next();
  } catch (error) {
    // Se já for uma exceção customizada, passar adiante
    if (error instanceof ForbiddenException) {
      return next(error);
    }

    // Para outros erros, tratar como erro interno
    return next(error);
  }
};
