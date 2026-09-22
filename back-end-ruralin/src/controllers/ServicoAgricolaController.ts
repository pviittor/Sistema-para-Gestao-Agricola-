import { Request, Response } from 'express';
import { Injectable, Inject } from '../core/di';
import { TYPES } from '../core/di/types';
import { IServicoAgricolaController } from './interfaces/IServicoAgricolaController';
import { IServicoAgricolaApplicationService } from '../application/services/servicoAgricola/IServicoAgricolaApplicationService';
import { CreateServicoAgricolaDto } from '../application/dto/servicoAgricola/CreateServicoAgricolaDto';
import { UpdateServicoAgricolaDto } from '../application/dto/servicoAgricola/UpdateServicoAgricolaDto';
import { NotFoundException } from '../core/exceptions/NotFoundException';

/**
 * Controller responsável pelo gerenciamento de serviços agrícolas
 */
@Injectable()
export class ServicoAgricolaController implements IServicoAgricolaController {
  constructor(
    @Inject(TYPES.IServicoAgricolaApplicationService)
    private servicoAgricolaService: IServicoAgricolaApplicationService
  ) {}

  async index(req: Request, res: Response): Promise<void> {
    const page = req.query.page ? Number(req.query.page) : 1;
    const limit = req.query.limit ? Number(req.query.limit) : 10;
    
    const result = await this.servicoAgricolaService.list(page, limit);
    res.json(result);
  }

  async show(req: Request, res: Response): Promise<void> {
    const { id } = req.params;
    const servicoId = parseInt(id, 10);
    if (isNaN(servicoId)) {
      throw new NotFoundException('Serviço agrícola', id);
    }
    
    const servicoAgricola = await this.servicoAgricolaService.getById(servicoId);
    if (!servicoAgricola) {
      throw new NotFoundException('Serviço agrícola', id);
    }

    res.json(servicoAgricola);
  }

  async create(req: Request, res: Response): Promise<void> {
    const dto = req.body as CreateServicoAgricolaDto;
    const servicoAgricola = await this.servicoAgricolaService.create(dto);
    res.status(201).json(servicoAgricola);
  }

  async update(req: Request, res: Response): Promise<void> {
    const { id } = req.params;
    const dto = req.body as UpdateServicoAgricolaDto;
    const servicoId = parseInt(id, 10);
    if (isNaN(servicoId)) {
      throw new NotFoundException('Serviço agrícola', id);
    }
    
    const updatedServicoAgricola = await this.servicoAgricolaService.update(servicoId, dto);
    res.json(updatedServicoAgricola);
  }

  async delete(req: Request, res: Response): Promise<void> {
    const { id } = req.params;
    const servicoId = parseInt(id, 10);
    if (isNaN(servicoId)) {
      throw new NotFoundException('Serviço agrícola', id);
    }
    
    await this.servicoAgricolaService.delete(servicoId);
    res.status(204).send();
  }
}

export default ServicoAgricolaController;
