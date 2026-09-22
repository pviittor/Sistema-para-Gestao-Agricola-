/**
 * Tenant Middleware
 * 
 * Middleware para identificar e validar tenant em cada requisição.
 * Extrai o tenantId do token JWT (do usuário autenticado) ou do header X-Tenant-ID,
 * valida o tenant e armazena no TenantService.
 * 
 * IMPORTANTE: Este middleware deve ser usado APÓS o authMiddleware e requestContextMiddleware,
 * pois depende de req.userId e req.context estarem definidos.
 * 
 * Ordem recomendada de middlewares:
 * 1. requestContextMiddleware
 * 2. authMiddleware (se rota protegida)
 * 3. tenantMiddleware
 * 4. authorizationMiddleware (se necessário)
 * 
 * @example
 * ```typescript
 * import { tenantMiddleware } from './middleware/tenant';
 * 
 * router.get('/eventos',
 *   authMiddleware,
 *   tenantMiddleware,
 *   eventoController.index
 * );
 * ```
 */

/// <reference path="../types/express.d.ts" />
import { Request, Response, NextFunction } from 'express';
import { container } from '../core/di/container';
import { TYPES } from '../core/di/types';
import { ITenantService } from '../core/tenant/ITenantService';
import { ForbiddenException } from '../core/exceptions';
import { BadRequestException } from '../core/exceptions/BadRequestException';
import Usuario from '../models/Usuario';

/**
 * Extrai o tenantId da requisição
 * 
 * Ordem de prioridade:
 * 1. Do token JWT (tenantId do usuário autenticado)
 * 2. Do header X-Tenant-ID
 * 
 * @param req - Request do Express
 * @returns tenantId ou null se não encontrado
 */
async function extractTenantId(req: Request): Promise<number | null> {
  // Prioridade 1: Extrair do usuário autenticado (via token JWT)
  if (req.userId) {
    try {
      const usuario = await Usuario.findByPk(req.userId, {
        attributes: ['id', 'tenantId'],
      });

      if (usuario && usuario.tenantId) {
        return usuario.tenantId;
      }
    } catch (error) {
      // Se houver erro ao buscar usuário, continuar para próxima opção
      console.error('Erro ao buscar tenantId do usuário:', error);
    }
  }

  // Prioridade 2: Extrair do header X-Tenant-ID
  const tenantHeader = req.headers['x-tenant-id'];
  if (tenantHeader) {
    const tenantId = parseInt(tenantHeader as string, 10);
    if (!isNaN(tenantId) && tenantId > 0) {
      return tenantId;
    }
  }

  return null;
}

/**
 * Middleware para identificar e validar tenant
 * 
 * Este middleware:
 * 1. Extrai o tenantId do token JWT (usuário autenticado) ou header X-Tenant-ID
 * 2. Valida se o tenant existe e se o usuário tem acesso
 * 3. Armazena o tenantId no TenantService
 * 4. Adiciona tenantId ao Request para acesso posterior
 * 
 * Se o tenant não for encontrado ou inválido, retorna erro 403 (Forbidden).
 * Se o tenant não for identificado, retorna erro 400 (Bad Request).
 * 
 * @param req - Request do Express
 * @param res - Response do Express
 * @param next - NextFunction do Express
 */
/**
 * Middleware para identificar e validar tenant (OPCIONAL)
 * 
 * Este middleware tenta identificar o tenant, mas não falha se não encontrar.
 * Use este middleware em rotas que podem ou não ter tenant.
 * 
 * IMPORTANTE: Este middleware considera a hierarquia de usuários:
 * - GOD: bypass completo (não aplica filtro de tenant)
 * - CONSULTOR: não aplica filtro de tenant (acessa múltiplos tenants da sua consultoria)
 * - ROOT/CLIENT: aplica filtro de tenantId
 * 
 * @param req - Request do Express
 * @param res - Response do Express
 * @param next - NextFunction do Express
 */
export const tenantMiddlewareOptional = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    // Resolver TenantService do container
    const tenantService = container.resolve<ITenantService>(TYPES.ITenantService);

    // Obter usuário para verificar tipo
    const userId = (req as any).userId;
    if (!userId) {
      // Se não houver userId, deixar authMiddleware tratar
      return next();
    }

    const usuario = await Usuario.findByPk(userId, {
      attributes: ['id', 'tipo', 'tenantId', 'consultoriaId'],
    });

    if (!usuario) {
      return next();
    }

    // GOD: bypass completo (não aplica filtro de tenant)
    if (usuario.tipo === 'GOD') {
      return next();
    }

    // CONSULTOR: não aplica filtro de tenant (acessa múltiplos tenants da sua consultoria)
    // O filtro será aplicado no BaseRepository por consultoriaId
    if (usuario.tipo === 'CONSULTOR') {
      return next();
    }

    // ROOT/CLIENT: aplicar filtro de tenantId
    if (usuario.tipo === 'ROOT' || usuario.tipo === 'CLIENT') {
      // Extrair tenantId da requisição
      const tenantId = await extractTenantId(req);

      // Se não houver tenantId, apenas continuar sem definir tenant
      if (!tenantId) {
        return next();
      }

      // Validar tenant (verifica existência e acesso do usuário)
      const isValid = await tenantService.validateTenant(tenantId);
      if (!isValid) {
        throw new ForbiddenException(
          'Acesso negado ao tenant especificado',
          'TENANT_ACCESS_DENIED'
        );
      }

      // Armazenar tenantId no TenantService
      tenantService.setCurrentTenantId(tenantId);

      // Associar RequestContext ao TenantService se disponível
      if (req.context) {
        tenantService.setRequestContext(req.context);
      }

      // Adicionar tenantId ao Request para acesso posterior
      (req as any).tenantId = tenantId;

      // Definir tenantId no RequestContext se disponível
      if (req.context) {
        req.context.setTenantId(tenantId);
      }
    }

    next();
  } catch (error) {
    // Se já for uma exceção customizada, passar adiante
    if (error instanceof ForbiddenException || error instanceof BadRequestException) {
      return next(error);
    }

    // Para outros erros, tratar como erro interno
    return next(error);
  }
};

/**
 * Middleware para identificar e validar tenant (OBRIGATÓRIO)
 * 
 * Este middleware requer que o tenant seja identificado.
 * Use este middleware em rotas que sempre precisam de tenant.
 * 
 * IMPORTANTE: Este middleware considera a hierarquia de usuários:
 * - GOD: bypass completo (não aplica filtro de tenant)
 * - CONSULTOR: não aplica filtro de tenant (acessa múltiplos tenants da sua consultoria)
 * - ROOT/CLIENT: aplica filtro de tenantId (obrigatório)
 * 
 * @param req - Request do Express
 * @param res - Response do Express
 * @param next - NextFunction do Express
 */
export const tenantMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    // Resolver TenantService do container
    const tenantService = container.resolve<ITenantService>(TYPES.ITenantService);

    // Obter usuário para verificar tipo
    const userId = (req as any).userId;
    if (!userId) {
      throw new BadRequestException(
        'Usuário não autenticado. Autentique-se com um token válido.',
        'USER_NOT_AUTHENTICATED'
      );
    }

    const usuario = await Usuario.findByPk(userId, {
      attributes: ['id', 'tipo', 'tenantId', 'consultoriaId'],
    });

    if (!usuario) {
      throw new ForbiddenException(
        'Usuário não encontrado',
        'USER_NOT_FOUND'
      );
    }

    // GOD: bypass completo (não aplica filtro de tenant)
    if (usuario.tipo === 'GOD') {
      return next();
    }

    // CONSULTOR: não aplica filtro de tenant (acessa múltiplos tenants da sua consultoria)
    // O filtro será aplicado no BaseRepository por consultoriaId
    if (usuario.tipo === 'CONSULTOR') {
      return next();
    }

    // ROOT/CLIENT: aplicar filtro de tenantId (obrigatório)
    if (usuario.tipo === 'ROOT' || usuario.tipo === 'CLIENT') {
      // Extrair tenantId da requisição
      const tenantId = await extractTenantId(req);

      if (!tenantId) {
        throw new BadRequestException(
          'Tenant não identificado. Forneça o header X-Tenant-ID ou autentique-se com um token válido.',
          'TENANT_NOT_IDENTIFIED'
        );
      }

      // Validar tenant (verifica existência e acesso do usuário)
      const isValid = await tenantService.validateTenant(tenantId);
      if (!isValid) {
        throw new ForbiddenException(
          'Acesso negado ao tenant especificado',
          'TENANT_ACCESS_DENIED'
        );
      }

      // Armazenar tenantId no TenantService
      tenantService.setCurrentTenantId(tenantId);

      // Associar RequestContext ao TenantService se disponível
      if (req.context) {
        tenantService.setRequestContext(req.context);
      }

      // Adicionar tenantId ao Request para acesso posterior
      (req as any).tenantId = tenantId;

      // Definir tenantId no RequestContext se disponível
      if (req.context) {
        req.context.setTenantId(tenantId);
      }
    } else {
      // Tipo de usuário não reconhecido
      throw new ForbiddenException(
        'Tipo de usuário inválido para esta operação',
        'INVALID_USER_TYPE'
      );
    }

    next();
  } catch (error) {
    // Se já for uma exceção customizada, passar adiante
    if (error instanceof ForbiddenException || error instanceof BadRequestException) {
      return next(error);
    }

    // Para outros erros, tratar como erro interno
    return next(error);
  }
};
