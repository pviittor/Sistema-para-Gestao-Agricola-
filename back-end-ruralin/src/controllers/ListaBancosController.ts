import { Request, Response } from 'express';
import { Injectable, Inject } from '../core/di';
import { TYPES } from '../core/di/types';
import { IListaBancosController } from './interfaces/IListaBancosController';
import { IListaBancosApplicationService } from '../application/services/listaBancos/IListaBancosApplicationService';
import { CreateListaBancosDto } from '../application/dto/listaBancos/CreateListaBancosDto';
import { UpdateListaBancosDto } from '../application/dto/listaBancos/UpdateListaBancosDto';
import { NotFoundException } from '../core/exceptions/NotFoundException';

/**
 * Controller responsável pelo gerenciamento de lista de bancos
 */
@Injectable()
export class ListaBancosController implements IListaBancosController {
  constructor(
    @Inject(TYPES.IListaBancosApplicationService)
    private service: IListaBancosApplicationService
  ) {}

  async index(req: Request, res: Response): Promise<void> {
    const page = req.query.page ? Number(req.query.page) : 1;
    const limit = req.query.limit ? Number(req.query.limit) : 10;
    
    const result = await this.service.list(page, limit);
    res.json(result);
  }

  async show(req: Request, res: Response): Promise<void> {
    const { id } = req.params;
    const bancoId = parseInt(id, 10);
    if (isNaN(bancoId)) {
      throw new NotFoundException('Banco', id);
    }
    
    const banco = await this.service.getById(bancoId);
    if (!banco) {
      throw new NotFoundException('Banco', id);
    }

    res.json(banco);
  }

  async create(req: Request, res: Response): Promise<void> {
    const dto = req.body as CreateListaBancosDto;
    const banco = await this.service.create(dto);
    res.status(201).json(banco);
  }

  async update(req: Request, res: Response): Promise<void> {
    const { id } = req.params;
    const dto = req.body as UpdateListaBancosDto;
    const bancoId = parseInt(id, 10);
    if (isNaN(bancoId)) {
      throw new NotFoundException('Banco', id);
    }
    
    const updatedBanco = await this.service.update(bancoId, dto);
    res.json(updatedBanco);
  }

  async delete(req: Request, res: Response): Promise<void> {
    const { id } = req.params;
    const bancoId = parseInt(id, 10);
    if (isNaN(bancoId)) {
      throw new NotFoundException('Banco', id);
    }
    
    await this.service.delete(bancoId);
    res.status(204).send();
  }
}

export default ListaBancosController;
