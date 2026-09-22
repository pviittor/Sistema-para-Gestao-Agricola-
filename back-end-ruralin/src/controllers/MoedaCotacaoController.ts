import { Request, Response } from 'express';
import { Injectable, Inject } from '../core/di';
import { TYPES } from '../core/di/types';
import { IMoedaCotacaoController } from './interfaces/IMoedaCotacaoController';
import { IMoedaCotacaoApplicationService } from '../application/services/moedaCotacao/IMoedaCotacaoApplicationService';
import { CreateMoedaCotacaoDto } from '../application/dto/moedaCotacao/CreateMoedaCotacaoDto';
import { UpdateMoedaCotacaoDto } from '../application/dto/moedaCotacao/UpdateMoedaCotacaoDto';
import { NotFoundException } from '../core/exceptions/NotFoundException';

/**
 * Controller responsável pelo gerenciamento de cotações de moeda
 */
@Injectable()
export class MoedaCotacaoController implements IMoedaCotacaoController {
  constructor(
    @Inject(TYPES.IMoedaCotacaoApplicationService)
    private moedaCotacaoService: IMoedaCotacaoApplicationService
  ) {}

  async index(req: Request, res: Response): Promise<void> {
    const page = req.query.page ? Number(req.query.page) : 1;
    const limit = req.query.limit ? Number(req.query.limit) : 10;
    
    const result = await this.moedaCotacaoService.list(page, limit);
    res.json(result);
  }

  async show(req: Request, res: Response): Promise<void> {
    const { id } = req.params;
    const cotacaoId = parseInt(id, 10);
    if (isNaN(cotacaoId)) {
      throw new NotFoundException('Cotação de moeda', id);
    }
    
    const cotacao = await this.moedaCotacaoService.getById(cotacaoId);
    if (!cotacao) {
      throw new NotFoundException('Cotação de moeda', id);
    }

    res.json(cotacao);
  }

  async create(req: Request, res: Response): Promise<void> {
    const dto = req.body as CreateMoedaCotacaoDto;
    const cotacao = await this.moedaCotacaoService.create(dto);
    res.status(201).json(cotacao);
  }

  async update(req: Request, res: Response): Promise<void> {
    const { id } = req.params;
    const dto = req.body as UpdateMoedaCotacaoDto;
    const cotacaoId = parseInt(id, 10);
    if (isNaN(cotacaoId)) {
      throw new NotFoundException('Cotação de moeda', id);
    }
    
    const updatedCotacao = await this.moedaCotacaoService.update(cotacaoId, dto);
    res.json(updatedCotacao);
  }

  async delete(req: Request, res: Response): Promise<void> {
    const { id } = req.params;
    const cotacaoId = parseInt(id, 10);
    if (isNaN(cotacaoId)) {
      throw new NotFoundException('Cotação de moeda', id);
    }
    
    await this.moedaCotacaoService.delete(cotacaoId);
    res.status(204).send();
  }

  async findByMoeda(req: Request, res: Response): Promise<void> {
    const { idMoeda } = req.params;
    const moedaId = parseInt(idMoeda, 10);
    if (isNaN(moedaId)) {
      throw new NotFoundException('Moeda', idMoeda);
    }
    
    const cotacoes = await this.moedaCotacaoService.findByMoeda(moedaId);
    res.json(cotacoes);
  }

  async findByData(req: Request, res: Response): Promise<void> {
    const { data } = req.params;
    if (!data) {
      throw new NotFoundException('Data', data);
    }
    
    const cotacoes = await this.moedaCotacaoService.findByData(data);
    res.json(cotacoes);
  }
}

export default MoedaCotacaoController;
