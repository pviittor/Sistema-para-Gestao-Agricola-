import { Request, Response } from 'express';
import { Injectable, Inject } from '../core/di';
import { TYPES } from '../core/di/types';
import { IPermissaoController } from './interfaces/IPermissaoController';
import { IPermissaoApplicationService } from '../application/services/permissao/IPermissaoApplicationService';
import { CreatePermissaoDto } from '../application/dto/permissao/CreatePermissaoDto';
import { UpdatePermissaoDto } from '../application/dto/permissao/UpdatePermissaoDto';
import { PermissaoResponseDto } from '../application/dto/permissao/PermissaoResponseDto';
import { NotFoundException } from '../core/exceptions';

/**
 * Controller responsável pelo gerenciamento de permissões
 * 
 * Este controller atua como camada HTTP, delegando toda a lógica de negócio
 * para o PermissaoApplicationService. Sua responsabilidade é apenas:
 * - Receber requisições HTTP
 * - Chamar Application Service
 * - Retornar respostas HTTP
 */
@Injectable()
export class PermissaoController implements IPermissaoController {
  constructor(
    @Inject(TYPES.IPermissaoApplicationService)
    private permissaoService: IPermissaoApplicationService
  ) {}

  async index(req: Request, res: Response) {
    // Usar service para listar permissões
    const page = req.query.page ? Number(req.query.page) : 1;
    const limit = req.query.limit ? Number(req.query.limit) : 10;
    
    const result = await this.permissaoService.list(page, limit);
    return res.json(result);
  }

  async show(req: Request, res: Response) {
    const { id } = req.params;
    
    // Usar service para buscar permissão
    const permissao = await this.permissaoService.getById(id);

    if (!permissao) {
      throw new NotFoundException('Permissão', id);
    }

    return res.json(permissao);
  }

  async create(req: Request, res: Response) {
    // req.body já está validado e tipado como CreatePermissaoDto
    const dto = req.body as CreatePermissaoDto;
    
    // Usar service para criar permissão (service aplica validações de negócio)
    const permissao = await this.permissaoService.create(dto);
    
    return res.status(201).json(permissao);
  }

  async update(req: Request, res: Response) {
    const { id } = req.params;
    // req.body já está validado e tipado como UpdatePermissaoDto
    const dto = req.body as UpdatePermissaoDto;
    
    // Usar service para atualizar permissão (service aplica validações de negócio)
    const permissao = await this.permissaoService.update(id, dto);
    
    return res.json(permissao);
  }

  async delete(req: Request, res: Response) {
    const { id } = req.params;
    
    // Usar service para remover permissão
    const deleted = await this.permissaoService.delete(id);

    if (!deleted) {
      throw new NotFoundException('Permissão', id);
    }

    return res.status(204).send();
  }
}

export default PermissaoController;
