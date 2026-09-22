/**
 * Authorization Middleware
 * 
 * Middleware para verificação de permissões e roles em nível de rota.
 * Complementa os decorators de autorização (@RequirePermission, @RequireRole)
 * permitindo proteção de rotas que não usam Application Services.
 * 
 * Características:
 * - Verifica permissões antes de chegar ao controller
 * - Verifica roles antes de chegar ao controller
 * - Integra com authMiddleware (requer autenticação prévia)
 * - Lança ForbiddenException se não tiver permissão/role
 * - Integrado com AuthorizationService via DI
 * 
 * @example
 * ```typescript
 * import { requirePermission, requireRole } from './middleware/authorization';
 * 
 * router.post('/usuarios', 
 *   authMiddleware,
 *   requirePermission('usuario.create'),
 *   usuarioController.create
 * );
 * 
 * router.delete('/usuarios/:id',
 *   authMiddleware,
 *   requireRole('ADMIN'),
 *   usuarioController.delete
 * );
 * ```
 */

/// <reference path="../types/express.d.ts" />
import { Request, Response, NextFunction } from 'express';
import { container } from '../core/di/container';
import { TYPES } from '../core/di/types';
import { IAuthorizationService } from '../core/authorization/IAuthorizationService';
import { ForbiddenException } from '../core/exceptions';
import { UnauthorizedException } from '../core/exceptions';

/**
 * Middleware factory para verificar permissão específica
 * 
 * Cria um middleware que verifica se o usuário autenticado tem a permissão
 * especificada antes de permitir o acesso à rota.
 * 
 * IMPORTANTE: Este middleware deve ser usado APÓS o authMiddleware,
 * pois depende de req.userId estar definido.
 * 
 * @param permission - Nome da permissão necessária (ex: 'usuario.create')
 * @returns Middleware function do Express
 * 
 * @example
 * ```typescript
 * router.post('/usuarios',
 *   authMiddleware,
 *   requirePermission('usuario.create'),
 *   usuarioController.create
 * );
 * ```
 */
export const requirePermission = (permission: string) => {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      // Verificar se usuário está autenticado
      const userId = req.userId;
      if (!userId) {
        throw new UnauthorizedException('Credenciais inválidas');
      }

      // Resolver AuthorizationService do container
      const authService = container.resolve<IAuthorizationService>(TYPES.IAuthorizationService);

      // Verificar se usuário tem a permissão
      const hasPermission = await authService.hasPermission(userId, permission);
      if (!hasPermission) {
        throw new ForbiddenException(`Permissão '${permission}' necessária`);
      }

      // Se tiver permissão, continuar para o próximo middleware/controller
      next();
    } catch (error) {
      // Passar exceções para o errorHandler
      next(error);
    }
  };
};

/**
 * Middleware factory para verificar role específica
 * 
 * Cria um middleware que verifica se o usuário autenticado tem a role
 * especificada (ou pelo menos uma das roles, se array) antes de permitir
 * o acesso à rota.
 * 
 * IMPORTANTE: Este middleware deve ser usado APÓS o authMiddleware,
 * pois depende de req.userId estar definido.
 * 
 * @param role - Nome da role necessária ou array de roles (OR)
 * @returns Middleware function do Express
 * 
 * @example
 * ```typescript
 * router.delete('/usuarios/:id',
 *   authMiddleware,
 *   requireRole('ADMIN'),
 *   usuarioController.delete
 * );
 * 
 * router.put('/usuarios/:id',
 *   authMiddleware,
 *   requireRole(['ADMIN', 'MANAGER']),
 *   usuarioController.update
 * );
 * ```
 */
export const requireRole = (role: string | string[]) => {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      // Verificar se usuário está autenticado
      const userId = req.userId;
      if (!userId) {
        throw new UnauthorizedException('Credenciais inválidas');
      }

      // Resolver AuthorizationService do container
      const authService = container.resolve<IAuthorizationService>(TYPES.IAuthorizationService);

      // Normalizar role para array
      const roles = Array.isArray(role) ? role : [role];

      // Verificar se usuário tem pelo menos uma das roles (OR)
      const hasRole = await authService.hasAnyRole(userId, roles);
      if (!hasRole) {
        const rolesStr = roles.length === 1 ? roles[0] : roles.join(' ou ');
        throw new ForbiddenException(`Role '${rolesStr}' necessária`);
      }

      // Se tiver role, continuar para o próximo middleware/controller
      next();
    } catch (error) {
      // Se for ForbiddenException, passar para o errorHandler
      if (error instanceof ForbiddenException) {
        return next(error);
      }

      // Outros erros também devem ser passados para o errorHandler
      next(error);
    }
  };
};

/**
 * Middleware factory para verificar múltiplas permissões (OR - pelo menos uma)
 * 
 * Cria um middleware que verifica se o usuário autenticado tem pelo menos
 * uma das permissões especificadas antes de permitir o acesso à rota.
 * 
 * @param permissions - Array de permissões (OR)
 * @returns Middleware function do Express
 * 
 * @example
 * ```typescript
 * router.get('/relatorios',
 *   authMiddleware,
 *   requireAnyPermission(['relatorio.financeiro', 'relatorio.geral']),
 *   relatorioController.list
 * );
 * ```
 */
export const requireAnyPermission = (permissions: string[]) => {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      // Verificar se usuário está autenticado
      const userId = req.userId;
      if (!userId) {
        throw new UnauthorizedException('Credenciais inválidas');
      }

      // Resolver AuthorizationService do container
      const authService = container.resolve<IAuthorizationService>(TYPES.IAuthorizationService);

      // Verificar se usuário tem pelo menos uma das permissões
      const hasAnyPermission = await Promise.all(
        permissions.map(permission => authService.hasPermission(userId, permission))
      ).then(results => results.some(result => result === true));

      if (!hasAnyPermission) {
        throw new ForbiddenException(`Pelo menos uma das permissões necessárias: ${permissions.join(', ')}`);
      }

      // Se tiver permissão, continuar para o próximo middleware/controller
      next();
    } catch (error) {
      // Passar exceções para o errorHandler
      next(error);
    }
  };
};

/**
 * Middleware factory para verificar múltiplas permissões (AND - todas)
 * 
 * Cria um middleware que verifica se o usuário autenticado tem todas
 * as permissões especificadas antes de permitir o acesso à rota.
 * 
 * @param permissions - Array de permissões (AND)
 * @returns Middleware function do Express
 * 
 * @example
 * ```typescript
 * router.post('/usuarios/admin',
 *   authMiddleware,
 *   requireAllPermissions(['usuario.create', 'usuario.admin']),
 *   usuarioController.createAdmin
 * );
 * ```
 */
export const requireAllPermissions = (permissions: string[]) => {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      // Verificar se usuário está autenticado
      const userId = req.userId;
      if (!userId) {
        throw new UnauthorizedException('Credenciais inválidas');
      }

      // Resolver AuthorizationService do container
      const authService = container.resolve<IAuthorizationService>(TYPES.IAuthorizationService);

      // Verificar se usuário tem todas as permissões
      const hasAllPermissions = await Promise.all(
        permissions.map(permission => authService.hasPermission(userId, permission))
      ).then(results => results.every(result => result === true));

      if (!hasAllPermissions) {
        throw new ForbiddenException(`Todas as permissões necessárias: ${permissions.join(', ')}`);
      }

      // Se tiver todas as permissões, continuar para o próximo middleware/controller
      next();
    } catch (error) {
      // Se for ForbiddenException, passar para o errorHandler
      if (error instanceof ForbiddenException) {
        return next(error);
      }

      // Outros erros também devem ser passados para o errorHandler
      next(error);
    }
  };
};
