import { Request, Response } from 'express';
import { Injectable, Inject } from '../core/di';
import { TYPES } from '../core/di/types';
import { IConfiguracaoReciboController } from './interfaces/IConfiguracaoReciboController';
import { IConfiguracaoReciboApplicationService } from '../application/services/configuracaoRecibo/IConfiguracaoReciboApplicationService';
import { NotFoundException } from '../core/exceptions/NotFoundException';

@Injectable()
export class ConfiguracaoReciboController implements IConfiguracaoReciboController {
  constructor(
    @Inject(TYPES.IConfiguracaoReciboApplicationService)
    private configuracaoReciboService: IConfiguracaoReciboApplicationService
  ) {}

  async index(req: Request, res: Response): Promise<void> {
    const page = req.query.page ? Number(req.query.page) : 1;
    const limit = req.query.limit ? Number(req.query.limit) : 10;
    const result = await this.configuracaoReciboService.list(page, limit);
    res.json(result);
  }

  async show(req: Request, res: Response): Promise<void> {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) throw new NotFoundException('ConfiguracaoRecibo', req.params.id);
    const result = await this.configuracaoReciboService.findById(id);
    res.json(result);
  }

  async create(req: Request, res: Response): Promise<void> {
    const result = await this.configuracaoReciboService.create(req.body);
    res.status(201).json(result);
  }

  async update(req: Request, res: Response): Promise<void> {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) throw new NotFoundException('ConfiguracaoRecibo', req.params.id);
    const result = await this.configuracaoReciboService.update(id, req.body);
    res.json(result);
  }

  async delete(req: Request, res: Response): Promise<void> {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) throw new NotFoundException('ConfiguracaoRecibo', req.params.id);
    await this.configuracaoReciboService.delete(id);
    res.status(204).send();
  }

  async getMinhaConfig(req: Request, res: Response): Promise<void> {
    const result = await this.configuracaoReciboService.getConfigTenant();
    res.json(result || {});
  }
}
