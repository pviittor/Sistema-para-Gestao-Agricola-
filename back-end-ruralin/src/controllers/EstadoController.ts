import { Request, Response } from 'express';
import { Injectable, Inject } from '../core/di';
import { TYPES } from '../core/di/types';
import { IEstadoController } from './interfaces/IEstadoController';
import { IEstadoApplicationService } from '../application/services/estado/IEstadoApplicationService';
import { CreateEstadoDto, UpdateEstadoDto } from '../application/dto/estado';

/**
 * Controller para Estado
 */
@Injectable()
export class EstadoController implements IEstadoController {
  constructor(
    @Inject(TYPES.IEstadoApplicationService) private estadoService: IEstadoApplicationService
  ) {}

  /**
   * Lista todos os estados paginados
   */
  async index(req: Request, res: Response): Promise<void> {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;

    const result = await this.estadoService.list(page, limit);
    res.json({
      success: true,
      data: result,
    });
  }

  /**
   * Lista todos os estados sem paginação
   */
  async listAll(req: Request, res: Response): Promise<void> {
    const estados = await this.estadoService.listAll();
    res.json({
      success: true,
      data: estados,
    });
  }

  /**
   * Busca um estado por ID
   */
  async show(req: Request, res: Response): Promise<void> {
    const id = parseInt(req.params.id);
    const estado = await this.estadoService.show(id);
    res.json({
      success: true,
      data: estado,
    });
  }

  /**
   * Busca um estado pela sigla
   */
  async findBySigla(req: Request, res: Response): Promise<void> {
    const sigla = req.params.sigla;
    const estado = await this.estadoService.findBySigla(sigla);
    if (!estado) {
      res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Estado não encontrado',
        },
      });
      return;
    }
    res.json({
      success: true,
      data: estado,
    });
  }

  /**
   * Cria um novo estado
   */
  async create(req: Request, res: Response): Promise<void> {
    const dto = req.body as CreateEstadoDto;
    const estado = await this.estadoService.create(dto);
    res.status(201).json({
      success: true,
      data: estado,
    });
  }

  /**
   * Atualiza um estado
   */
  async update(req: Request, res: Response): Promise<void> {
    const id = parseInt(req.params.id);
    const dto = req.body as UpdateEstadoDto;
    const estado = await this.estadoService.update(id, dto);
    res.json({
      success: true,
      data: estado,
    });
  }

  /**
   * Deleta um estado
   */
  async delete(req: Request, res: Response): Promise<void> {
    const id = parseInt(req.params.id);
    await this.estadoService.delete(id);
    res.status(204).send();
  }
}
