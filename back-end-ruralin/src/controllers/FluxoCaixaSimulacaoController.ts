import { Request, Response } from 'express';
import { Injectable, Inject } from '../core/di';
import { TYPES } from '../core/di/types';
import { IFluxoCaixaSimulacaoController } from './interfaces/IFluxoCaixaSimulacaoController';
import { IFluxoCaixaSimulacaoApplicationService } from '../application/services/fluxoCaixaSimulacao/IFluxoCaixaSimulacaoApplicationService';
import { CreateFluxoCaixaSimulacaoDto, UpdateFluxoCaixaSimulacaoDto, FluxoCaixaSimulacaoItemSemIdDto, CreateFluxoCaixaSimulacaoCompletoDto } from '../application/dto/fluxoCaixaSimulacao';
import { NotFoundException, BadRequestException } from '../core/exceptions';
import { getRequestContext } from '../core/authorization/helpers';

@Injectable()
export class FluxoCaixaSimulacaoController implements IFluxoCaixaSimulacaoController {
  constructor(
    @Inject(TYPES.IFluxoCaixaSimulacaoApplicationService)
    private simulacaoService: IFluxoCaixaSimulacaoApplicationService
  ) {}

  private getTenantId(): number {
    const tenantId = getRequestContext()?.getTenantId();
    if (!tenantId) throw new BadRequestException('Tenant não identificado');
    return tenantId;
  }

  private getUserId(): number {
    const userId = getRequestContext()?.getUserId();
    if (!userId) throw new BadRequestException('Usuário não identificado');
    return userId;
  }

  async index(req: Request, res: Response): Promise<void> {
    const tenantId = this.getTenantId();
    const usuarioId = this.getUserId();

    const simulacoes = await this.simulacaoService.findByUsuario(usuarioId, tenantId);

    res.json(simulacoes);
  }

  async show(req: Request, res: Response): Promise<void> {
    const { id } = req.params;
    const tenantId = this.getTenantId();

    const simulacaoId = parseInt(id, 10);
    if (isNaN(simulacaoId)) {
      throw new NotFoundException('Simulação', id);
    }

    const simulacao = await this.simulacaoService.findById(simulacaoId, tenantId);

    res.json(simulacao);
  }

  async create(req: Request, res: Response): Promise<void> {
    const tenantId = this.getTenantId();
    const usuarioId = this.getUserId();
    const dto = req.body as CreateFluxoCaixaSimulacaoDto;

    const simulacao = await this.simulacaoService.create(dto, tenantId, usuarioId);

    res.status(201).json(simulacao);
  }

  async createCompleto(req: Request, res: Response): Promise<void> {
    const tenantId = this.getTenantId();
    const usuarioId = this.getUserId();
    const dto = req.body as CreateFluxoCaixaSimulacaoCompletoDto;

    const simulacao = await this.simulacaoService.createCompleto(dto, tenantId, usuarioId);

    res.status(201).json(simulacao);
  }

  async update(req: Request, res: Response): Promise<void> {
    const { id } = req.params;
    const tenantId = this.getTenantId();
    const dto = req.body as UpdateFluxoCaixaSimulacaoDto;

    const simulacaoId = parseInt(id, 10);
    if (isNaN(simulacaoId)) {
      throw new NotFoundException('Simulação', id);
    }

    const simulacao = await this.simulacaoService.update(simulacaoId, dto, tenantId);

    res.json(simulacao);
  }

  async delete(req: Request, res: Response): Promise<void> {
    const { id } = req.params;
    const tenantId = this.getTenantId();

    const simulacaoId = parseInt(id, 10);
    if (isNaN(simulacaoId)) {
      throw new NotFoundException('Simulação', id);
    }

    await this.simulacaoService.delete(simulacaoId, tenantId);

    res.status(204).send();
  }

  async calcular(req: Request, res: Response): Promise<void> {
    const { id } = req.params;
    const tenantId = this.getTenantId();

    const simulacaoId = parseInt(id, 10);
    if (isNaN(simulacaoId)) {
      throw new NotFoundException('Simulação', id);
    }

    // Aceita query params opcionais para alinhar com os filtros da view
    const { dataInicio, dataFim, periodicidade } = req.query;
    const queryParams = (dataInicio && dataFim && periodicidade)
      ? {
          dataInicio: dataInicio as string,
          dataFim: dataFim as string,
          periodicidade: periodicidade as 'diario' | 'semanal' | 'mensal' | 'safra',
        }
      : undefined;

    const resultado = await this.simulacaoService.calcularResultado(simulacaoId, tenantId, queryParams);

    res.json(resultado);
  }

  async addItem(req: Request, res: Response): Promise<void> {
    const { id } = req.params;
    const tenantId = this.getTenantId();
    const dto = req.body as FluxoCaixaSimulacaoItemSemIdDto;

    const simulacaoId = parseInt(id, 10);
    if (isNaN(simulacaoId)) {
      throw new NotFoundException('Simulação', id);
    }

    const item = await this.simulacaoService.addItem(simulacaoId, dto, tenantId);

    res.status(201).json(item);
  }

  async updateItem(req: Request, res: Response): Promise<void> {
    const { id, itemId } = req.params;
    const tenantId = this.getTenantId();
    const dto = req.body as FluxoCaixaSimulacaoItemSemIdDto;

    const simulacaoId = parseInt(id, 10);
    const parsedItemId = parseInt(itemId, 10);
    if (isNaN(simulacaoId) || isNaN(parsedItemId)) {
      throw new BadRequestException('IDs inválidos');
    }

    const item = await this.simulacaoService.updateItem(simulacaoId, parsedItemId, dto, tenantId);

    res.json(item);
  }

  async deleteItem(req: Request, res: Response): Promise<void> {
    const { id, itemId } = req.params;
    const tenantId = this.getTenantId();

    const simulacaoId = parseInt(id, 10);
    const parsedItemId = parseInt(itemId, 10);
    if (isNaN(simulacaoId) || isNaN(parsedItemId)) {
      throw new BadRequestException('IDs inválidos');
    }

    await this.simulacaoService.deleteItem(simulacaoId, parsedItemId, tenantId);

    res.status(204).send();
  }
}

export default FluxoCaixaSimulacaoController;
