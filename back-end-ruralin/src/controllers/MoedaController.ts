import { Request, Response } from 'express';
import { Injectable, Inject } from '../core/di';
import { TYPES } from '../core/di/types';
import { IMoedaController } from './interfaces/IMoedaController';
import { IMoedaApplicationService } from '../application/services/moeda/IMoedaApplicationService';
import { CreateMoedaDto } from '../application/dto/moeda/CreateMoedaDto';
import { UpdateMoedaDto } from '../application/dto/moeda/UpdateMoedaDto';
import { NotFoundException } from '../core/exceptions/NotFoundException';

/**
 * Controller responsável pelo gerenciamento de moedas
 */
@Injectable()
export class MoedaController implements IMoedaController {
  constructor(
    @Inject(TYPES.IMoedaApplicationService)
    private moedaService: IMoedaApplicationService
  ) {}

  async index(req: Request, res: Response): Promise<void> {
    const page = req.query.page ? Number(req.query.page) : 1;
    const limit = req.query.limit ? Number(req.query.limit) : 10;
    
    const result = await this.moedaService.list(page, limit);
    res.json(result);
  }

  async show(req: Request, res: Response): Promise<void> {
    const { id } = req.params;
    const moedaId = parseInt(id, 10);
    if (isNaN(moedaId)) {
      throw new NotFoundException('Moeda', id);
    }
    
    const moeda = await this.moedaService.getById(moedaId);
    if (!moeda) {
      throw new NotFoundException('Moeda', id);
    }

    res.json(moeda);
  }

  async create(req: Request, res: Response): Promise<void> {
    const dto = req.body as CreateMoedaDto;
    const moeda = await this.moedaService.create(dto);
    res.status(201).json(moeda);
  }

  async update(req: Request, res: Response): Promise<void> {
    const { id } = req.params;
    const dto = req.body as UpdateMoedaDto;
    const moedaId = parseInt(id, 10);
    if (isNaN(moedaId)) {
      throw new NotFoundException('Moeda', id);
    }
    
    const updatedMoeda = await this.moedaService.update(moedaId, dto);
    res.json(updatedMoeda);
  }

  async delete(req: Request, res: Response): Promise<void> {
    const { id } = req.params;
    const moedaId = parseInt(id, 10);
    if (isNaN(moedaId)) {
      throw new NotFoundException('Moeda', id);
    }
    
    await this.moedaService.delete(moedaId);
    res.status(204).send();
  }
}

export default MoedaController;
