import { Request, Response } from 'express';
import { Injectable, Inject } from '../core/di';
import { TYPES } from '../core/di/types';
import { IAbastecimentoController } from './interfaces/IAbastecimentoController';
import { IAbastecimentoApplicationService } from '../application/services/abastecimento/IAbastecimentoApplicationService';
import { CreateAbastecimentoDto } from '../application/dto/abastecimento/CreateAbastecimentoDto';
import { UpdateAbastecimentoDto } from '../application/dto/abastecimento/UpdateAbastecimentoDto';
import { NotFoundException } from '../core/exceptions/NotFoundException';
import { BadRequestException } from '../core/exceptions/BadRequestException';

/**
 * Controller responsável pelo gerenciamento de abastecimentos
 *
 * Este controller atua como camada HTTP, delegando toda a lógica de negócio
 * para o AbastecimentoApplicationService.
 */
@Injectable()
export class AbastecimentoController implements IAbastecimentoController {
  constructor(
    @Inject(TYPES.IAbastecimentoApplicationService)
    private abastecimentoService: IAbastecimentoApplicationService
  ) {}

  /**
   * Lista todos os abastecimentos com paginação
   */
  async index(req: Request, res: Response): Promise<void> {
    const page = req.query.page ? Number(req.query.page) : 1;
    const limit = req.query.limit ? Number(req.query.limit) : 10;

    const result = await this.abastecimentoService.list(page, limit);

    res.json(result);
  }

  /**
   * Busca um abastecimento por ID
   */
  async show(req: Request, res: Response): Promise<void> {
    const { id } = req.params;

    const abastecimentoId = parseInt(id, 10);
    if (isNaN(abastecimentoId)) {
      throw new NotFoundException('Abastecimento', id);
    }

    const abastecimento = await this.abastecimentoService.getById(abastecimentoId);

    if (!abastecimento) {
      throw new NotFoundException('Abastecimento', id);
    }

    res.json(abastecimento);
  }

  /**
   * Cria um novo abastecimento
   */
  async create(req: Request, res: Response): Promise<void> {
    const dto = req.body as CreateAbastecimentoDto;

    const abastecimento = await this.abastecimentoService.create(dto);

    res.status(201).json(abastecimento);
  }

  /**
   * Atualiza um abastecimento existente
   */
  async update(req: Request, res: Response): Promise<void> {
    const { id } = req.params;
    const dto = req.body as UpdateAbastecimentoDto;

    const abastecimentoId = parseInt(id, 10);
    if (isNaN(abastecimentoId)) {
      throw new NotFoundException('Abastecimento', id);
    }

    const updatedAbastecimento = await this.abastecimentoService.update(abastecimentoId, dto);

    res.json(updatedAbastecimento);
  }

  /**
   * Remove um abastecimento
   */
  async delete(req: Request, res: Response): Promise<void> {
    const { id } = req.params;

    const abastecimentoId = parseInt(id, 10);
    if (isNaN(abastecimentoId)) {
      throw new NotFoundException('Abastecimento', id);
    }

    await this.abastecimentoService.delete(abastecimentoId);

    res.status(204).send();
  }

  /**
   * Busca abastecimentos por máquina
   */
  async findByMaquina(req: Request, res: Response): Promise<void> {
    const { idMaquina } = req.params;

    const maquinaId = parseInt(idMaquina, 10);
    if (isNaN(maquinaId)) {
      throw new BadRequestException('ID da máquina inválido');
    }

    const abastecimentos = await this.abastecimentoService.findByMaquina(maquinaId);

    res.json(abastecimentos);
  }

  /**
   * Busca abastecimentos por período
   */
  async findByPeriodo(req: Request, res: Response): Promise<void> {
    const { dataInicio, dataFim } = req.query;

    if (!dataInicio || !dataFim) {
      throw new BadRequestException('Os parâmetros dataInicio e dataFim são obrigatórios');
    }

    const abastecimentos = await this.abastecimentoService.findByPeriodo(
      String(dataInicio),
      String(dataFim)
    );

    res.json(abastecimentos);
  }
}

export default AbastecimentoController;
