import { Request, Response } from 'express';
import UsuarioHasRole from '../models/UsuarioHasRole';
import { Injectable } from '../core/di';
import { NotFoundException } from '../core/exceptions';
import { getRequestContext } from '../core/authorization/helpers';

/**
 * Controller responsável pelo gerenciamento de relacionamentos Usuario-Role
 * 
 * Este controller gerencia as associações many-to-many entre Usuários e Roles.
 * Por ser um controller de relacionamento simples, não possui Application Service,
 * mas segue o padrão de DI e tratamento de exceções.
 */
@Injectable()
export class UsuarioHasRoleController {
  async index(req: Request, res: Response) {
    const usuarioHasRoles = await UsuarioHasRole.findAll();
    return res.json(usuarioHasRoles);
  }

  async create(req: Request, res: Response) {
    const { usuarioId, roleId } = req.body;
    
    if (!usuarioId || !roleId) {
      throw new NotFoundException('Usuário ou Role');
    }

    // Obter tenantId do contexto
    const context = getRequestContext();
    const tenantId = context?.getTenantId();
    
    if (!tenantId) {
      throw new NotFoundException('Tenant não identificado');
    }

    const usuarioHasRole = await UsuarioHasRole.create({ 
      tenantId,
      usuarioId, 
      roleId 
    });
    return res.status(201).json(usuarioHasRole);
  }

  async delete(req: Request, res: Response) {
    const { usuarioId, roleId } = req.params;
    
    const usuarioHasRole = await UsuarioHasRole.findOne({
      where: { usuarioId, roleId }
    });

    if (!usuarioHasRole) {
      throw new NotFoundException('Associação Usuário-Role', `${usuarioId}-${roleId}`);
    }

    await usuarioHasRole.destroy();
    return res.status(204).send();
  }
}

export default UsuarioHasRoleController;
