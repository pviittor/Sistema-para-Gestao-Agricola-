import { Request, Response } from 'express';
import { Injectable, Inject } from '../core/di';
import { TYPES } from '../core/di/types';
import { IServicoBenfeitoriaController } from './interfaces/IServicoBenfeitoriaController';
import { IServicoBenfeitoriaApplicationService } from '../application/services/servicoBenfeitoria/IServicoBenfeitoriaApplicationService';
import { CreateServicoBenfeitoriaDto } from '../application/dto/servicoBenfeitoria/CreateServicoBenfeitoriaDto';
import { UpdateServicoBenfeitoriaDto } from '../application/dto/servicoBenfeitoria/UpdateServicoBenfeitoriaDto';
import { NotFoundException } from '../core/exceptions/NotFoundException';

/**
 * Controller responsavel pelo gerenciamento de servicos de benfeitoria
 *
 * Este controller atua como camada HTTP, delegando toda a logica de negocio
 * para o ServicoBenfeitoriaApplicationService.
 */
@Injectable()
export class ServicoBenfeitoriaController implements IServicoBenfeitoriaController {
  constructor(
    @Inject(TYPES.IServicoBenfeitoriaApplicationService)
    private servicoBenfeitoriaService: IServicoBenfeitoriaApplicationService
  ) {}

  /**
   * Lista todos os servicos de benfeitoria com paginacao
   */
  async index(req: Request, res: Response): Promise<void> {
    const page = req.query.page ? Number(req.query.page) : 1;
    const limit = req.query.limit ? Number(req.query.limit) : 10;

    const result = await this.servicoBenfeitoriaService.list(page, limit);

    res.json(result);
  }

  /**
   * Busca um servico de benfeitoria por ID
   */
  async show(req: Request, res: Response): Promise<void> {
    const { id } = req.params;

    const srvBenfId = parseInt(id, 10);
    if (isNaN(srvBenfId)) {
      throw new NotFoundException('ServicoBenfeitoria', id);
    }

    const servicoBenfeitoria = await this.servicoBenfeitoriaService.getById(srvBenfId);

    if (!servicoBenfeitoria) {
      throw new NotFoundException('ServicoBenfeitoria', id);
    }

    res.json(servicoBenfeitoria);
  }

  /**
   * Cria um novo servico de benfeitoria
   */
  async create(req: Request, res: Response): Promise<void> {
    const dto = req.body as CreateServicoBenfeitoriaDto;

    const servicoBenfeitoria = await this.servicoBenfeitoriaService.create(dto);

    res.status(201).json(servicoBenfeitoria);
  }

  /**
   * Atualiza um servico de benfeitoria existente
   */
  async update(req: Request, res: Response): Promise<void> {
    const { id } = req.params;
    const dto = req.body as UpdateServicoBenfeitoriaDto;

    const srvBenfId = parseInt(id, 10);
    if (isNaN(srvBenfId)) {
      throw new NotFoundException('ServicoBenfeitoria', id);
    }

    const updatedSrvBenf = await this.servicoBenfeitoriaService.update(srvBenfId, dto);

    res.json(updatedSrvBenf);
  }

  /**
   * Remove um servico de benfeitoria
   */
  async delete(req: Request, res: Response): Promise<void> {
    const { id } = req.params;

    const srvBenfId = parseInt(id, 10);
    if (isNaN(srvBenfId)) {
      throw new NotFoundException('ServicoBenfeitoria', id);
    }

    await this.servicoBenfeitoriaService.delete(srvBenfId);

    res.status(204).send();
  }
}

export default ServicoBenfeitoriaController;
