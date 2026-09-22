import { Request, Response } from 'express';
import { Injectable, Inject } from '../core/di';
import { TYPES } from '../core/di/types';
import { IApontamentoMaquinasController } from './interfaces/IApontamentoMaquinasController';
import { IApontamentoMaquinasApplicationService } from '../application/services/apontamentoMaquinas/IApontamentoMaquinasApplicationService';
import { CreateApontamentoMaquinasDto } from '../application/dto/apontamentoMaquinas/CreateApontamentoMaquinasDto';
import { UpdateApontamentoMaquinasDto } from '../application/dto/apontamentoMaquinas/UpdateApontamentoMaquinasDto';
import { NotFoundException } from '../core/exceptions/NotFoundException';

/**
 * Controller responsavel pelo gerenciamento de apontamentos de maquinas
 *
 * Este controller atua como camada HTTP, delegando toda a logica de negocio
 * para o ApontamentoMaquinasApplicationService.
 */
@Injectable()
export class ApontamentoMaquinasController implements IApontamentoMaquinasController {
  constructor(
    @Inject(TYPES.IApontamentoMaquinasApplicationService)
    private apontamentoMaquinasService: IApontamentoMaquinasApplicationService
  ) {}

  /**
   * Lista todos os apontamentos de maquinas com paginacao
   */
  async index(req: Request, res: Response): Promise<void> {
    const page = req.query.page ? Number(req.query.page) : 1;
    const limit = req.query.limit ? Number(req.query.limit) : 10;

    const result = await this.apontamentoMaquinasService.list(page, limit);

    res.json(result);
  }

  /**
   * Busca um apontamento de maquina por ID
   */
  async show(req: Request, res: Response): Promise<void> {
    const { id } = req.params;

    const apontamentoMaquinasId = parseInt(id, 10);
    if (isNaN(apontamentoMaquinasId)) {
      throw new NotFoundException('ApontamentoMaquinas', id);
    }

    const apontamentoMaquinas = await this.apontamentoMaquinasService.getById(apontamentoMaquinasId);

    if (!apontamentoMaquinas) {
      throw new NotFoundException('ApontamentoMaquinas', id);
    }

    res.json(apontamentoMaquinas);
  }

  /**
   * Cria um novo apontamento de maquina
   */
  async create(req: Request, res: Response): Promise<void> {
    const dto = req.body as CreateApontamentoMaquinasDto;

    const apontamentoMaquinas = await this.apontamentoMaquinasService.create(dto);

    res.status(201).json(apontamentoMaquinas);
  }

  /**
   * Atualiza um apontamento de maquina existente
   */
  async update(req: Request, res: Response): Promise<void> {
    const { id } = req.params;
    const dto = req.body as UpdateApontamentoMaquinasDto;

    const apontamentoMaquinasId = parseInt(id, 10);
    if (isNaN(apontamentoMaquinasId)) {
      throw new NotFoundException('ApontamentoMaquinas', id);
    }

    const updatedApontamentoMaquinas = await this.apontamentoMaquinasService.update(apontamentoMaquinasId, dto);

    res.json(updatedApontamentoMaquinas);
  }

  /**
   * Remove um apontamento de maquina
   */
  async delete(req: Request, res: Response): Promise<void> {
    const { id } = req.params;

    const apontamentoMaquinasId = parseInt(id, 10);
    if (isNaN(apontamentoMaquinasId)) {
      throw new NotFoundException('ApontamentoMaquinas', id);
    }

    await this.apontamentoMaquinasService.delete(apontamentoMaquinasId);

    res.status(204).send();
  }
}

export default ApontamentoMaquinasController;
