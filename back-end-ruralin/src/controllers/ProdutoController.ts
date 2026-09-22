import { Request, Response } from 'express';
import { Injectable, Inject } from '../core/di';
import { TYPES } from '../core/di/types';
import { IProdutoController } from './interfaces/IProdutoController';
import { IProdutoApplicationService } from '../application/services/produto/IProdutoApplicationService';
import { CreateProdutoDto } from '../application/dto/produto/CreateProdutoDto';
import { UpdateProdutoDto } from '../application/dto/produto/UpdateProdutoDto';
import { NotFoundException } from '../core/exceptions/NotFoundException';

/**
 * Controller responsável pelo gerenciamento de produtos
 */
@Injectable()
export class ProdutoController implements IProdutoController {
  constructor(
    @Inject(TYPES.IProdutoApplicationService)
    private produtoService: IProdutoApplicationService
  ) {}

  async index(req: Request, res: Response): Promise<void> {
    const page = req.query.page ? Number(req.query.page) : 1;
    const limit = req.query.limit ? Number(req.query.limit) : 10;
    
    const result = await this.produtoService.list(page, limit);
    res.json(result);
  }

  async listAll(req: Request, res: Response): Promise<void> {
    const result = await this.produtoService.listAll();
    res.json(result);
  }

  async show(req: Request, res: Response): Promise<void> {
    const { id } = req.params;
    const produtoId = parseInt(id, 10);
    if (isNaN(produtoId)) {
      throw new NotFoundException('Produto', id);
    }
    
    const produto = await this.produtoService.getById(produtoId);
    if (!produto) {
      throw new NotFoundException('Produto', id);
    }

    res.json(produto);
  }

  async create(req: Request, res: Response): Promise<void> {
    const dto = req.body as CreateProdutoDto;
    const produto = await this.produtoService.create(dto);
    res.status(201).json(produto);
  }

  async update(req: Request, res: Response): Promise<void> {
    const { id } = req.params;
    const dto = req.body as UpdateProdutoDto;
    const produtoId = parseInt(id, 10);
    if (isNaN(produtoId)) {
      throw new NotFoundException('Produto', id);
    }
    
    const updatedProduto = await this.produtoService.update(produtoId, dto);
    res.json(updatedProduto);
  }

  async delete(req: Request, res: Response): Promise<void> {
    const { id } = req.params;
    const produtoId = parseInt(id, 10);
    if (isNaN(produtoId)) {
      throw new NotFoundException('Produto', id);
    }
    
    await this.produtoService.delete(produtoId);
    res.status(204).send();
  }

  async findByGrupo(req: Request, res: Response): Promise<void> {
    const { idGrupo } = req.params;
    const grupoId = parseInt(idGrupo, 10);
    if (isNaN(grupoId)) {
      throw new NotFoundException('Grupo de produto', idGrupo);
    }
    
    const produtos = await this.produtoService.findByGrupo(grupoId);
    res.json(produtos);
  }

  async findBySubGrupo(req: Request, res: Response): Promise<void> {
    const { idSubGrupo } = req.params;
    const subGrupoId = parseInt(idSubGrupo, 10);
    if (isNaN(subGrupoId)) {
      throw new NotFoundException('Subgrupo de produto', idSubGrupo);
    }
    
    const produtos = await this.produtoService.findBySubGrupo(subGrupoId);
    res.json(produtos);
  }
}

export default ProdutoController;
