import { Request, Response } from 'express';
import { Injectable, Inject } from '../core/di';
import { TYPES } from '../core/di/types';
import { IBenfeitoriaController } from './interfaces/IBenfeitoriaController';
import { IBenfeitoriaApplicationService } from '../application/services/benfeitoria/IBenfeitoriaApplicationService';
import { CreateBenfeitoriaDto } from '../application/dto/benfeitoria/CreateBenfeitoriaDto';
import { UpdateBenfeitoriaDto } from '../application/dto/benfeitoria/UpdateBenfeitoriaDto';
import { NotFoundException } from '../core/exceptions/NotFoundException';

/**
 * Controller responsável pelo gerenciamento de benfeitorias
 *
 * Este controller atua como camada HTTP, delegando toda a lógica de negócio
 * para o BenfeitoriaApplicationService.
 */
@Injectable()
export class BenfeitoriaController implements IBenfeitoriaController {
  constructor(
    @Inject(TYPES.IBenfeitoriaApplicationService)
    private benfeitoriaService: IBenfeitoriaApplicationService
  ) {}

  /**
   * Lista todas as benfeitorias com paginação
   */
  async index(req: Request, res: Response): Promise<void> {
    const page = req.query.page ? Number(req.query.page) : 1;
    const limit = req.query.limit ? Number(req.query.limit) : 10;

    const result = await this.benfeitoriaService.list(page, limit);

    res.json(result);
  }

  /**
   * Busca uma benfeitoria por ID
   */
  async show(req: Request, res: Response): Promise<void> {
    const { id } = req.params;

    const benfId = parseInt(id, 10);
    if (isNaN(benfId)) {
      throw new NotFoundException('Benfeitoria', id);
    }

    const benfeitoria = await this.benfeitoriaService.getById(benfId);

    if (!benfeitoria) {
      throw new NotFoundException('Benfeitoria', id);
    }

    res.json(benfeitoria);
  }

  /**
   * Cria uma nova benfeitoria
   */
  async create(req: Request, res: Response): Promise<void> {
    const dto = req.body as CreateBenfeitoriaDto;

    const benfeitoria = await this.benfeitoriaService.create(dto);

    res.status(201).json(benfeitoria);
  }

  /**
   * Atualiza uma benfeitoria existente
   */
  async update(req: Request, res: Response): Promise<void> {
    const { id } = req.params;
    const dto = req.body as UpdateBenfeitoriaDto;

    const benfId = parseInt(id, 10);
    if (isNaN(benfId)) {
      throw new NotFoundException('Benfeitoria', id);
    }

    const updatedBenf = await this.benfeitoriaService.update(benfId, dto);

    res.json(updatedBenf);
  }

  /**
   * Remove uma benfeitoria
   */
  async delete(req: Request, res: Response): Promise<void> {
    const { id } = req.params;

    const benfId = parseInt(id, 10);
    if (isNaN(benfId)) {
      throw new NotFoundException('Benfeitoria', id);
    }

    await this.benfeitoriaService.delete(benfId);

    res.status(204).send();
  }
}

export default BenfeitoriaController;
