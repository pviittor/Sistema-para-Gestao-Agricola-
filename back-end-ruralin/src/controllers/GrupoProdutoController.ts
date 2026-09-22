import { Request, Response } from 'express';
import { Injectable, Inject } from '../core/di';
import { TYPES } from '../core/di/types';
import { IGrupoProdutoController } from './interfaces/IGrupoProdutoController';
import { IGrupoProdutoApplicationService } from '../application/services/grupoProduto/IGrupoProdutoApplicationService';
import { CreateGrupoProdutoDto } from '../application/dto/grupoProduto/CreateGrupoProdutoDto';
import { UpdateGrupoProdutoDto } from '../application/dto/grupoProduto/UpdateGrupoProdutoDto';
import { NotFoundException } from '../core/exceptions/NotFoundException';

/**
 * Controller responsável pelo gerenciamento de grupos de produto
 * 
 * Este controller atua como camada HTTP, delegando toda a lógica de negócio
 * para o GrupoProdutoApplicationService.
 */
@Injectable()
export class GrupoProdutoController implements IGrupoProdutoController {
  constructor(
    @Inject(TYPES.IGrupoProdutoApplicationService)
    private grupoProdutoService: IGrupoProdutoApplicationService
  ) {}

  /**
   * Lista todas as grupos de produto com paginação
   */
  async index(req: Request, res: Response): Promise<void> {
    const page = req.query.page ? Number(req.query.page) : 1;
    const limit = req.query.limit ? Number(req.query.limit) : 10;
    
    const result = await this.grupoProdutoService.list(page, limit);

    res.json(result);
  }

  /**
   * Busca um grupo de produto por ID
   */
  async show(req: Request, res: Response): Promise<void> {
    const { id } = req.params;
    
    const grupoProdutoId = parseInt(id, 10);
    if (isNaN(grupoProdutoId)) {
      throw new NotFoundException('Grupo de produto', id);
    }
    
    const grupoProduto = await this.grupoProdutoService.getById(grupoProdutoId);
    
    if (!grupoProduto) {
      throw new NotFoundException('Grupo de produto', id);
    }

    res.json(grupoProduto);
  }

  /**
   * Cria um novo grupo de produto
   */
  async create(req: Request, res: Response): Promise<void> {
    const dto = req.body as CreateGrupoProdutoDto;
    
    const grupoProduto = await this.grupoProdutoService.create(dto);
    
    res.status(201).json(grupoProduto);
  }

  /**
   * Atualiza um grupo de produto existente
   */
  async update(req: Request, res: Response): Promise<void> {
    const { id } = req.params;
    const dto = req.body as UpdateGrupoProdutoDto;
    
    const grupoProdutoId = parseInt(id, 10);
    if (isNaN(grupoProdutoId)) {
      throw new NotFoundException('Grupo de produto', id);
    }
    
    const updatedGrupoProduto = await this.grupoProdutoService.update(grupoProdutoId, dto);
    
    res.json(updatedGrupoProduto);
  }

  /**
   * Remove um grupo de produto
   */
  async delete(req: Request, res: Response): Promise<void> {
    const { id } = req.params;
    
    const grupoProdutoId = parseInt(id, 10);
    if (isNaN(grupoProdutoId)) {
      throw new NotFoundException('Grupo de produto', id);
    }
    
    await this.grupoProdutoService.delete(grupoProdutoId);

    res.status(204).send();
  }
}

export default GrupoProdutoController;
