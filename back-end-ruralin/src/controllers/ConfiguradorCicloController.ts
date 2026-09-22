import { Request, Response } from 'express';
import { Injectable, Inject } from '../core/di';
import { TYPES } from '../core/di/types';
import { IConfiguradorCicloController } from './interfaces/IConfiguradorCicloController';
import { IConfiguradorCicloApplicationService } from '../application/services/configuradorCiclo/IConfiguradorCicloApplicationService';
import { CreateConfiguradorCicloDto } from '../application/dto/configuradorCiclo/CreateConfiguradorCicloDto';
import { UpdateConfiguradorCicloDto } from '../application/dto/configuradorCiclo/UpdateConfiguradorCicloDto';
import { NotFoundException } from '../core/exceptions/NotFoundException';

/**
 * Controller responsável pelo gerenciamento de configuradores de ciclo
 *
 * Este controller atua como camada HTTP, delegando toda a lógica de negócio
 * para o ConfiguradorCicloApplicationService.
 */
@Injectable()
export class ConfiguradorCicloController implements IConfiguradorCicloController {
  constructor(
    @Inject(TYPES.IConfiguradorCicloApplicationService)
    private configuradorCicloService: IConfiguradorCicloApplicationService
  ) {}

  /**
   * Lista todos os configuradores de ciclo com paginação
   */
  async index(req: Request, res: Response): Promise<void> {
    const page = req.query.page ? Number(req.query.page) : 1;
    const limit = req.query.limit ? Number(req.query.limit) : 10;

    const result = await this.configuradorCicloService.list(page, limit);

    res.json(result);
  }

  /**
   * Busca um configurador de ciclo por ID
   */
  async show(req: Request, res: Response): Promise<void> {
    const { id } = req.params;

    const cfgId = parseInt(id, 10);
    if (isNaN(cfgId)) {
      throw new NotFoundException('Configurador de ciclo', id);
    }

    const configuradorCiclo = await this.configuradorCicloService.getById(cfgId);

    if (!configuradorCiclo) {
      throw new NotFoundException('Configurador de ciclo', id);
    }

    res.json(configuradorCiclo);
  }

  /**
   * Busca configuradores de ciclo por fazenda e safra
   */
  async getByFazendaAndSafra(req: Request, res: Response): Promise<void> {
    const fazendaId = parseInt(req.params.fazendaId, 10);
    const safraId = parseInt(req.params.safraId, 10);

    if (isNaN(fazendaId)) {
      throw new NotFoundException('Fazenda', req.params.fazendaId);
    }
    if (isNaN(safraId)) {
      throw new NotFoundException('Safra', req.params.safraId);
    }

    const result = await this.configuradorCicloService.getByFazendaAndSafra(fazendaId, safraId);

    res.json(result);
  }

  /**
   * Cria um novo configurador de ciclo
   */
  async create(req: Request, res: Response): Promise<void> {
    const dto = req.body as CreateConfiguradorCicloDto;

    const configuradorCiclo = await this.configuradorCicloService.create(dto);

    res.status(201).json(configuradorCiclo);
  }

  /**
   * Atualiza um configurador de ciclo existente
   */
  async update(req: Request, res: Response): Promise<void> {
    const { id } = req.params;
    const dto = req.body as UpdateConfiguradorCicloDto;

    const cfgId = parseInt(id, 10);
    if (isNaN(cfgId)) {
      throw new NotFoundException('Configurador de ciclo', id);
    }

    const updatedConfiguradorCiclo = await this.configuradorCicloService.update(cfgId, dto);

    res.json(updatedConfiguradorCiclo);
  }

  /**
   * Remove um configurador de ciclo
   */
  async delete(req: Request, res: Response): Promise<void> {
    const { id } = req.params;

    const cfgId = parseInt(id, 10);
    if (isNaN(cfgId)) {
      throw new NotFoundException('Configurador de ciclo', id);
    }

    await this.configuradorCicloService.delete(cfgId);

    res.status(204).send();
  }
}

export default ConfiguradorCicloController;
