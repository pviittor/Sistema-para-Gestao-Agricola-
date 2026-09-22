import { Request, Response } from "express";
import { Injectable, Inject } from '../core/di';
import { TYPES } from '../core/di/types';
import { ILocalController } from './interfaces/ILocalController';
import { ILocalApplicationService } from '../application/services/local/ILocalApplicationService';
import { CreateLocalDto } from '../application/dto/local/CreateLocalDto';
import { UpdateLocalDto } from '../application/dto/local/UpdateLocalDto';
import { LocalResponseDto } from '../application/dto/local/LocalResponseDto';
import { NotFoundException, ForbiddenException } from '../core/exceptions';

/**
 * Controller responsável pelo gerenciamento de locais
 * 
 * Este controller atua como camada HTTP, delegando toda a lógica de negócio
 * para o LocalApplicationService. Sua responsabilidade é apenas:
 * - Receber requisições HTTP
 * - Chamar Application Service
 * - Retornar respostas HTTP
 */
@Injectable()
export class LocalController implements ILocalController {
  constructor(
    @Inject(TYPES.ILocalApplicationService)
    private localService: ILocalApplicationService
  ) {}

  async index(req: Request, res: Response) {
    const userId = req.userId;

    if (!userId) {
      throw new NotFoundException('Usuário');
    }

    // Usar service para buscar locais do usuário
    const locais = await this.localService.findByUsuario(Number(userId));

    return res.json(locais);
  }

  async show(req: Request, res: Response) {
    const { id } = req.params;
    
    // Usar service para buscar local
    const local = await this.localService.getById(id);

    if (!local) {
      throw new NotFoundException('Local', id);
    }

    return res.json(local);
  }

  async create(req: Request, res: Response) {
    const userId = req.userId;

    if (!userId) {
      throw new NotFoundException('Usuário');
    }

    // req.body já está validado e tipado como CreateLocalDto
    const dto = req.body as CreateLocalDto;
    
    // Usar service para criar local (service aplica validações de negócio)
    // TODO: Service deveria receber usuarioId, por enquanto adicionamos manualmente
    const local = await this.localService.create({ ...dto, usuarioId: Number(userId) } as any);
    
    return res.status(201).json(local);
  }

  async update(req: Request, res: Response) {
    const { id } = req.params;
    // req.body já está validado e tipado como UpdateLocalDto
    const dto = req.body as UpdateLocalDto;
    
    // Usar service para atualizar local (service aplica validações de negócio e autorização)
    const updatedLocal = await this.localService.update(id, dto);
    
    return res.json(updatedLocal);
  }

  async delete(req: Request, res: Response) {
    const { id } = req.params;
    
    // Usar service para remover local
    const deleted = await this.localService.delete(id);

    if (!deleted) {
      throw new NotFoundException('Local', id);
    }

    return res.status(204).send();
  }
}

export default LocalController;
