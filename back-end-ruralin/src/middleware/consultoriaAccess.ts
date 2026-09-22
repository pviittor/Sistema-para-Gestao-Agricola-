/**
 * consultoriaAccessMiddleware - Middleware para validação de acesso de CONSULTOR
 * 
 * Valida que operações de CONSULTOR sejam apenas em recursos da sua consultoria.
 * GOD tem bypass completo.
 */

import { Request, Response, NextFunction } from 'express';
import { ForbiddenException } from '../core/exceptions';
import { getRequestContext } from '../core/authorization/helpers';
import Usuario from '../models/Usuario';
import Tenant from '../models/Tenant';
import Consultoria from '../models/Consultoria';

/**
 * Middleware para validar acesso de CONSULTOR
 * 
 * Verifica se o CONSULTOR está tentando acessar recursos da sua consultoria.
 * GOD tem bypass completo.
 */
export const consultoriaAccessMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const context = getRequestContext();
  if (!context) {
    return next();
  }

  const userId = context.getUserId();
  if (!userId) {
    return next();
  }

  // Buscar usuário
  const usuario = await Usuario.findByPk(userId, {
    attributes: ['id', 'tipo', 'consultoriaId', 'tenantId'],
  });

  if (!usuario) {
    return next();
  }

  // GOD tem bypass completo
  if (usuario.tipo === 'GOD') {
    return next();
  }

  // CONSULTOR: validar acesso à consultoria
  if (usuario.tipo === 'CONSULTOR') {
    if (!usuario.consultoriaId) {
      throw new ForbiddenException('Usuário CONSULTOR não possui consultoria associada', 'CONSULTOR_WITHOUT_CONSULTORIA');
    }

    // Validar acesso a tenant
    const tenantId = req.params.tenantId || req.body.tenantId || req.query.tenantId;
    if (tenantId) {
      const tenant = await Tenant.findByPk(Number(tenantId), {
        attributes: ['id', 'consultoriaId'],
      });

      if (!tenant) {
        throw new ForbiddenException('Tenant não encontrado', 'TENANT_NOT_FOUND');
      }

      if (tenant.consultoriaId !== usuario.consultoriaId) {
        throw new ForbiddenException('Acesso negado: Tenant não pertence à sua consultoria', 'TENANT_ACCESS_DENIED');
      }
    }

    // Validar acesso a consultoria
    const consultoriaId = req.params.consultoriaId || req.body.consultoriaId || req.query.consultoriaId;
    if (consultoriaId && Number(consultoriaId) !== usuario.consultoriaId) {
      throw new ForbiddenException('Acesso negado: Consultoria não pertence ao usuário', 'CONSULTORIA_ACCESS_DENIED');
    }

    // Definir consultoriaId no contexto
    context.setConsultoriaId(usuario.consultoriaId);
  }

  return next();
};
