import { Request, Response } from 'express';
import { Injectable, Inject } from '../core/di';
import { TYPES } from '../core/di/types';
import { IProdutoBenfeitoriaController } from './interfaces/IProdutoBenfeitoriaController';
import { IProdutoBenfeitoriaApplicationService } from '../application/services/produtoBenfeitoria/IProdutoBenfeitoriaApplicationService';
import { CreateProdutoBenfeitoriaDto } from '../application/dto/produtoBenfeitoria/CreateProdutoBenfeitoriaDto';
import { UpdateProdutoBenfeitoriaDto } from '../application/dto/produtoBenfeitoria/UpdateProdutoBenfeitoriaDto';
import { NotFoundException } from '../core/exceptions/NotFoundException';

/**
 * Controller responsável pelo gerenciamento de produtos benfeitoria
 *
 * Este controller atua como camada HTTP, delegando toda a lógica de negócio
 * para o ProdutoBenfeitoriaApplicationService.
 */
@Injectable()
export class ProdutoBenfeitoriaController implements IProdutoBenfeitoriaController {
  constructor(
    @Inject(TYPES.IProdutoBenfeitoriaApplicationService)
    private produtoBenfeitoriaService: IProdutoBenfeitoriaApplicationService
  ) {}

  /**
   * Lista todos os produtos benfeitoria com paginação
   */
  async index(req: Request, res: Response): Promise<void> {
    const page = req.query.page ? Number(req.query.page) : 1;
    const limit = req.query.limit ? Number(req.query.limit) : 10;

    const result = await this.produtoBenfeitoriaService.list(page, limit);

    res.json(result);
  }

  /**
   * Busca um produto benfeitoria por ID
   */
  async show(req: Request, res: Response): Promise<void> {
    const { id } = req.params;

    const prodBenfId = parseInt(id, 10);
    if (isNaN(prodBenfId)) {
      throw new NotFoundException('ProdutoBenfeitoria', id);
    }

    const produtoBenfeitoria = await this.produtoBenfeitoriaService.getById(prodBenfId);

    if (!produtoBenfeitoria) {
      throw new NotFoundException('ProdutoBenfeitoria', id);
    }

    res.json(produtoBenfeitoria);
  }

  /**
   * Cria um novo produto benfeitoria
   */
  async create(req: Request, res: Response): Promise<void> {
    const dto = req.body as CreateProdutoBenfeitoriaDto;

    const produtoBenfeitoria = await this.produtoBenfeitoriaService.create(dto);

    res.status(201).json(produtoBenfeitoria);
  }

  /**
   * Atualiza um produto benfeitoria existente
   */
  async update(req: Request, res: Response): Promise<void> {
    const { id } = req.params;
    const dto = req.body as UpdateProdutoBenfeitoriaDto;

    const prodBenfId = parseInt(id, 10);
    if (isNaN(prodBenfId)) {
      throw new NotFoundException('ProdutoBenfeitoria', id);
    }

    const updatedProdBenf = await this.produtoBenfeitoriaService.update(prodBenfId, dto);

    res.json(updatedProdBenf);
  }

  /**
   * Remove um produto benfeitoria
   */
  async delete(req: Request, res: Response): Promise<void> {
    const { id } = req.params;

    const prodBenfId = parseInt(id, 10);
    if (isNaN(prodBenfId)) {
      throw new NotFoundException('ProdutoBenfeitoria', id);
    }

    await this.produtoBenfeitoriaService.delete(prodBenfId);

    res.status(204).send();
  }
}

export default ProdutoBenfeitoriaController;
