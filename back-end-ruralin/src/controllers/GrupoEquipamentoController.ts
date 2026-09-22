import { Request, Response } from 'express';
import { Injectable, Inject } from '../core/di';
import { TYPES } from '../core/di/types';
import { IGrupoEquipamentoController } from './interfaces/IGrupoEquipamentoController';
import { IGrupoEquipamentoApplicationService } from '../application/services/grupoEquipamento/IGrupoEquipamentoApplicationService';
import { CreateGrupoEquipamentoDto } from '../application/dto/grupoEquipamento/CreateGrupoEquipamentoDto';
import { UpdateGrupoEquipamentoDto } from '../application/dto/grupoEquipamento/UpdateGrupoEquipamentoDto';
import { NotFoundException } from '../core/exceptions/NotFoundException';

/**
 * Controller responsável pelo gerenciamento de grupos de equipamento
 *
 * Este controller atua como camada HTTP, delegando toda a lógica de negócio
 * para o GrupoEquipamentoApplicationService.
 */
@Injectable()
export class GrupoEquipamentoController implements IGrupoEquipamentoController {
  constructor(
    @Inject(TYPES.IGrupoEquipamentoApplicationService)
    private grupoEquipamentoService: IGrupoEquipamentoApplicationService
  ) {}

  /**
   * Lista todos os grupos de equipamento com paginação
   */
  async index(req: Request, res: Response): Promise<void> {
    const page = req.query.page ? Number(req.query.page) : 1;
    const limit = req.query.limit ? Number(req.query.limit) : 10;

    const result = await this.grupoEquipamentoService.list(page, limit);

    res.json(result);
  }

  /**
   * Busca um grupo de equipamento por ID
   */
  async show(req: Request, res: Response): Promise<void> {
    const { id } = req.params;

    const grupoEquipamentoId = parseInt(id, 10);
    if (isNaN(grupoEquipamentoId)) {
      throw new NotFoundException('Grupo de equipamento', id);
    }

    const grupoEquipamento = await this.grupoEquipamentoService.getById(grupoEquipamentoId);

    if (!grupoEquipamento) {
      throw new NotFoundException('Grupo de equipamento', id);
    }

    res.json(grupoEquipamento);
  }

  /**
   * Cria um novo grupo de equipamento
   */
  async create(req: Request, res: Response): Promise<void> {
    const dto = req.body as CreateGrupoEquipamentoDto;

    const grupoEquipamento = await this.grupoEquipamentoService.create(dto);

    res.status(201).json(grupoEquipamento);
  }

  /**
   * Atualiza um grupo de equipamento existente
   */
  async update(req: Request, res: Response): Promise<void> {
    const { id } = req.params;
    const dto = req.body as UpdateGrupoEquipamentoDto;

    const grupoEquipamentoId = parseInt(id, 10);
    if (isNaN(grupoEquipamentoId)) {
      throw new NotFoundException('Grupo de equipamento', id);
    }

    const updatedGrupoEquipamento = await this.grupoEquipamentoService.update(grupoEquipamentoId, dto);

    res.json(updatedGrupoEquipamento);
  }

  /**
   * Remove um grupo de equipamento
   */
  async delete(req: Request, res: Response): Promise<void> {
    const { id } = req.params;

    const grupoEquipamentoId = parseInt(id, 10);
    if (isNaN(grupoEquipamentoId)) {
      throw new NotFoundException('Grupo de equipamento', id);
    }

    await this.grupoEquipamentoService.delete(grupoEquipamentoId);

    res.status(204).send();
  }
}

export default GrupoEquipamentoController;
