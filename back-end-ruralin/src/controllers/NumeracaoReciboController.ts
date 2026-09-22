import { Request, Response } from 'express';
import { Injectable, Inject } from '../core/di';
import { TYPES } from '../core/di/types';
import { INumeracaoReciboController } from './interfaces/INumeracaoReciboController';
import { INumeracaoReciboApplicationService } from '../application/services/numeracaoRecibo/INumeracaoReciboApplicationService';
import { NotFoundException } from '../core/exceptions/NotFoundException';

@Injectable()
export class NumeracaoReciboController implements INumeracaoReciboController {
  constructor(
    @Inject(TYPES.INumeracaoReciboApplicationService)
    private numeracaoReciboService: INumeracaoReciboApplicationService
  ) {}

  async index(req: Request, res: Response): Promise<void> {
    const page = req.query.page ? Number(req.query.page) : 1;
    const limit = req.query.limit ? Number(req.query.limit) : 10;
    const result = await this.numeracaoReciboService.list(page, limit);
    res.json(result);
  }

  async show(req: Request, res: Response): Promise<void> {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) throw new NotFoundException('NumeracaoRecibo', req.params.id);
    const result = await this.numeracaoReciboService.findById(id);
    res.json(result);
  }

  async create(req: Request, res: Response): Promise<void> {
    const result = await this.numeracaoReciboService.create(req.body);
    res.status(201).json(result);
  }

  async update(req: Request, res: Response): Promise<void> {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) throw new NotFoundException('NumeracaoRecibo', req.params.id);
    const result = await this.numeracaoReciboService.update(id, req.body);
    res.json(result);
  }

  async delete(req: Request, res: Response): Promise<void> {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) throw new NotFoundException('NumeracaoRecibo', req.params.id);
    await this.numeracaoReciboService.delete(id);
    res.status(204).send();
  }
}
