import { Request, Response } from 'express';
import { Injectable, Inject } from '../core/di';
import { TYPES } from '../core/di/types';
import { IFazendaController } from './interfaces/IFazendaController';
import { IFazendaApplicationService } from '../application/services/fazenda/IFazendaApplicationService';
import { CreateFazendaDto, UpdateFazendaDto } from '../application/dto/fazenda';

/**
 * Controller para Fazenda
 */
@Injectable()
export class FazendaController implements IFazendaController {
  constructor(
    @Inject(TYPES.IFazendaApplicationService) private fazendaService: IFazendaApplicationService
  ) {}

  /**
   * Lista todas as fazendas paginadas
   */
  async index(req: Request, res: Response): Promise<void> {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;

    const result = await this.fazendaService.list(page, limit);
    res.json({
      success: true,
      data: result,
    });
  }

  /**
   * Lista todas as fazendas sem paginação
   */
  async listAll(req: Request, res: Response): Promise<void> {
    const fazendas = await this.fazendaService.listAll();
    res.json({
      success: true,
      data: fazendas,
    });
  }

  /**
   * Busca uma fazenda por ID
   */
  async show(req: Request, res: Response): Promise<void> {
    const id = parseInt(req.params.id);
    const fazenda = await this.fazendaService.show(id);
    res.json({
      success: true,
      data: fazenda,
    });
  }

  /**
   * Busca fazendas por pessoa (produtor)
   */
  async findByPessoa(req: Request, res: Response): Promise<void> {
    const idPessoa = parseInt(req.params.idPessoa);
    const fazendas = await this.fazendaService.findByPessoa(idPessoa);
    res.json({
      success: true,
      data: fazendas,
    });
  }

  /**
   * Busca fazendas por município
   */
  async findByMunicipio(req: Request, res: Response): Promise<void> {
    const idMunicipio = parseInt(req.params.idMunicipio);
    const fazendas = await this.fazendaService.findByMunicipio(idMunicipio);
    res.json({
      success: true,
      data: fazendas,
    });
  }

  /**
   * Cria uma nova fazenda
   */
  async create(req: Request, res: Response): Promise<void> {
    const dto = req.body as CreateFazendaDto;
    const fazenda = await this.fazendaService.create(dto);
    res.status(201).json({
      success: true,
      data: fazenda,
    });
  }

  /**
   * Atualiza uma fazenda
   */
  async update(req: Request, res: Response): Promise<void> {
    const id = parseInt(req.params.id);
    const dto = req.body as UpdateFazendaDto;
    const fazenda = await this.fazendaService.update(id, dto);
    res.json({
      success: true,
      data: fazenda,
    });
  }

  /**
   * Deleta uma fazenda
   */
  async delete(req: Request, res: Response): Promise<void> {
    const id = parseInt(req.params.id);
    await this.fazendaService.delete(id);
    res.status(204).send();
  }
}
