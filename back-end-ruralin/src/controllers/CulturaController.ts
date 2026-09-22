import { Request, Response } from 'express';
import { Injectable, Inject } from '../core/di';
import { TYPES } from '../core/di/types';
import { ICulturaController } from './interfaces/ICulturaController';
import { ICulturaApplicationService } from '../application/services/cultura/ICulturaApplicationService';
import { CreateCulturaDto } from '../application/dto/cultura/CreateCulturaDto';
import { UpdateCulturaDto } from '../application/dto/cultura/UpdateCulturaDto';
import { NotFoundException } from '../core/exceptions/NotFoundException';

/**
 * Controller responsável pelo gerenciamento de culturas
 */
@Injectable()
export class CulturaController implements ICulturaController {
  constructor(
    @Inject(TYPES.ICulturaApplicationService)
    private culturaService: ICulturaApplicationService
  ) {}

  async index(req: Request, res: Response): Promise<void> {
    const page = req.query.page ? Number(req.query.page) : 1;
    const limit = req.query.limit ? Number(req.query.limit) : 10;
    
    const result = await this.culturaService.list(page, limit);
    res.json(result);
  }

  async show(req: Request, res: Response): Promise<void> {
    const { id } = req.params;
    const culturaId = parseInt(id, 10);
    if (isNaN(culturaId)) {
      throw new NotFoundException('Cultura', id);
    }
    
    const cultura = await this.culturaService.getById(culturaId);
    if (!cultura) {
      throw new NotFoundException('Cultura', id);
    }

    res.json(cultura);
  }

  async create(req: Request, res: Response): Promise<void> {
    const dto = req.body as CreateCulturaDto;
    const cultura = await this.culturaService.create(dto);
    res.status(201).json(cultura);
  }

  async update(req: Request, res: Response): Promise<void> {
    const { id } = req.params;
    const dto = req.body as UpdateCulturaDto;
    const culturaId = parseInt(id, 10);
    if (isNaN(culturaId)) {
      throw new NotFoundException('Cultura', id);
    }
    
    const updatedCultura = await this.culturaService.update(culturaId, dto);
    res.json(updatedCultura);
  }

  async delete(req: Request, res: Response): Promise<void> {
    const { id } = req.params;
    const culturaId = parseInt(id, 10);
    if (isNaN(culturaId)) {
      throw new NotFoundException('Cultura', id);
    }
    
    await this.culturaService.delete(culturaId);
    res.status(204).send();
  }

  async findByProduto(req: Request, res: Response): Promise<void> {
    const { idProduto } = req.params;
    const produtoId = parseInt(idProduto, 10);
    if (isNaN(produtoId)) {
      throw new NotFoundException('Produto', idProduto);
    }
    
    const culturas = await this.culturaService.findByProduto(produtoId);
    res.json(culturas);
  }
}

export default CulturaController;
