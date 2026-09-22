import { Request, Response } from 'express';
import { Injectable, Inject } from '../core/di';
import { TYPES } from '../core/di/types';
import { IReciboController } from './interfaces/IReciboController';
import { IReciboApplicationService } from '../application/services/recibo/IReciboApplicationService';
import { NotFoundException } from '../core/exceptions/NotFoundException';
import { BadRequestException } from '../core/exceptions/BadRequestException';

@Injectable()
export class ReciboController implements IReciboController {
  constructor(
    @Inject(TYPES.IReciboApplicationService)
    private reciboService: IReciboApplicationService,
    @Inject(TYPES.IReciboPdfService)
    private pdfService: any
  ) {}

  async index(req: Request, res: Response): Promise<void> {
    const page = req.query.page ? Number(req.query.page) : 1;
    const limit = req.query.limit ? Number(req.query.limit) : 10;
    const filtros: any = {};
    if (req.query.status) filtros.status = req.query.status;
    if (req.query.dataInicio) filtros.dataInicio = req.query.dataInicio;
    if (req.query.dataFim) filtros.dataFim = req.query.dataFim;
    if (req.query.beneficiario) filtros.beneficiario = req.query.beneficiario;
    const result = await this.reciboService.list(page, limit, filtros);
    res.json(result);
  }

  async show(req: Request, res: Response): Promise<void> {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) throw new NotFoundException('Recibo', req.params.id);
    const result = await this.reciboService.findById(id);
    res.json(result);
  }

  async create(req: Request, res: Response): Promise<void> {
    const result = await this.reciboService.create(req.body);
    res.status(201).json(result);
  }

  async update(req: Request, res: Response): Promise<void> {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) throw new NotFoundException('Recibo', req.params.id);
    const result = await this.reciboService.update(id, req.body);
    res.json(result);
  }

  async delete(req: Request, res: Response): Promise<void> {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) throw new NotFoundException('Recibo', req.params.id);
    await this.reciboService.delete(id);
    res.status(204).send();
  }

  async cancelar(req: Request, res: Response): Promise<void> {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) throw new NotFoundException('Recibo', req.params.id);
    const result = await this.reciboService.cancelar(id, req.body);
    res.json(result);
  }

  async getKpis(req: Request, res: Response): Promise<void> {
    const dataInicio = req.query.dataInicio as string | undefined;
    const dataFim = req.query.dataFim as string | undefined;
    const result = await this.reciboService.getKpis(dataInicio, dataFim);
    res.json(result);
  }

  async prePreencherDeParcela(req: Request, res: Response): Promise<void> {
    const parcelaId = req.query.parcelaId ? Number(req.query.parcelaId) : 0;
    const tipoParcela = (req.query.tipoParcela as string) || '';
    const result = await this.reciboService.prePreencherDeParcela(parcelaId, tipoParcela);
    res.json(result);
  }

  async gerarPdf(req: Request, res: Response): Promise<void> {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) throw new NotFoundException('Recibo', req.params.id);
    if (!this.pdfService) {
      throw new BadRequestException('Serviço de geração de PDF não está disponível');
    }
    const buffer = await this.pdfService.gerarPdf(id);
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `inline; filename="recibo-${id}.pdf"`);
    res.send(buffer);
  }

  async exportarLote(req: Request, res: Response): Promise<void> {
    if (!this.pdfService) {
      throw new BadRequestException('Serviço de geração de PDF não está disponível');
    }
    const buffer = await this.pdfService.exportarLote(req.body.ids);
    res.setHeader('Content-Type', 'application/zip');
    res.setHeader('Content-Disposition', 'attachment; filename="recibos.zip"');
    res.send(buffer);
  }
}
