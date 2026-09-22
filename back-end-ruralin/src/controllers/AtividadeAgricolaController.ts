import { Request, Response } from 'express';
import { Injectable, Inject } from '../core/di';
import { TYPES } from '../core/di/types';
import { IAtividadeAgricolaController } from './interfaces/IAtividadeAgricolaController';
import { IAtividadeAgricolaApplicationService } from '../application/services/atividadeAgricola/IAtividadeAgricolaApplicationService';
import { CreateAtividadeAgricolaDto } from '../application/dto/atividadeAgricola/CreateAtividadeAgricolaDto';
import { UpdateAtividadeAgricolaDto } from '../application/dto/atividadeAgricola/UpdateAtividadeAgricolaDto';
import { NotFoundException } from '../core/exceptions/NotFoundException';

/**
 * Controller responsável pelo gerenciamento de atividades agrícolas
 *
 * Este controller atua como camada HTTP, delegando toda a lógica de negócio
 * para o AtividadeAgricolaApplicationService.
 */
@Injectable()
export class AtividadeAgricolaController implements IAtividadeAgricolaController {
  constructor(
    @Inject(TYPES.IAtividadeAgricolaApplicationService)
    private atividadeAgricolaService: IAtividadeAgricolaApplicationService
  ) {}

  /**
   * Lista todas as atividades agrícolas com paginação
   */
  async index(req: Request, res: Response): Promise<void> {
    const page = req.query.page ? Number(req.query.page) : 1;
    const limit = req.query.limit ? Number(req.query.limit) : 10;

    const result = await this.atividadeAgricolaService.list(page, limit);

    res.json(result);
  }

  /**
   * Busca uma atividade agrícola por ID
   */
  async show(req: Request, res: Response): Promise<void> {
    const { id } = req.params;

    const atvId = parseInt(id, 10);
    if (isNaN(atvId)) {
      throw new NotFoundException('Atividade agrícola', id);
    }

    const atividadeAgricola = await this.atividadeAgricolaService.getById(atvId);

    if (!atividadeAgricola) {
      throw new NotFoundException('Atividade agrícola', id);
    }

    res.json(atividadeAgricola);
  }

  /**
   * Cria uma nova atividade agrícola
   */
  async create(req: Request, res: Response): Promise<void> {
    const dto = req.body as CreateAtividadeAgricolaDto;

    const atividadeAgricola = await this.atividadeAgricolaService.create(dto);

    res.status(201).json(atividadeAgricola);
  }

  /**
   * Atualiza uma atividade agrícola existente
   */
  async update(req: Request, res: Response): Promise<void> {
    const { id } = req.params;
    const dto = req.body as UpdateAtividadeAgricolaDto;

    const atvId = parseInt(id, 10);
    if (isNaN(atvId)) {
      throw new NotFoundException('Atividade agrícola', id);
    }

    const updatedAtividadeAgricola = await this.atividadeAgricolaService.update(atvId, dto);

    res.json(updatedAtividadeAgricola);
  }

  /**
   * Remove uma atividade agrícola
   */
  async delete(req: Request, res: Response): Promise<void> {
    const { id } = req.params;

    const atvId = parseInt(id, 10);
    if (isNaN(atvId)) {
      throw new NotFoundException('Atividade agrícola', id);
    }

    await this.atividadeAgricolaService.delete(atvId);

    res.status(204).send();
  }
}

export default AtividadeAgricolaController;
