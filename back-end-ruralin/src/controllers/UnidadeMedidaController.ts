import { Request, Response } from 'express';
import { Injectable, Inject } from '../core/di';
import { TYPES } from '../core/di/types';
import { IUnidadeMedidaController } from './interfaces/IUnidadeMedidaController';
import { IUnidadeMedidaApplicationService } from '../application/services/unidadeMedida/IUnidadeMedidaApplicationService';
import { CreateUnidadeMedidaDto } from '../application/dto/unidadeMedida/CreateUnidadeMedidaDto';
import { UpdateUnidadeMedidaDto } from '../application/dto/unidadeMedida/UpdateUnidadeMedidaDto';
import { NotFoundException } from '../core/exceptions/NotFoundException';

/**
 * Controller responsável pelo gerenciamento de unidades de medida
 * 
 * Este controller atua como camada HTTP, delegando toda a lógica de negócio
 * para o UnidadeMedidaApplicationService.
 */
@Injectable()
export class UnidadeMedidaController implements IUnidadeMedidaController {
  constructor(
    @Inject(TYPES.IUnidadeMedidaApplicationService)
    private unidadeMedidaService: IUnidadeMedidaApplicationService
  ) {}

  /**
   * Lista todas as unidades de medida com paginação
   */
  async index(req: Request, res: Response): Promise<void> {
    const page = req.query.page ? Number(req.query.page) : 1;
    const limit = req.query.limit ? Number(req.query.limit) : 10;
    
    const result = await this.unidadeMedidaService.list(page, limit);

    res.json(result);
  }

  /**
   * Busca uma unidade de medida por ID
   */
  async show(req: Request, res: Response): Promise<void> {
    const { id } = req.params;
    
    const unidadeMedidaId = parseInt(id, 10);
    if (isNaN(unidadeMedidaId)) {
      throw new NotFoundException('Unidade de medida', id);
    }
    
    const unidadeMedida = await this.unidadeMedidaService.getById(unidadeMedidaId);
    
    if (!unidadeMedida) {
      throw new NotFoundException('Unidade de medida', id);
    }

    res.json(unidadeMedida);
  }

  /**
   * Cria uma nova unidade de medida
   */
  async create(req: Request, res: Response): Promise<void> {
    const dto = req.body as CreateUnidadeMedidaDto;
    
    const unidadeMedida = await this.unidadeMedidaService.create(dto);
    
    res.status(201).json(unidadeMedida);
  }

  /**
   * Atualiza uma unidade de medida existente
   */
  async update(req: Request, res: Response): Promise<void> {
    const { id } = req.params;
    const dto = req.body as UpdateUnidadeMedidaDto;
    
    const unidadeMedidaId = parseInt(id, 10);
    if (isNaN(unidadeMedidaId)) {
      throw new NotFoundException('Unidade de medida', id);
    }
    
    const updatedUnidadeMedida = await this.unidadeMedidaService.update(unidadeMedidaId, dto);
    
    res.json(updatedUnidadeMedida);
  }

  /**
   * Remove uma unidade de medida
   */
  async delete(req: Request, res: Response): Promise<void> {
    const { id } = req.params;
    
    const unidadeMedidaId = parseInt(id, 10);
    if (isNaN(unidadeMedidaId)) {
      throw new NotFoundException('Unidade de medida', id);
    }
    
    await this.unidadeMedidaService.delete(unidadeMedidaId);

    res.status(204).send();
  }
}

export default UnidadeMedidaController;
