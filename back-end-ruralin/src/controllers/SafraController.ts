import { Request, Response } from 'express';
import { Injectable, Inject } from '../core/di';
import { TYPES } from '../core/di/types';
import { ISafraController } from './interfaces/ISafraController';
import { ISafraApplicationService } from '../application/services/safra/ISafraApplicationService';
import { CreateSafraDto, UpdateSafraDto } from '../application/dto/safra';

/**
 * Controller para Safra
 */
@Injectable()
export class SafraController implements ISafraController {
  constructor(
    @Inject(TYPES.ISafraApplicationService) private safraService: ISafraApplicationService
  ) {}

  /**
   * Lista todas as safras paginadas
   */
  async index(req: Request, res: Response): Promise<void> {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;

    const result = await this.safraService.list(page, limit);
    res.json({
      success: true,
      data: result,
    });
  }

  /**
   * Lista todas as safras sem paginação
   */
  async listAll(req: Request, res: Response): Promise<void> {
    const safras = await this.safraService.listAll();
    res.json({
      success: true,
      data: safras,
    });
  }

  /**
   * Busca uma safra por ID
   */
  async show(req: Request, res: Response): Promise<void> {
    const id = parseInt(req.params.id);
    const safra = await this.safraService.show(id);
    res.json({
      success: true,
      data: safra,
    });
  }

  /**
   * Busca safras por cultura
   */
  async findByCultura(req: Request, res: Response): Promise<void> {
    const culturaId = parseInt(req.params.culturaId);
    const safras = await this.safraService.findByCultura(culturaId);
    res.json({
      success: true,
      data: safras,
    });
  }

  /**
   * Busca safras por status
   */
  async findByStatus(req: Request, res: Response): Promise<void> {
    const status = req.params.status;
    const safras = await this.safraService.findByStatus(status as any);
    res.json({
      success: true,
      data: safras,
    });
  }

  /**
   * Cria uma nova safra
   */
  async create(req: Request, res: Response): Promise<void> {
    const dto = req.body as CreateSafraDto;
    const safra = await this.safraService.create(dto);
    res.status(201).json({
      success: true,
      data: safra,
    });
  }

  /**
   * Atualiza uma safra
   */
  async update(req: Request, res: Response): Promise<void> {
    const id = parseInt(req.params.id);
    const dto = req.body as UpdateSafraDto;
    const safra = await this.safraService.update(id, dto);
    res.json({
      success: true,
      data: safra,
    });
  }

  /**
   * Deleta uma safra
   */
  async delete(req: Request, res: Response): Promise<void> {
    const id = parseInt(req.params.id);
    await this.safraService.delete(id);
    res.status(204).send();
  }
}
