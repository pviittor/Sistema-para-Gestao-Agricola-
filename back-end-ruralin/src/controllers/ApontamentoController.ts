import { Request, Response } from 'express';
import { Injectable, Inject } from '../core/di';
import { TYPES } from '../core/di/types';
import { IApontamentoController } from './interfaces/IApontamentoController';
import { IApontamentoApplicationService } from '../application/services/apontamento/IApontamentoApplicationService';
import { CreateApontamentoDto } from '../application/dto/apontamento/CreateApontamentoDto';
import { UpdateApontamentoDto } from '../application/dto/apontamento/UpdateApontamentoDto';
import { NotFoundException } from '../core/exceptions/NotFoundException';

/**
 * Controller responsavel pelo gerenciamento de apontamentos
 *
 * Este controller atua como camada HTTP, delegando toda a logica de negocio
 * para o ApontamentoApplicationService.
 */
@Injectable()
export class ApontamentoController implements IApontamentoController {
  constructor(
    @Inject(TYPES.IApontamentoApplicationService)
    private apontamentoService: IApontamentoApplicationService
  ) {}

  /**
   * Lista todos os apontamentos com paginacao
   */
  async index(req: Request, res: Response): Promise<void> {
    const page = req.query.page ? Number(req.query.page) : 1;
    const limit = req.query.limit ? Number(req.query.limit) : 10;

    const result = await this.apontamentoService.list(page, limit);

    res.json(result);
  }

  /**
   * Busca um apontamento por ID
   */
  async show(req: Request, res: Response): Promise<void> {
    const { id } = req.params;

    const apontamentoId = parseInt(id, 10);
    if (isNaN(apontamentoId)) {
      throw new NotFoundException('Apontamento', id);
    }

    const apontamento = await this.apontamentoService.getById(apontamentoId);

    if (!apontamento) {
      throw new NotFoundException('Apontamento', id);
    }

    res.json(apontamento);
  }

  /**
   * Cria um novo apontamento
   */
  async create(req: Request, res: Response): Promise<void> {
    const dto = req.body as CreateApontamentoDto;

    const apontamento = await this.apontamentoService.create(dto);

    res.status(201).json(apontamento);
  }

  /**
   * Atualiza um apontamento existente
   */
  async update(req: Request, res: Response): Promise<void> {
    const { id } = req.params;
    const dto = req.body as UpdateApontamentoDto;

    const apontamentoId = parseInt(id, 10);
    if (isNaN(apontamentoId)) {
      throw new NotFoundException('Apontamento', id);
    }

    const updatedApontamento = await this.apontamentoService.update(apontamentoId, dto);

    res.json(updatedApontamento);
  }

  /**
   * Remove um apontamento
   */
  async delete(req: Request, res: Response): Promise<void> {
    const { id } = req.params;

    const apontamentoId = parseInt(id, 10);
    if (isNaN(apontamentoId)) {
      throw new NotFoundException('Apontamento', id);
    }

    await this.apontamentoService.delete(apontamentoId);

    res.status(204).send();
  }
}

export default ApontamentoController;
