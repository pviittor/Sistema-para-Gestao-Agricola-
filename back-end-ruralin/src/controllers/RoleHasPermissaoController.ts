import { Request, Response } from 'express';
import RoleHasPermissao from '../models/RoleHasPermissao';
import { Injectable } from '../core/di';
import { NotFoundException } from '../core/exceptions';

/**
 * Controller responsável pelo gerenciamento de relacionamentos Role-Permissao
 * 
 * Este controller gerencia as associações many-to-many entre Roles e Permissões.
 * Por ser um controller de relacionamento simples, não possui Application Service,
 * mas segue o padrão de DI e tratamento de exceções.
 */
@Injectable()
export class RoleHasPermissaoController {
  async index(req: Request, res: Response) {
    const roleHasPermissoes = await RoleHasPermissao.findAll();
    return res.json(roleHasPermissoes);
  }

  async create(req: Request, res: Response) {
    const { roleId, permissaoId } = req.body;
    
    if (!roleId || !permissaoId) {
      throw new NotFoundException('Role ou Permissão');
    }

    const roleHasPermissao = await RoleHasPermissao.create({ roleId, permissaoId });
    return res.status(201).json(roleHasPermissao);
  }

  async delete(req: Request, res: Response) {
    const { roleId, permissaoId } = req.params;
    
    const roleHasPermissao = await RoleHasPermissao.findOne({
      where: { roleId, permissaoId }
    });

    if (!roleHasPermissao) {
      throw new NotFoundException('Associação Role-Permissão', `${roleId}-${permissaoId}`);
    }

    await roleHasPermissao.destroy();
    return res.status(204).send();
  }
}

export default RoleHasPermissaoController;
