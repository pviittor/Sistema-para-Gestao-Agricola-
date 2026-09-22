import { Request, Response } from 'express';
import UsuarioHasSubUsuario from '../models/UsuarioHasSubUsuario';
import { Injectable } from '../core/di';
import { NotFoundException } from '../core/exceptions';

/**
 * Controller responsável pelo gerenciamento de relacionamentos Usuario-SubUsuario
 * 
 * Este controller gerencia as associações many-to-many entre Usuários e SubUsuários.
 * Por ser um controller de relacionamento simples, não possui Application Service,
 * mas segue o padrão de DI e tratamento de exceções.
 */
@Injectable()
export class UsuarioHasSubUsuarioController {
  async index(req: Request, res: Response) {
    const usuarioHasSubUsuarios = await UsuarioHasSubUsuario.findAll();
    return res.json(usuarioHasSubUsuarios);
  }

  async create(req: Request, res: Response) {
    const { usuarioId, subUsuarioId } = req.body;
    
    if (!usuarioId || !subUsuarioId) {
      throw new NotFoundException('Usuário ou SubUsuário');
    }

    const usuarioHasSubUsuario = await UsuarioHasSubUsuario.create({ usuarioId, subUsuarioId });
    return res.status(201).json(usuarioHasSubUsuario);
  }

  async delete(req: Request, res: Response) {
    const { usuarioId, subUsuarioId } = req.params;
    
    const usuarioHasSubUsuario = await UsuarioHasSubUsuario.findOne({
      where: { usuarioId, subUsuarioId }
    });

    if (!usuarioHasSubUsuario) {
      throw new NotFoundException('Associação Usuário-SubUsuário', `${usuarioId}-${subUsuarioId}`);
    }

    await usuarioHasSubUsuario.destroy();
    return res.status(204).send();
  }
}

export default UsuarioHasSubUsuarioController;
