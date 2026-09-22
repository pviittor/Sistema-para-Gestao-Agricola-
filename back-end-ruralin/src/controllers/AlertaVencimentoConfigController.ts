import { Request, Response } from 'express';
import { Injectable, Inject } from '../core/di';
import { TYPES } from '../core/di/types';
import { IAlertaVencimentoConfigController } from './interfaces/IAlertaVencimentoConfigController';
import { IAlertaVencimentoConfigApplicationService } from '../application/services/alertaVencimentoConfig/IAlertaVencimentoConfigApplicationService';
import { NotFoundException } from '../core/exceptions';

@Injectable()
export class AlertaVencimentoConfigController implements IAlertaVencimentoConfigController {
  constructor(
    @Inject(TYPES.IAlertaVencimentoConfigApplicationService)
    private service: IAlertaVencimentoConfigApplicationService
  ) {}

  async index(req: Request, res: Response): Promise<void> {
    const result = await this.service.findByUsuario();
    res.json(result);
  }

  async create(req: Request, res: Response): Promise<void> {
    const result = await this.service.create(req.body);
    res.status(201).json(result);
  }

  async update(req: Request, res: Response): Promise<void> {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) throw new NotFoundException('AlertaVencimentoConfig', req.params.id);
    const result = await this.service.update(id, req.body);
    res.json(result);
  }

  async destroy(req: Request, res: Response): Promise<void> {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) throw new NotFoundException('AlertaVencimentoConfig', req.params.id);
    await this.service.delete(id);
    res.json({ message: 'Configuração de alerta excluída com sucesso.' });
  }
}

export default AlertaVencimentoConfigController;
