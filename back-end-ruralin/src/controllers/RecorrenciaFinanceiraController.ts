import { Request, Response } from 'express';
import { Injectable, Inject } from '../core/di';
import { TYPES } from '../core/di/types';
import { IRecorrenciaFinanceiraController } from './interfaces/IRecorrenciaFinanceiraController';
import { IRecorrenciaFinanceiraApplicationService } from '../application/services/recorrenciaFinanceira/IRecorrenciaFinanceiraApplicationService';
import { NotFoundException } from '../core/exceptions';

@Injectable()
export class RecorrenciaFinanceiraController implements IRecorrenciaFinanceiraController {
  constructor(
    @Inject(TYPES.IRecorrenciaFinanceiraApplicationService)
    private service: IRecorrenciaFinanceiraApplicationService
  ) {}

  async index(req: Request, res: Response): Promise<void> {
    const page = req.query.page ? Number(req.query.page) : 1;
    const limit = req.query.limit ? Number(req.query.limit) : 10;
    const tipo = req.query.tipo as string | undefined;
    const ativa = req.query.ativa !== undefined ? req.query.ativa === 'true' : undefined;

    const filtros: Record<string, unknown> = {};
    if (req.query.search) filtros.search = req.query.search as string;
    if (req.query.periodicidade) filtros.periodicidade = req.query.periodicidade as string;
    if (req.query.idFornecedorCliente) filtros.idFornecedorCliente = Number(req.query.idFornecedorCliente);
    if (req.query.idPortador) filtros.idPortador = Number(req.query.idPortador);
    if (req.query.idProdutor) filtros.idProdutor = Number(req.query.idProdutor);

    const result = await this.service.list(page, limit, tipo, ativa, filtros);
    res.json(result);
  }

  async getKpis(req: Request, res: Response): Promise<void> {
    const kpis = await this.service.getKpis();
    res.json(kpis);
  }

  async show(req: Request, res: Response): Promise<void> {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) throw new NotFoundException('RecorrenciaFinanceira', req.params.id);
    const result = await this.service.getById(id);
    if (!result) throw new NotFoundException('RecorrenciaFinanceira', req.params.id);
    res.json(result);
  }

  async create(req: Request, res: Response): Promise<void> {
    const result = await this.service.create(req.body);
    res.status(201).json(result);
  }

  async update(req: Request, res: Response): Promise<void> {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) throw new NotFoundException('RecorrenciaFinanceira', req.params.id);
    const result = await this.service.update(id, req.body);
    res.json(result);
  }

  async destroy(req: Request, res: Response): Promise<void> {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) throw new NotFoundException('RecorrenciaFinanceira', req.params.id);
    await this.service.delete(id);
    res.json({ message: 'Recorrência financeira excluída com sucesso.' });
  }

  async toggleAtiva(req: Request, res: Response): Promise<void> {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) throw new NotFoundException('RecorrenciaFinanceira', req.params.id);
    const result = await this.service.toggleAtiva(id);
    res.json({ ativa: result.ativa });
  }

  async gerarAgora(req: Request, res: Response): Promise<void> {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) throw new NotFoundException('RecorrenciaFinanceira', req.params.id);
    const result = await this.service.gerarLancamentoManual(id);
    res.status(201).json(result);
  }

  async preview(req: Request, res: Response): Promise<void> {
    const count = req.body.count || 6;
    const result = await this.service.previewProximasGeracoes(req.body, count);
    res.json(result);
  }

  async lancamentos(req: Request, res: Response): Promise<void> {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) throw new NotFoundException('RecorrenciaFinanceira', req.params.id);
    // Delegate to service - for now return from repo directly
    const recorrencia = await this.service.getById(id);
    if (!recorrencia) throw new NotFoundException('RecorrenciaFinanceira', req.params.id);
    res.json(recorrencia.lancamentos || []);
  }
}

export default RecorrenciaFinanceiraController;
