import { Request, Response } from 'express';
import { Injectable, Inject } from '../core/di';
import { TYPES } from '../core/di/types';
import { IApontamentoServicoController } from './interfaces/IApontamentoServicoController';
import { IApontamentoServicoApplicationService } from '../application/services/apontamentoServico/IApontamentoServicoApplicationService';
import { CreateApontamentoServicoDto } from '../application/dto/apontamentoServico/CreateApontamentoServicoDto';
import { UpdateApontamentoServicoDto } from '../application/dto/apontamentoServico/UpdateApontamentoServicoDto';
import { NotFoundException } from '../core/exceptions/NotFoundException';

/**
 * Controller responsável pelo gerenciamento de apontamentos de serviço
 *
 * Este controller atua como camada HTTP, delegando toda a lógica de negócio
 * para o ApontamentoServicoApplicationService.
 */
@Injectable()
export class ApontamentoServicoController implements IApontamentoServicoController {
  constructor(
    @Inject(TYPES.IApontamentoServicoApplicationService)
    private apontamentoServicoService: IApontamentoServicoApplicationService
  ) {}

  /**
   * Lista todos os apontamentos de serviço com paginação
   */
  async index(req: Request, res: Response): Promise<void> {
    const page = req.query.page ? Number(req.query.page) : 1;
    const limit = req.query.limit ? Number(req.query.limit) : 10;

    const result = await this.apontamentoServicoService.list(page, limit);

    res.json(result);
  }

  /**
   * Busca um apontamento de serviço por ID
   */
  async show(req: Request, res: Response): Promise<void> {
    const { id } = req.params;

    const aptSrvId = parseInt(id, 10);
    if (isNaN(aptSrvId)) {
      throw new NotFoundException('ApontamentoServico', id);
    }

    const apontamentoServico = await this.apontamentoServicoService.getById(aptSrvId);

    if (!apontamentoServico) {
      throw new NotFoundException('ApontamentoServico', id);
    }

    res.json(apontamentoServico);
  }

  /**
   * Cria um novo apontamento de serviço
   */
  async create(req: Request, res: Response): Promise<void> {
    const dto = req.body as CreateApontamentoServicoDto;

    const apontamentoServico = await this.apontamentoServicoService.create(dto);

    res.status(201).json(apontamentoServico);
  }

  /**
   * Atualiza um apontamento de serviço existente
   */
  async update(req: Request, res: Response): Promise<void> {
    const { id } = req.params;
    const dto = req.body as UpdateApontamentoServicoDto;

    const aptSrvId = parseInt(id, 10);
    if (isNaN(aptSrvId)) {
      throw new NotFoundException('ApontamentoServico', id);
    }

    const updatedAptSrv = await this.apontamentoServicoService.update(aptSrvId, dto);

    res.json(updatedAptSrv);
  }

  /**
   * Remove um apontamento de serviço
   */
  async delete(req: Request, res: Response): Promise<void> {
    const { id } = req.params;

    const aptSrvId = parseInt(id, 10);
    if (isNaN(aptSrvId)) {
      throw new NotFoundException('ApontamentoServico', id);
    }

    await this.apontamentoServicoService.delete(aptSrvId);

    res.status(204).send();
  }
}

export default ApontamentoServicoController;
