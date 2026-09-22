import { Request, Response } from 'express';
import { Injectable, Inject } from '../core/di';
import { TYPES } from '../core/di/types';
import { ISubGrupoProdutoController } from './interfaces/ISubGrupoProdutoController';
import { ISubGrupoProdutoApplicationService } from '../application/services/subGrupoProduto/ISubGrupoProdutoApplicationService';
import { CreateSubGrupoProdutoDto } from '../application/dto/subGrupoProduto/CreateSubGrupoProdutoDto';
import { UpdateSubGrupoProdutoDto } from '../application/dto/subGrupoProduto/UpdateSubGrupoProdutoDto';
import { NotFoundException } from '../core/exceptions/NotFoundException';

/**
 * Controller responsável pelo gerenciamento de subgrupos de produto
 * 
 * Este controller atua como camada HTTP, delegando toda a lógica de negócio
 * para o SubGrupoProdutoApplicationService.
 */
@Injectable()
export class SubGrupoProdutoController implements ISubGrupoProdutoController {
  constructor(
    @Inject(TYPES.ISubGrupoProdutoApplicationService)
    private subGrupoProdutoService: ISubGrupoProdutoApplicationService
  ) {}

  /**
   * Lista todas as subgrupos de produto com paginação
   */
  async index(req: Request, res: Response): Promise<void> {
    const page = req.query.page ? Number(req.query.page) : 1;
    const limit = req.query.limit ? Number(req.query.limit) : 10;
    
    const result = await this.subGrupoProdutoService.list(page, limit);

    res.json(result);
  }

  /**
   * Busca um subgrupo de produto por ID
   */
  async show(req: Request, res: Response): Promise<void> {
    const { id } = req.params;
    
    const subGrupoProdutoId = parseInt(id, 10);
    if (isNaN(subGrupoProdutoId)) {
      throw new NotFoundException('Subgrupo de produto', id);
    }
    
    const subGrupoProduto = await this.subGrupoProdutoService.getById(subGrupoProdutoId);
    
    if (!subGrupoProduto) {
      throw new NotFoundException('Subgrupo de produto', id);
    }

    res.json(subGrupoProduto);
  }

  /**
   * Busca subgrupos por grupo de produto
   */
  async findByGrupo(req: Request, res: Response): Promise<void> {
    const { idGrupo } = req.params;
    
    const grupoId = parseInt(idGrupo, 10);
    if (isNaN(grupoId)) {
      throw new NotFoundException('Grupo de produto', idGrupo);
    }
    
    const subgrupos = await this.subGrupoProdutoService.findByGrupo(grupoId);

    res.json(subgrupos);
  }

  /**
   * Cria um novo subgrupo de produto
   */
  async create(req: Request, res: Response): Promise<void> {
    const dto = req.body as CreateSubGrupoProdutoDto;
    
    const subGrupoProduto = await this.subGrupoProdutoService.create(dto);
    
    res.status(201).json(subGrupoProduto);
  }

  /**
   * Atualiza um subgrupo de produto existente
   */
  async update(req: Request, res: Response): Promise<void> {
    const { id } = req.params;
    const dto = req.body as UpdateSubGrupoProdutoDto;
    
    const subGrupoProdutoId = parseInt(id, 10);
    if (isNaN(subGrupoProdutoId)) {
      throw new NotFoundException('Subgrupo de produto', id);
    }
    
    const updatedSubGrupoProduto = await this.subGrupoProdutoService.update(subGrupoProdutoId, dto);
    
    res.json(updatedSubGrupoProduto);
  }

  /**
   * Remove um subgrupo de produto
   */
  async delete(req: Request, res: Response): Promise<void> {
    const { id } = req.params;
    
    const subGrupoProdutoId = parseInt(id, 10);
    if (isNaN(subGrupoProdutoId)) {
      throw new NotFoundException('Subgrupo de produto', id);
    }
    
    await this.subGrupoProdutoService.delete(subGrupoProdutoId);

    res.status(204).send();
  }
}

export default SubGrupoProdutoController;
