import { Request, Response } from 'express';
import { Injectable, Inject } from '../core/di';
import { TYPES } from '../core/di/types';
import { ICfopController } from './interfaces/ICfopController';
import { ICfopApplicationService } from '../application/services/cfop/ICfopApplicationService';
import { CreateCfopDto } from '../application/dto/cfop/CreateCfopDto';
import { UpdateCfopDto } from '../application/dto/cfop/UpdateCfopDto';
import { NotFoundException } from '../core/exceptions/NotFoundException';

/**
 * Controller responsável pelo gerenciamento de CFOPs
 *
 * Este controller atua como camada HTTP, delegando toda a lógica de negócio
 * para o CfopApplicationService.
 */
@Injectable()
export class CfopController implements ICfopController {
  constructor(
    @Inject(TYPES.ICfopApplicationService)
    private cfopService: ICfopApplicationService
  ) {}

  /**
   * Lista todos os CFOPs com paginação
   */
  async index(req: Request, res: Response): Promise<void> {
    const page = req.query.page ? Number(req.query.page) : 1;
    const limit = req.query.limit ? Number(req.query.limit) : 10;

    const result = await this.cfopService.list(page, limit);

    res.json(result);
  }

  /**
   * Busca um CFOP por ID
   */
  async show(req: Request, res: Response): Promise<void> {
    const { id } = req.params;

    const cfopId = parseInt(id, 10);
    if (isNaN(cfopId)) {
      throw new NotFoundException('CFOP', id);
    }

    const cfop = await this.cfopService.getById(cfopId);

    if (!cfop) {
      throw new NotFoundException('CFOP', id);
    }

    res.json(cfop);
  }

  /**
   * Cria um novo CFOP
   */
  async create(req: Request, res: Response): Promise<void> {
    const dto = req.body as CreateCfopDto;

    const cfop = await this.cfopService.create(dto);

    res.status(201).json(cfop);
  }

  /**
   * Atualiza um CFOP existente
   */
  async update(req: Request, res: Response): Promise<void> {
    const { id } = req.params;
    const dto = req.body as UpdateCfopDto;

    const cfopId = parseInt(id, 10);
    if (isNaN(cfopId)) {
      throw new NotFoundException('CFOP', id);
    }

    const updatedCfop = await this.cfopService.update(cfopId, dto);

    res.json(updatedCfop);
  }

  /**
   * Remove um CFOP
   */
  async delete(req: Request, res: Response): Promise<void> {
    const { id } = req.params;

    const cfopId = parseInt(id, 10);
    if (isNaN(cfopId)) {
      throw new NotFoundException('CFOP', id);
    }

    await this.cfopService.delete(cfopId);

    res.status(204).send();
  }

  /**
   * Lista todos os CFOPs ativos sem paginação
   */
  async listAll(req: Request, res: Response): Promise<void> {
    const result = await this.cfopService.listAll();

    res.json(result);
  }
}

export default CfopController;
