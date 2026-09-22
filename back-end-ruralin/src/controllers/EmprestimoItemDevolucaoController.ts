import { Request, Response } from 'express';
import { Injectable, Inject } from '../core/di';
import { TYPES } from '../core/di/types';
import { IEmprestimoItemDevolucaoController } from './interfaces/IEmprestimoItemDevolucaoController';
import { IEmprestimoItemDevolucaoApplicationService } from '../application/services/emprestimoItemDevolucao/IEmprestimoItemDevolucaoApplicationService';
import { CreateEmprestimoItemDevolucaoDto } from '../application/dto/emprestimoItemDevolucao/CreateEmprestimoItemDevolucaoDto';
import { UpdateEmprestimoItemDevolucaoDto } from '../application/dto/emprestimoItemDevolucao/UpdateEmprestimoItemDevolucaoDto';
import { NotFoundException } from '../core/exceptions/NotFoundException';
import { BadRequestException } from '../core/exceptions/BadRequestException';

/**
 * Controller responsável pelo gerenciamento de devoluções de itens de empréstimo
 *
 * Este controller atua como camada HTTP, delegando toda a lógica de negócio
 * para o EmprestimoItemDevolucaoApplicationService.
 */
@Injectable()
export class EmprestimoItemDevolucaoController implements IEmprestimoItemDevolucaoController {
  constructor(
    @Inject(TYPES.IEmprestimoItemDevolucaoApplicationService)
    private emprestimoItemDevolucaoService: IEmprestimoItemDevolucaoApplicationService
  ) {}

  async index(req: Request, res: Response): Promise<void> {
    const page = req.query.page ? Number(req.query.page) : 1;
    const limit = req.query.limit ? Number(req.query.limit) : 10;
    const result = await this.emprestimoItemDevolucaoService.list(page, limit);
    res.json(result);
  }

  async show(req: Request, res: Response): Promise<void> {
    const { id } = req.params;
    const devolucaoId = parseInt(id, 10);
    if (isNaN(devolucaoId)) {
      throw new NotFoundException('Devolução de item de empréstimo', id);
    }
    const devolucao = await this.emprestimoItemDevolucaoService.getById(devolucaoId);
    if (!devolucao) {
      throw new NotFoundException('Devolução de item de empréstimo', id);
    }
    res.json(devolucao);
  }

  async create(req: Request, res: Response): Promise<void> {
    const dto = req.body as CreateEmprestimoItemDevolucaoDto;
    const devolucao = await this.emprestimoItemDevolucaoService.create(dto);
    res.status(201).json(devolucao);
  }

  async update(req: Request, res: Response): Promise<void> {
    const { id } = req.params;
    const dto = req.body as UpdateEmprestimoItemDevolucaoDto;
    const devolucaoId = parseInt(id, 10);
    if (isNaN(devolucaoId)) {
      throw new NotFoundException('Devolução de item de empréstimo', id);
    }
    const updatedDevolucao = await this.emprestimoItemDevolucaoService.update(devolucaoId, dto);
    res.json(updatedDevolucao);
  }

  async delete(req: Request, res: Response): Promise<void> {
    const { id } = req.params;
    const devolucaoId = parseInt(id, 10);
    if (isNaN(devolucaoId)) {
      throw new NotFoundException('Devolução de item de empréstimo', id);
    }
    await this.emprestimoItemDevolucaoService.delete(devolucaoId);
    res.status(204).send();
  }

  async findByItem(req: Request, res: Response): Promise<void> {
    const { itemId } = req.params;
    const id = parseInt(itemId, 10);
    if (isNaN(id)) {
      throw new BadRequestException('O parâmetro itemId deve ser um número válido');
    }
    const result = await this.emprestimoItemDevolucaoService.findByItem(id);
    res.json(result);
  }
}

export default EmprestimoItemDevolucaoController;
