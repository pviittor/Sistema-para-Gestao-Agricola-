/**
 * TipoAtividadeOSController - Controller HTTP para Tipos de Atividade de OS
 *
 * Controller responsável pelo gerenciamento de tipos de atividade de OS via HTTP.
 * Segue o padrão master-detail com CamposCondicionais.
 *
 * Response Format B (Unwrapped): res.json(result) direto.
 */

import { Request, Response } from 'express';
import { Injectable, Inject } from '../core/di';
import { TYPES } from '../core/di/types';
import { ITipoAtividadeOSController } from './interfaces/ITipoAtividadeOSController';
import { ITipoAtividadeOSApplicationService } from '../application/services/tipoAtividadeOS/ITipoAtividadeOSApplicationService';
import { CreateTipoAtividadeOSCompletoDto } from '../application/dto/tipoAtividadeOS/CreateTipoAtividadeOSCompletoDto';
import { UpdateTipoAtividadeOSCompletoDto } from '../application/dto/tipoAtividadeOS/UpdateTipoAtividadeOSCompletoDto';
import { NotFoundException } from '../core/exceptions';

@Injectable()
export class TipoAtividadeOSController implements ITipoAtividadeOSController {
  constructor(
    @Inject(TYPES.ITipoAtividadeOSApplicationService)
    private tipoAtividadeOSService: ITipoAtividadeOSApplicationService
  ) {}

  /**
   * Lista tipos de atividade OS com paginação
   * GET /api/tipos-atividade-os?page=1&limit=10
   */
  async list(req: Request, res: Response): Promise<void> {
    const page = req.query.page ? Number(req.query.page) : 1;
    const limit = req.query.limit ? Number(req.query.limit) : 10;

    const result = await this.tipoAtividadeOSService.list(page, limit);

    res.json(result);
  }

  /**
   * Lista todos os tipos de atividade OS sem paginação
   * GET /api/tipos-atividade-os/all
   */
  async listAll(req: Request, res: Response): Promise<void> {
    const result = await this.tipoAtividadeOSService.listAll();

    res.json(result);
  }

  /**
   * Busca um tipo de atividade OS por ID
   * GET /api/tipos-atividade-os/:id
   */
  async getById(req: Request, res: Response): Promise<void> {
    const { id } = req.params;

    const tipoAtividadeOSId = parseInt(id, 10);
    if (isNaN(tipoAtividadeOSId)) {
      throw new NotFoundException('Tipo de Atividade OS', id);
    }

    const tipoAtividadeOS = await this.tipoAtividadeOSService.getById(tipoAtividadeOSId);

    if (!tipoAtividadeOS) {
      throw new NotFoundException('Tipo de Atividade OS', id);
    }

    res.json(tipoAtividadeOS);
  }

  /**
   * Cria um tipo de atividade OS completo com campos condicionais
   * POST /api/tipos-atividade-os/completo
   */
  async createCompleto(req: Request, res: Response): Promise<void> {
    const dto = req.body as CreateTipoAtividadeOSCompletoDto;

    const result = await this.tipoAtividadeOSService.createCompleto(dto);

    res.status(201).json(result);
  }

  /**
   * Atualiza um tipo de atividade OS completo com campos condicionais
   * PUT /api/tipos-atividade-os/:id/completo
   */
  async updateCompleto(req: Request, res: Response): Promise<void> {
    const { id } = req.params;
    const dto = req.body as UpdateTipoAtividadeOSCompletoDto;

    const tipoAtividadeOSId = parseInt(id, 10);
    if (isNaN(tipoAtividadeOSId)) {
      throw new NotFoundException('Tipo de Atividade OS', id);
    }

    const result = await this.tipoAtividadeOSService.updateCompleto(tipoAtividadeOSId, dto);

    res.json(result);
  }

  /**
   * Remove um tipo de atividade OS
   * DELETE /api/tipos-atividade-os/:id
   */
  async delete(req: Request, res: Response): Promise<void> {
    const { id } = req.params;

    const tipoAtividadeOSId = parseInt(id, 10);
    if (isNaN(tipoAtividadeOSId)) {
      throw new NotFoundException('Tipo de Atividade OS', id);
    }

    await this.tipoAtividadeOSService.delete(tipoAtividadeOSId);

    res.status(204).send();
  }
}

export default TipoAtividadeOSController;
