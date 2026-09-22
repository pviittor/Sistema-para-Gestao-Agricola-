import { Request, Response } from 'express';
import { Injectable, Inject } from '../core/di';
import { TYPES } from '../core/di/types';
import { IEmprestimoItemController } from './interfaces/IEmprestimoItemController';
import { IEmprestimoItemApplicationService } from '../application/services/emprestimoItem/IEmprestimoItemApplicationService';
import { CreateEmprestimoItemDto } from '../application/dto/emprestimoItem/CreateEmprestimoItemDto';
import { UpdateEmprestimoItemDto } from '../application/dto/emprestimoItem/UpdateEmprestimoItemDto';
import { NotFoundException } from '../core/exceptions/NotFoundException';
import { BadRequestException } from '../core/exceptions/BadRequestException';

/**
 * Controller responsável pelo gerenciamento de itens de empréstimo
 *
 * Este controller atua como camada HTTP, delegando toda a lógica de negócio
 * para o EmprestimoItemApplicationService.
 */
@Injectable()
export class EmprestimoItemController implements IEmprestimoItemController {
  constructor(
    @Inject(TYPES.IEmprestimoItemApplicationService)
    private emprestimoItemService: IEmprestimoItemApplicationService
  ) {}

  async index(req: Request, res: Response): Promise<void> {
    const page = req.query.page ? Number(req.query.page) : 1;
    const limit = req.query.limit ? Number(req.query.limit) : 10;
    const result = await this.emprestimoItemService.list(page, limit);
    res.json(result);
  }

  async show(req: Request, res: Response): Promise<void> {
    const { id } = req.params;
    const itemId = parseInt(id, 10);
    if (isNaN(itemId)) {
      throw new NotFoundException('Item de empréstimo', id);
    }
    const item = await this.emprestimoItemService.getById(itemId);
    if (!item) {
      throw new NotFoundException('Item de empréstimo', id);
    }
    res.json(item);
  }

  async create(req: Request, res: Response): Promise<void> {
    const dto = req.body as CreateEmprestimoItemDto;
    const item = await this.emprestimoItemService.create(dto);
    res.status(201).json(item);
  }

  async update(req: Request, res: Response): Promise<void> {
    const { id } = req.params;
    const dto = req.body as UpdateEmprestimoItemDto;
    const itemId = parseInt(id, 10);
    if (isNaN(itemId)) {
      throw new NotFoundException('Item de empréstimo', id);
    }
    const updatedItem = await this.emprestimoItemService.update(itemId, dto);
    res.json(updatedItem);
  }

  async delete(req: Request, res: Response): Promise<void> {
    const { id } = req.params;
    const itemId = parseInt(id, 10);
    if (isNaN(itemId)) {
      throw new NotFoundException('Item de empréstimo', id);
    }
    await this.emprestimoItemService.delete(itemId);
    res.status(204).send();
  }

  async findByEmprestimo(req: Request, res: Response): Promise<void> {
    const { emprestimoId } = req.params;
    const id = parseInt(emprestimoId, 10);
    if (isNaN(id)) {
      throw new BadRequestException('O parâmetro emprestimoId deve ser um número válido');
    }
    const result = await this.emprestimoItemService.findByEmprestimo(id);
    res.json(result);
  }
}

export default EmprestimoItemController;
