import { Request, Response } from 'express';
import { Injectable, Inject } from '../core/di';
import { TYPES } from '../core/di/types';
import { IMunicipioController } from './interfaces/IMunicipioController';
import { IMunicipioApplicationService } from '../application/services/municipio/IMunicipioApplicationService';
import { CreateMunicipioDto, UpdateMunicipioDto } from '../application/dto/municipio';

/**
 * Controller para Municipio
 */
@Injectable()
export class MunicipioController implements IMunicipioController {
  constructor(
    @Inject(TYPES.IMunicipioApplicationService) private municipioService: IMunicipioApplicationService
  ) {}

  /**
   * Lista todos os municípios paginados
   */
  async index(req: Request, res: Response): Promise<void> {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;

    const result = await this.municipioService.list(page, limit);
    res.json({
      success: true,
      data: result,
    });
  }

  /**
   * Lista todos os municípios sem paginação
   */
  async listAll(req: Request, res: Response): Promise<void> {
    const municipios = await this.municipioService.listAll();
    res.json({
      success: true,
      data: municipios,
    });
  }

  /**
   * Busca um município por ID
   */
  async show(req: Request, res: Response): Promise<void> {
    const id = parseInt(req.params.id);
    const municipio = await this.municipioService.show(id);
    res.json({
      success: true,
      data: municipio,
    });
  }

  /**
   * Busca municípios por estado
   */
  async findByEstado(req: Request, res: Response): Promise<void> {
    const idEstado = parseInt(req.params.idEstado);
    const municipios = await this.municipioService.findByEstado(idEstado);
    res.json({
      success: true,
      data: municipios,
    });
  }

  /**
   * Busca um município pelo código IBGE
   */
  async findByCodigoIBGE(req: Request, res: Response): Promise<void> {
    const codigoIBGE = parseInt(req.params.codigoIBGE);
    const municipio = await this.municipioService.findByCodigoIBGE(codigoIBGE);
    if (!municipio) {
      res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Município não encontrado',
        },
      });
      return;
    }
    res.json({
      success: true,
      data: municipio,
    });
  }

  /**
   * Cria um novo município
   */
  async create(req: Request, res: Response): Promise<void> {
    const dto = req.body as CreateMunicipioDto;
    const municipio = await this.municipioService.create(dto);
    res.status(201).json({
      success: true,
      data: municipio,
    });
  }

  /**
   * Atualiza um município
   */
  async update(req: Request, res: Response): Promise<void> {
    const id = parseInt(req.params.id);
    const dto = req.body as UpdateMunicipioDto;
    const municipio = await this.municipioService.update(id, dto);
    res.json({
      success: true,
      data: municipio,
    });
  }

  /**
   * Deleta um município
   */
  async delete(req: Request, res: Response): Promise<void> {
    const id = parseInt(req.params.id);
    await this.municipioService.delete(id);
    res.status(204).send();
  }
}
