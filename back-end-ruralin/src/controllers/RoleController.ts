import { Request, Response } from 'express';
import { Injectable, Inject } from '../core/di';
import { TYPES } from '../core/di/types';
import { IRoleController } from './interfaces/IRoleController';
import { IRoleApplicationService } from '../application/services/role/IRoleApplicationService';
import { CreateRoleDto } from '../application/dto/role/CreateRoleDto';
import { UpdateRoleDto } from '../application/dto/role/UpdateRoleDto';
import { RoleResponseDto } from '../application/dto/role/RoleResponseDto';
import { NotFoundException } from '../core/exceptions';

/**
 * Controller responsável pelo gerenciamento de roles
 * 
 * Este controller atua como camada HTTP, delegando toda a lógica de negócio
 * para o RoleApplicationService. Sua responsabilidade é apenas:
 * - Receber requisições HTTP
 * - Chamar Application Service
 * - Retornar respostas HTTP
 */
@Injectable()
export class RoleController implements IRoleController {
  constructor(
    @Inject(TYPES.IRoleApplicationService)
    private roleService: IRoleApplicationService
  ) {}

  async index(req: Request, res: Response) {
    // Usar service para listar roles
    const page = req.query.page ? Number(req.query.page) : 1;
    const limit = req.query.limit ? Number(req.query.limit) : 10;
    
    const result = await this.roleService.list(page, limit);
    return res.json(result);
  }

  async show(req: Request, res: Response) {
    const { id } = req.params;
    
    // Usar service para buscar role
    const role = await this.roleService.getById(id);

    if (!role) {
      throw new NotFoundException('Role', id);
    }

    return res.json(role);
  }

  async create(req: Request, res: Response) {
    // req.body já está validado e tipado como CreateRoleDto
    const dto = req.body as CreateRoleDto;
    
    // Usar service para criar role (service aplica validações de negócio)
    const role = await this.roleService.create(dto);
    
    return res.status(201).json(role);
  }

  async update(req: Request, res: Response) {
    const { id } = req.params;
    // req.body já está validado e tipado como UpdateRoleDto
    const dto = req.body as UpdateRoleDto;
    
    // Usar service para atualizar role (service aplica validações de negócio)
    const role = await this.roleService.update(id, dto);
    
    return res.json(role);
  }

  async delete(req: Request, res: Response) {
    const { id } = req.params;
    
    // Usar service para remover role
    const deleted = await this.roleService.delete(id);

    if (!deleted) {
      throw new NotFoundException('Role', id);
    }

    return res.status(204).send();
  }
}

export default RoleController;
