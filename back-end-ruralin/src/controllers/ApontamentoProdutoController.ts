import { Request, Response } from 'express';
import { Injectable, Inject } from '../core/di';
import { TYPES } from '../core/di/types';
import { IApontamentoProdutoController } from './interfaces/IApontamentoProdutoController';
import { IApontamentoProdutoApplicationService } from '../application/services/apontamentoProduto/IApontamentoProdutoApplicationService';
import { CreateApontamentoProdutoDto } from '../application/dto/apontamentoProduto/CreateApontamentoProdutoDto';
import { UpdateApontamentoProdutoDto } from '../application/dto/apontamentoProduto/UpdateApontamentoProdutoDto';
import { NotFoundException } from '../core/exceptions/NotFoundException';

/**
 * Controller responsável pelo gerenciamento de apontamentos de produto
 *
 * Este controller atua como camada HTTP, delegando toda a lógica de negócio
 * para o ApontamentoProdutoApplicationService.
 */
@Injectable()
export class ApontamentoProdutoController implements IApontamentoProdutoController {
  constructor(
    @Inject(TYPES.IApontamentoProdutoApplicationService)
    private apontamentoProdutoService: IApontamentoProdutoApplicationService
  ) {}

  /**
   * Lista todos os apontamentos de produto com paginação
   */
  async index(req: Request, res: Response): Promise<void> {
    const page = req.query.page ? Number(req.query.page) : 1;
    const limit = req.query.limit ? Number(req.query.limit) : 10;

    const result = await this.apontamentoProdutoService.list(page, limit);

    res.json(result);
  }

  /**
   * Busca um apontamento de produto por ID
   */
  async show(req: Request, res: Response): Promise<void> {
    const { id } = req.params;

    const aptProdId = parseInt(id, 10);
    if (isNaN(aptProdId)) {
      throw new NotFoundException('ApontamentoProduto', id);
    }

    const apontamentoProduto = await this.apontamentoProdutoService.getById(aptProdId);

    if (!apontamentoProduto) {
      throw new NotFoundException('ApontamentoProduto', id);
    }

    res.json(apontamentoProduto);
  }

  /**
   * Cria um novo apontamento de produto
   */
  async create(req: Request, res: Response): Promise<void> {
    const dto = req.body as CreateApontamentoProdutoDto;

    const apontamentoProduto = await this.apontamentoProdutoService.create(dto);

    res.status(201).json(apontamentoProduto);
  }

  /**
   * Atualiza um apontamento de produto existente
   */
  async update(req: Request, res: Response): Promise<void> {
    const { id } = req.params;
    const dto = req.body as UpdateApontamentoProdutoDto;

    const aptProdId = parseInt(id, 10);
    if (isNaN(aptProdId)) {
      throw new NotFoundException('ApontamentoProduto', id);
    }

    const updatedAptProd = await this.apontamentoProdutoService.update(aptProdId, dto);

    res.json(updatedAptProd);
  }

  /**
   * Remove um apontamento de produto
   */
  async delete(req: Request, res: Response): Promise<void> {
    const { id } = req.params;

    const aptProdId = parseInt(id, 10);
    if (isNaN(aptProdId)) {
      throw new NotFoundException('ApontamentoProduto', id);
    }

    await this.apontamentoProdutoService.delete(aptProdId);

    res.status(204).send();
  }
}

export default ApontamentoProdutoController;
