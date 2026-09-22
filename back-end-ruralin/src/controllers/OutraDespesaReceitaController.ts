import { Request, Response } from 'express';
import { Injectable, Inject } from '../core/di';
import { TYPES } from '../core/di/types';
import { IOutraDespesaReceitaController } from './interfaces/IOutraDespesaReceitaController';
import { IOutraDespesaReceitaApplicationService } from '../application/services/outra-despesa-receita/IOutraDespesaReceitaApplicationService';
import { CreateOutraDespesaReceitaDto } from '../application/dto/outraDespesaReceita/CreateOutraDespesaReceitaDto';
import { UpdateOutraDespesaReceitaDto } from '../application/dto/outraDespesaReceita/UpdateOutraDespesaReceitaDto';
import { NotFoundException } from '../core/exceptions/NotFoundException';
import { BadRequestException } from '../core/exceptions/BadRequestException';

/**
 * Controller responsável pelo gerenciamento de outras despesas e receitas
 *
 * Este controller atua como camada HTTP, delegando toda a lógica de negócio
 * para o OutraDespesaReceitaApplicationService.
 */
@Injectable()
export class OutraDespesaReceitaController implements IOutraDespesaReceitaController {
  constructor(
    @Inject(TYPES.IOutraDespesaReceitaApplicationService)
    private outraDespesaReceitaService: IOutraDespesaReceitaApplicationService
  ) {}

  /**
   * Lista todas as outras despesas/receitas com paginação
   */
  async index(req: Request, res: Response): Promise<void> {
    const page = req.query.page ? Number(req.query.page) : 1;
    const limit = req.query.limit ? Number(req.query.limit) : 10;

    const result = await this.outraDespesaReceitaService.list(page, limit);
    res.json(result);
  }

  /**
   * Busca uma outra despesa/receita por ID
   */
  async show(req: Request, res: Response): Promise<void> {
    const { id } = req.params;
    const entityId = parseInt(id, 10);
    if (isNaN(entityId)) {
      throw new NotFoundException('Outra Despesa/Receita', id);
    }

    const entity = await this.outraDespesaReceitaService.getById(entityId);
    if (!entity) {
      throw new NotFoundException('Outra Despesa/Receita', id);
    }

    res.json(entity);
  }

  /**
   * Cria uma nova outra despesa/receita
   */
  async create(req: Request, res: Response): Promise<void> {
    const dto = req.body as CreateOutraDespesaReceitaDto;
    const entity = await this.outraDespesaReceitaService.create(dto);
    res.status(201).json(entity);
  }

  /**
   * Atualiza uma outra despesa/receita existente
   */
  async update(req: Request, res: Response): Promise<void> {
    const { id } = req.params;
    const dto = req.body as UpdateOutraDespesaReceitaDto;
    const entityId = parseInt(id, 10);
    if (isNaN(entityId)) {
      throw new NotFoundException('Outra Despesa/Receita', id);
    }

    const updated = await this.outraDespesaReceitaService.update(entityId, dto);
    res.json(updated);
  }

  /**
   * Remove uma outra despesa/receita
   */
  async delete(req: Request, res: Response): Promise<void> {
    const { id } = req.params;
    const entityId = parseInt(id, 10);
    if (isNaN(entityId)) {
      throw new NotFoundException('Outra Despesa/Receita', id);
    }

    await this.outraDespesaReceitaService.delete(entityId);
    res.status(204).send();
  }

  /**
   * Busca outras despesas/receitas por filtros combinados
   */
  async findByFilters(req: Request, res: Response): Promise<void> {
    const { planoGerencialId, dataInicio, dataFim, configuradorCicloId, cultura } = req.query;

    const result = await this.outraDespesaReceitaService.findByFilters(
      planoGerencialId ? Number(planoGerencialId) : undefined,
      dataInicio ? String(dataInicio) : undefined,
      dataFim ? String(dataFim) : undefined,
      configuradorCicloId ? Number(configuradorCicloId) : undefined,
      cultura ? String(cultura) : undefined
    );

    res.json(result);
  }

  /**
   * Busca outras despesas/receitas por cultura
   */
  async findByCultura(req: Request, res: Response): Promise<void> {
    const { cultura } = req.params;

    if (!cultura) {
      throw new BadRequestException('O parâmetro cultura é obrigatório');
    }

    const result = await this.outraDespesaReceitaService.findByCultura(cultura);
    res.json(result);
  }
}

export default OutraDespesaReceitaController;
