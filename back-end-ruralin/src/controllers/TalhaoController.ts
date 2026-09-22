import { Request, Response } from 'express';
import { Injectable, Inject } from '../core/di';
import { TYPES } from '../core/di/types';
import { ITalhaoController } from './interfaces/ITalhaoController';
import { ITalhaoApplicationService } from '../application/services/talhao/ITalhaoApplicationService';
import { CreateTalhaoDto } from '../application/dto/talhao/CreateTalhaoDto';
import { UpdateTalhaoDto } from '../application/dto/talhao/UpdateTalhaoDto';
import { NotFoundException } from '../core/exceptions/NotFoundException';

/**
 * Controller responsável pelo gerenciamento de talhões
 *
 * Este controller atua como camada HTTP, delegando toda a lógica de negócio
 * para o TalhaoApplicationService.
 */
@Injectable()
export class TalhaoController implements ITalhaoController {
  constructor(
    @Inject(TYPES.ITalhaoApplicationService)
    private talhaoService: ITalhaoApplicationService
  ) {}

  /**
   * Lista todos os talhões com paginação
   */
  async index(req: Request, res: Response): Promise<void> {
    const page = req.query.page ? Number(req.query.page) : 1;
    const limit = req.query.limit ? Number(req.query.limit) : 10;

    const result = await this.talhaoService.list(page, limit);

    res.json(result);
  }

  /**
   * Lista todos os talhões sem paginação (para selects/combos)
   */
  async listAll(req: Request, res: Response): Promise<void> {
    const result = await this.talhaoService.listAll();
    res.json(result);
  }

  /**
   * Busca um talhão por ID
   */
  async show(req: Request, res: Response): Promise<void> {
    const { id } = req.params;

    const talhaoId = parseInt(id, 10);
    if (isNaN(talhaoId)) {
      throw new NotFoundException('Talhão', id);
    }

    const talhao = await this.talhaoService.getById(talhaoId);

    if (!talhao) {
      throw new NotFoundException('Talhão', id);
    }

    res.json(talhao);
  }

  /**
   * Busca talhões por fazenda
   */
  async findByFazenda(req: Request, res: Response): Promise<void> {
    const { fazendaId } = req.params;

    const id = parseInt(fazendaId, 10);
    if (isNaN(id)) {
      throw new NotFoundException('Fazenda', fazendaId);
    }

    const talhoes = await this.talhaoService.findByFazenda(id);
    res.json(talhoes);
  }

  /**
   * Busca dados NDVI/satélite de um talhão
   */
  async getNdvi(req: Request, res: Response): Promise<void> {
    const { id } = req.params;

    const talhaoId = parseInt(id, 10);
    if (isNaN(talhaoId)) {
      throw new NotFoundException('Talhão', id);
    }

    const startDate = req.query.start ? Number(req.query.start) : undefined;
    const endDate = req.query.end ? Number(req.query.end) : undefined;

    const result = await this.talhaoService.getNdviData(talhaoId, startDate, endDate);
    res.json(result);
  }

  /**
   * Cria um novo talhão
   */
  async create(req: Request, res: Response): Promise<void> {
    const dto = req.body as CreateTalhaoDto;

    const talhao = await this.talhaoService.create(dto);

    res.status(201).json(talhao);
  }

  /**
   * Atualiza um talhão existente
   */
  async update(req: Request, res: Response): Promise<void> {
    const { id } = req.params;
    const dto = req.body as UpdateTalhaoDto;

    const talhaoId = parseInt(id, 10);
    if (isNaN(talhaoId)) {
      throw new NotFoundException('Talhão', id);
    }

    const updatedTalhao = await this.talhaoService.update(talhaoId, dto);

    res.json(updatedTalhao);
  }

  /**
   * Remove um talhão
   */
  async delete(req: Request, res: Response): Promise<void> {
    const { id } = req.params;

    const talhaoId = parseInt(id, 10);
    if (isNaN(talhaoId)) {
      throw new NotFoundException('Talhão', id);
    }

    await this.talhaoService.delete(talhaoId);

    res.status(204).send();
  }
}

export default TalhaoController;
