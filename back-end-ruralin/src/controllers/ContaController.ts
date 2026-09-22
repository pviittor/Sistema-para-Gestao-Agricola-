import { Request, Response } from 'express';
import { Injectable, Inject } from '../core/di';
import { TYPES } from '../core/di/types';
import { IContaController } from './interfaces/IContaController';
import { IContaApplicationService } from '../application/services/conta/IContaApplicationService';
import { CreateContaDto, UpdateContaDto } from '../application/dto/conta';
import { NotFoundException } from '../core/exceptions';

/**
 * Controller responsável pelo gerenciamento de contas
 * 
 * Este controller atua como camada HTTP, delegando toda a lógica de negócio
 * para o ContaApplicationService.
 */
@Injectable()
export class ContaController implements IContaController {
  constructor(
    @Inject(TYPES.IContaApplicationService)
    private contaService: IContaApplicationService
  ) {}

  /**
   * Lista todas as contas com paginação
   */
  async index(req: Request, res: Response): Promise<void> {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;

    const result = await this.contaService.list(page, limit);
    res.json({
      success: true,
      data: result,
    });
  }

  /**
   * Busca uma conta por ID
   */
  async show(req: Request, res: Response): Promise<void> {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      throw new NotFoundException('Conta', req.params.id);
    }

    const conta = await this.contaService.getById(id);
    if (!conta) {
      throw new NotFoundException('Conta', id);
    }

    res.json({
      success: true,
      data: conta,
    });
  }

  /**
   * Cria uma nova conta
   */
  async create(req: Request, res: Response): Promise<void> {
    const dto = req.body as CreateContaDto;
    const conta = await this.contaService.create(dto);
    res.status(201).json({
      success: true,
      data: conta,
    });
  }

  /**
   * Atualiza uma conta existente
   */
  async update(req: Request, res: Response): Promise<void> {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      throw new NotFoundException('Conta', req.params.id);
    }

    const dto = req.body as UpdateContaDto;
    const conta = await this.contaService.update(id, dto);
    res.json({
      success: true,
      data: conta,
    });
  }

  /**
   * Remove uma conta
   */
  async delete(req: Request, res: Response): Promise<void> {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      throw new NotFoundException('Conta', req.params.id);
    }

    await this.contaService.delete(id);
    res.status(204).send();
  }

  /**
   * Busca contas por tipo
   */
  async findByTipo(req: Request, res: Response): Promise<void> {
    const tipo = req.params.tipo;
    const contas = await this.contaService.findByTipo(tipo);
    res.json({
      success: true,
      data: contas,
    });
  }
}
