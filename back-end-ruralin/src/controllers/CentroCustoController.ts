import { Request, Response } from 'express';
import { Injectable, Inject } from '../core/di';
import { TYPES } from '../core/di/types';
import { ICentroCustoController } from './interfaces/ICentroCustoController';
import { ICentroCustoApplicationService } from '../application/services/centroCusto/ICentroCustoApplicationService';
import { CreateCentroCustoDto, UpdateCentroCustoDto } from '../application/dto/centroCusto';

/**
 * Controller para CentroCusto
 */
@Injectable()
export class CentroCustoController implements ICentroCustoController {
  constructor(
    @Inject(TYPES.ICentroCustoApplicationService) private centroCustoService: ICentroCustoApplicationService
  ) {}

  /**
   * Lista todos os centros de custo paginados
   */
  async index(req: Request, res: Response): Promise<void> {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;

    const result = await this.centroCustoService.list(page, limit);
    res.json({
      success: true,
      data: result,
    });
  }

  /**
   * Lista todos os centros de custo sem paginação
   */
  async listAll(req: Request, res: Response): Promise<void> {
    const centrosCusto = await this.centroCustoService.listAll();
    res.json({
      success: true,
      data: centrosCusto,
    });
  }

  /**
   * Busca um centro de custo por ID
   */
  async show(req: Request, res: Response): Promise<void> {
    const id = parseInt(req.params.id);
    const centroCusto = await this.centroCustoService.show(id);
    res.json({
      success: true,
      data: centroCusto,
    });
  }

  /**
   * Busca centros de custo filhos de um pai específico
   */
  async findByPai(req: Request, res: Response): Promise<void> {
    const centroCustoPaiId = parseInt(req.params.centroCustoPaiId);
    const centrosCusto = await this.centroCustoService.findByPai(centroCustoPaiId);
    res.json({
      success: true,
      data: centrosCusto,
    });
  }

  /**
   * Cria um novo centro de custo
   */
  async create(req: Request, res: Response): Promise<void> {
    const dto = req.body as CreateCentroCustoDto;
    const centroCusto = await this.centroCustoService.create(dto);
    res.status(201).json({
      success: true,
      data: centroCusto,
    });
  }

  /**
   * Atualiza um centro de custo
   */
  async update(req: Request, res: Response): Promise<void> {
    const id = parseInt(req.params.id);
    const dto = req.body as UpdateCentroCustoDto;
    const centroCusto = await this.centroCustoService.update(id, dto);
    res.json({
      success: true,
      data: centroCusto,
    });
  }

  /**
   * Deleta um centro de custo
   */
  async delete(req: Request, res: Response): Promise<void> {
    const id = parseInt(req.params.id);
    await this.centroCustoService.delete(id);
    res.status(204).send();
  }
}
