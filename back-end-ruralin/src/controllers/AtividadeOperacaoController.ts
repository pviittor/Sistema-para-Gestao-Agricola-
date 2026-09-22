import { Request, Response } from 'express';
import { Injectable, Inject } from '../core/di';
import { TYPES } from '../core/di/types';
import { IAtividadeOperacaoController } from './interfaces/IAtividadeOperacaoController';
import { IAtividadeOperacaoApplicationService } from '../application/services/atividadeOperacao/IAtividadeOperacaoApplicationService';
import { CreateAtividadeOperacaoDto } from '../application/dto/atividadeOperacao/CreateAtividadeOperacaoDto';
import { UpdateAtividadeOperacaoDto } from '../application/dto/atividadeOperacao/UpdateAtividadeOperacaoDto';
import { NotFoundException } from '../core/exceptions/NotFoundException';

/**
 * Controller responsável pelo gerenciamento de operações de atividades
 *
 * Este controller atua como camada HTTP, delegando toda a lógica de negócio
 * para o AtividadeOperacaoApplicationService.
 */
@Injectable()
export class AtividadeOperacaoController implements IAtividadeOperacaoController {
  constructor(
    @Inject(TYPES.IAtividadeOperacaoApplicationService)
    private atividadeOperacaoService: IAtividadeOperacaoApplicationService
  ) {}

  /**
   * Lista todas as operações com paginação
   */
  async index(req: Request, res: Response): Promise<void> {
    const page = req.query.page ? Number(req.query.page) : 1;
    const limit = req.query.limit ? Number(req.query.limit) : 10;

    const result = await this.atividadeOperacaoService.list(page, limit);

    res.json(result);
  }

  /**
   * Busca uma operação por ID
   */
  async show(req: Request, res: Response): Promise<void> {
    const { id } = req.params;

    const opId = parseInt(id, 10);
    if (isNaN(opId)) {
      throw new NotFoundException('Operação', id);
    }

    const atividadeOperacao = await this.atividadeOperacaoService.getById(opId);

    if (!atividadeOperacao) {
      throw new NotFoundException('Operação', id);
    }

    res.json(atividadeOperacao);
  }

  /**
   * Cria uma nova operação
   */
  async create(req: Request, res: Response): Promise<void> {
    const dto = req.body as CreateAtividadeOperacaoDto;

    const atividadeOperacao = await this.atividadeOperacaoService.create(dto);

    res.status(201).json(atividadeOperacao);
  }

  /**
   * Atualiza uma operação existente
   */
  async update(req: Request, res: Response): Promise<void> {
    const { id } = req.params;
    const dto = req.body as UpdateAtividadeOperacaoDto;

    const opId = parseInt(id, 10);
    if (isNaN(opId)) {
      throw new NotFoundException('Operação', id);
    }

    const updatedAtividadeOperacao = await this.atividadeOperacaoService.update(opId, dto);

    res.json(updatedAtividadeOperacao);
  }

  /**
   * Remove uma operação
   */
  async delete(req: Request, res: Response): Promise<void> {
    const { id } = req.params;

    const opId = parseInt(id, 10);
    if (isNaN(opId)) {
      throw new NotFoundException('Operação', id);
    }

    await this.atividadeOperacaoService.delete(opId);

    res.status(204).send();
  }
}

export default AtividadeOperacaoController;
