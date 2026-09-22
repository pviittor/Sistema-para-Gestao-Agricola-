import { Request, Response } from 'express';
import { Injectable, Inject } from '../core/di';
import { TYPES } from '../core/di/types';
import { INumeracaoNfeController } from './interfaces/INumeracaoNfeController';
import { INumeracaoNfeApplicationService } from '../application/services/numeracaoNfe/INumeracaoNfeApplicationService';
import { NotFoundException } from '../core/exceptions/NotFoundException';

/**
 * Controller para gerenciamento de numeração sequencial de NF-e/NFC-e
 */
@Injectable()
export class NumeracaoNfeController implements INumeracaoNfeController {
  constructor(
    @Inject(TYPES.INumeracaoNfeApplicationService)
    private numeracaoNfeService: INumeracaoNfeApplicationService
  ) {}

  /**
   * Lista todas as numerações com paginação
   */
  async index(req: Request, res: Response): Promise<void> {
    const page = req.query.page ? Number(req.query.page) : 1;
    const limit = req.query.limit ? Number(req.query.limit) : 10;

    const result = await this.numeracaoNfeService.list(page, limit);
    res.json(result);
  }

  /**
   * Busca uma numeração por ID
   */
  async show(req: Request, res: Response): Promise<void> {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) {
      throw new NotFoundException('Numeração NF-e', req.params.id);
    }

    const numeracao = await this.numeracaoNfeService.findById(id);
    if (!numeracao) {
      throw new NotFoundException('Numeração NF-e', String(id));
    }

    res.json(numeracao);
  }

  /**
   * Cria uma nova numeração
   */
  async create(req: Request, res: Response): Promise<void> {
    const result = await this.numeracaoNfeService.create(req.body);
    res.status(201).json(result);
  }

  /**
   * Atualiza uma numeração existente
   */
  async update(req: Request, res: Response): Promise<void> {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) {
      throw new NotFoundException('Numeração NF-e', req.params.id);
    }

    const result = await this.numeracaoNfeService.update(id, req.body);
    res.json(result);
  }

  /**
   * Remove uma numeração
   */
  async delete(req: Request, res: Response): Promise<void> {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) {
      throw new NotFoundException('Numeração NF-e', req.params.id);
    }

    await this.numeracaoNfeService.delete(id);
    res.status(204).send();
  }

  /**
   * Consulta o próximo número sem consumir
   */
  async consultarProximo(req: Request, res: Response): Promise<void> {
    const { serie, modelo } = req.query;

    const proximoNumero = await this.numeracaoNfeService.consultarProximoNumero(
      String(serie || '1'),
      String(modelo || '55')
    );

    res.json({ proximoNumero });
  }
}
