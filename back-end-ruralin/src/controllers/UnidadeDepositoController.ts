import { Request, Response } from 'express';
import { Injectable, Inject } from '../core/di';
import { TYPES } from '../core/di/types';
import { IUnidadeDepositoController } from './interfaces/IUnidadeDepositoController';
import { IUnidadeDepositoApplicationService } from '../application/services/unidadeDeposito/IUnidadeDepositoApplicationService';
import { CreateUnidadeDepositoDto } from '../application/dto/unidadeDeposito/CreateUnidadeDepositoDto';
import { UpdateUnidadeDepositoDto } from '../application/dto/unidadeDeposito/UpdateUnidadeDepositoDto';
import { NotFoundException } from '../core/exceptions/NotFoundException';

/**
 * Controller responsável pelo gerenciamento de unidades de depósito
 */
@Injectable()
export class UnidadeDepositoController implements IUnidadeDepositoController {
  constructor(
    @Inject(TYPES.IUnidadeDepositoApplicationService)
    private unidadeDepositoService: IUnidadeDepositoApplicationService
  ) {}

  async index(req: Request, res: Response): Promise<void> {
    const page = req.query.page ? Number(req.query.page) : 1;
    const limit = req.query.limit ? Number(req.query.limit) : 10;

    const result = await this.unidadeDepositoService.list(page, limit);
    res.json(result);
  }

  async show(req: Request, res: Response): Promise<void> {
    const { id } = req.params;
    const unidadeDepositoId = parseInt(id, 10);
    if (isNaN(unidadeDepositoId)) {
      throw new NotFoundException('UnidadeDeposito', id);
    }

    const unidadeDeposito = await this.unidadeDepositoService.getById(unidadeDepositoId);
    if (!unidadeDeposito) {
      throw new NotFoundException('UnidadeDeposito', id);
    }

    res.json(unidadeDeposito);
  }

  async create(req: Request, res: Response): Promise<void> {
    const dto = req.body as CreateUnidadeDepositoDto;
    const unidadeDeposito = await this.unidadeDepositoService.create(dto);
    res.status(201).json(unidadeDeposito);
  }

  async update(req: Request, res: Response): Promise<void> {
    const { id } = req.params;
    const dto = req.body as UpdateUnidadeDepositoDto;
    const unidadeDepositoId = parseInt(id, 10);
    if (isNaN(unidadeDepositoId)) {
      throw new NotFoundException('UnidadeDeposito', id);
    }

    const updatedUnidadeDeposito = await this.unidadeDepositoService.update(unidadeDepositoId, dto);
    res.json(updatedUnidadeDeposito);
  }

  async delete(req: Request, res: Response): Promise<void> {
    const { id } = req.params;
    const unidadeDepositoId = parseInt(id, 10);
    if (isNaN(unidadeDepositoId)) {
      throw new NotFoundException('UnidadeDeposito', id);
    }

    await this.unidadeDepositoService.delete(unidadeDepositoId);
    res.status(204).send();
  }

  async findByProduto(req: Request, res: Response): Promise<void> {
    const { idProduto } = req.params;
    const produtoId = parseInt(idProduto, 10);
    if (isNaN(produtoId)) {
      throw new NotFoundException('Produto', idProduto);
    }

    const unidades = await this.unidadeDepositoService.findByProduto(produtoId);
    res.json(unidades);
  }

  async findComSaldo(req: Request, res: Response): Promise<void> {
    const result = await this.unidadeDepositoService.findComSaldo();
    res.json(result);
  }
}

export default UnidadeDepositoController;
