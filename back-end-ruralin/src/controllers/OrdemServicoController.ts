/**
 * OrdemServicoController - Controller HTTP para Ordens de Serviço
 *
 * Controller responsável pelo gerenciamento de ordens de serviço via HTTP.
 * Inclui CRUD completo, workflow de status e KPIs.
 *
 * Response Format B (Unwrapped): res.json(result) direto.
 */

import { Request, Response } from 'express';
import { Injectable, Inject } from '../core/di';
import { TYPES } from '../core/di/types';
import { IOrdemServicoController } from './interfaces/IOrdemServicoController';
import {
  IOrdemServicoApplicationService,
  OrdemServicoFilters,
  OrdemServicoKpiFilters,
} from '../application/services/ordemServico/IOrdemServicoApplicationService';
import { CreateOrdemServicoCompletoDto } from '../application/dto/ordemServico/CreateOrdemServicoCompletoDto';
import { UpdateOrdemServicoCompletoDto } from '../application/dto/ordemServico/UpdateOrdemServicoCompletoDto';
import { AtribuirOrdemServicoDto } from '../application/dto/ordemServico/AtribuirOrdemServicoDto';
import { IniciarOrdemServicoDto } from '../application/dto/ordemServico/IniciarOrdemServicoDto';
import { ConcluirOrdemServicoDto } from '../application/dto/ordemServico/ConcluirOrdemServicoDto';
import { ValidarOrdemServicoDto } from '../application/dto/ordemServico/ValidarOrdemServicoDto';
import { CancelarOrdemServicoDto } from '../application/dto/ordemServico/CancelarOrdemServicoDto';
import { NotFoundException, BadRequestException } from '../core/exceptions';
import { getRequestContext } from '../core/authorization/helpers';

@Injectable()
export class OrdemServicoController implements IOrdemServicoController {
  constructor(
    @Inject(TYPES.IOrdemServicoApplicationService)
    private ordemServicoService: IOrdemServicoApplicationService
  ) {}

  /**
   * Lista ordens de serviço com paginação e filtros
   * GET /api/ordens-servico?page=1&limit=10&status=PLANEJADA&fazendaId=1...
   */
  async list(req: Request, res: Response): Promise<void> {
    const page = req.query.page ? Number(req.query.page) : 1;
    const limit = req.query.limit ? Number(req.query.limit) : 10;

    const filters: OrdemServicoFilters = {};
    if (req.query.status) filters.status = String(req.query.status);
    if (req.query.fazendaId) filters.fazendaId = Number(req.query.fazendaId);
    if (req.query.tipoAtividadeOSId) filters.tipoAtividadeOSId = Number(req.query.tipoAtividadeOSId);
    if (req.query.dataPlanejadaInicio) filters.dataPlanejadaInicio = String(req.query.dataPlanejadaInicio);
    if (req.query.dataPlanejadaFim) filters.dataPlanejadaFim = String(req.query.dataPlanejadaFim);
    if (req.query.prioridade) filters.prioridade = String(req.query.prioridade);
    if (req.query.safraId) filters.safraId = Number(req.query.safraId);
    if (req.query.atrasadas === 'true') filters.atrasadas = true;
    if (req.query.acimaOrcamento === 'true') filters.acimaOrcamento = true;
    if (req.query.varianciaMinima) filters.varianciaMinima = Number(req.query.varianciaMinima);

    const result = await this.ordemServicoService.list(page, limit, filters);

    res.json(result);
  }

  /**
   * Busca uma ordem de serviço por ID
   * GET /api/ordens-servico/:id
   */
  async getById(req: Request, res: Response): Promise<void> {
    const { id } = req.params;

    const ordemServicoId = parseInt(id, 10);
    if (isNaN(ordemServicoId)) {
      throw new NotFoundException('Ordem de Serviço', id);
    }

    const ordemServico = await this.ordemServicoService.getById(ordemServicoId);

    if (!ordemServico) {
      throw new NotFoundException('Ordem de Serviço', id);
    }

    res.json(ordemServico);
  }

  /**
   * Cria uma OS completa com todos os filhos em uma única transação
   * POST /api/ordens-servico/completo
   */
  async createCompleto(req: Request, res: Response): Promise<void> {
    const dto = req.body as CreateOrdemServicoCompletoDto;

    const result = await this.ordemServicoService.createCompleto(dto);

    res.status(201).json(result);
  }

  /**
   * Atualiza uma OS completa com todos os filhos
   * PUT /api/ordens-servico/:id/completo
   */
  async updateCompleto(req: Request, res: Response): Promise<void> {
    const { id } = req.params;
    const dto = req.body as UpdateOrdemServicoCompletoDto;

    const ordemServicoId = parseInt(id, 10);
    if (isNaN(ordemServicoId)) {
      throw new NotFoundException('Ordem de Serviço', id);
    }

    const result = await this.ordemServicoService.updateCompleto(ordemServicoId, dto);

    res.json(result);
  }

  /**
   * Remove uma ordem de serviço
   * DELETE /api/ordens-servico/:id
   */
  async delete(req: Request, res: Response): Promise<void> {
    const { id } = req.params;

    const ordemServicoId = parseInt(id, 10);
    if (isNaN(ordemServicoId)) {
      throw new NotFoundException('Ordem de Serviço', id);
    }

    await this.ordemServicoService.delete(ordemServicoId);

    res.status(204).send();
  }

  // --- Workflow de status ---

  /**
   * Atribui responsáveis a uma OS
   * POST /api/ordens-servico/:id/atribuir
   */
  async atribuir(req: Request, res: Response): Promise<void> {
    const { id } = req.params;
    const dto = req.body as AtribuirOrdemServicoDto;

    const ordemServicoId = parseInt(id, 10);
    if (isNaN(ordemServicoId)) {
      throw new NotFoundException('Ordem de Serviço', id);
    }

    const result = await this.ordemServicoService.atribuir(ordemServicoId, dto);

    res.json(result);
  }

  /**
   * Inicia a execução de uma OS
   * POST /api/ordens-servico/:id/iniciar
   */
  async iniciar(req: Request, res: Response): Promise<void> {
    const { id } = req.params;
    const dto = req.body as IniciarOrdemServicoDto;

    const ordemServicoId = parseInt(id, 10);
    if (isNaN(ordemServicoId)) {
      throw new NotFoundException('Ordem de Serviço', id);
    }

    const result = await this.ordemServicoService.iniciar(ordemServicoId, dto);

    res.json(result);
  }

  /**
   * Conclui uma OS
   * POST /api/ordens-servico/:id/concluir
   */
  async concluir(req: Request, res: Response): Promise<void> {
    const { id } = req.params;
    const dto = req.body as ConcluirOrdemServicoDto;

    const ordemServicoId = parseInt(id, 10);
    if (isNaN(ordemServicoId)) {
      throw new NotFoundException('Ordem de Serviço', id);
    }

    const result = await this.ordemServicoService.concluir(ordemServicoId, dto);

    res.json(result);
  }

  /**
   * Valida uma OS concluída
   * POST /api/ordens-servico/:id/validar
   */
  async validar(req: Request, res: Response): Promise<void> {
    const { id } = req.params;
    const dto = req.body as ValidarOrdemServicoDto;

    const ordemServicoId = parseInt(id, 10);
    if (isNaN(ordemServicoId)) {
      throw new NotFoundException('Ordem de Serviço', id);
    }

    const result = await this.ordemServicoService.validar(ordemServicoId, dto);

    res.json(result);
  }

  /**
   * Cancela uma OS
   * POST /api/ordens-servico/:id/cancelar
   */
  async cancelar(req: Request, res: Response): Promise<void> {
    const { id } = req.params;
    const dto = req.body as CancelarOrdemServicoDto;

    const ordemServicoId = parseInt(id, 10);
    if (isNaN(ordemServicoId)) {
      throw new NotFoundException('Ordem de Serviço', id);
    }

    const result = await this.ordemServicoService.cancelar(ordemServicoId, dto);

    res.json(result);
  }

  /**
   * Retorna KPIs consolidados das ordens de serviço
   * GET /api/ordens-servico/kpis
   */
  async getKpis(req: Request, res: Response): Promise<void> {
    const filters: OrdemServicoKpiFilters = {};
    if (req.query.fazendaId) filters.fazendaId = Number(req.query.fazendaId);
    if (req.query.safraId) filters.safraId = Number(req.query.safraId);
    if (req.query.dataInicio) filters.dataInicio = String(req.query.dataInicio);
    if (req.query.dataFim) filters.dataFim = String(req.query.dataFim);

    const kpis = await this.ordemServicoService.getKpis(filters);

    res.json(kpis);
  }

  // --- Endpoints de Consulta (Fase 2B) ---

  /**
   * Custeio por talhão/safra
   * GET /api/ordens-servico/custeio
   */
  async getCusteio(req: Request, res: Response): Promise<void> {
    const context = getRequestContext();
    const tenantId = context?.getTenantId();
    if (!tenantId) {
      throw new BadRequestException('Tenant não identificado.');
    }

    const filters: any = {};
    if (req.query.talhaoId) filters.talhaoId = Number(req.query.talhaoId);
    if (req.query.safraId) filters.safraId = Number(req.query.safraId);
    if (req.query.fazendaId) filters.fazendaId = Number(req.query.fazendaId);
    if (req.query.dataInicio) filters.dataInicio = String(req.query.dataInicio);
    if (req.query.dataFim) filters.dataFim = String(req.query.dataFim);

    const result = await this.ordemServicoService.getCusteio(filters, tenantId);
    res.json(result);
  }

  /**
   * Resumo de custeio por safra
   * GET /api/ordens-servico/custeio/resumo
   */
  async getCusteioResumo(req: Request, res: Response): Promise<void> {
    const context = getRequestContext();
    const tenantId = context?.getTenantId();
    if (!tenantId) {
      throw new BadRequestException('Tenant não identificado.');
    }

    const filters: any = {};
    if (req.query.safraId) filters.safraId = Number(req.query.safraId);
    if (req.query.fazendaId) filters.fazendaId = Number(req.query.fazendaId);
    if (req.query.dataInicio) filters.dataInicio = String(req.query.dataInicio);
    if (req.query.dataFim) filters.dataFim = String(req.query.dataFim);

    const result = await this.ordemServicoService.getCusteioResumo(filters, tenantId);
    res.json(result);
  }

  /**
   * Timeline de OS por dia
   * GET /api/ordens-servico/timeline
   */
  async getTimeline(req: Request, res: Response): Promise<void> {
    const context = getRequestContext();
    const tenantId = context?.getTenantId();
    if (!tenantId) {
      throw new BadRequestException('Tenant não identificado.');
    }

    const dataInicio = req.query.dataInicio ? String(req.query.dataInicio) : '';
    const dataFim = req.query.dataFim ? String(req.query.dataFim) : '';

    if (!dataInicio || !dataFim) {
      throw new BadRequestException('dataInicio e dataFim são obrigatórios para timeline.');
    }

    const filters: any = { dataInicio, dataFim };
    if (req.query.fazendaId) filters.fazendaId = Number(req.query.fazendaId);
    if (req.query.safraId) filters.safraId = Number(req.query.safraId);

    const result = await this.ordemServicoService.getTimeline(filters, tenantId);
    res.json(result);
  }

  /**
   * Mapa de calor por talhão
   * GET /api/ordens-servico/mapa-calor
   */
  async getMapaCalor(req: Request, res: Response): Promise<void> {
    const context = getRequestContext();
    const tenantId = context?.getTenantId();
    if (!tenantId) {
      throw new BadRequestException('Tenant não identificado.');
    }

    const filters: any = {};
    if (req.query.fazendaId) filters.fazendaId = Number(req.query.fazendaId);
    if (req.query.safraId) filters.safraId = Number(req.query.safraId);
    if (req.query.status) filters.status = String(req.query.status);
    if (req.query.dataInicio) filters.dataInicio = String(req.query.dataInicio);
    if (req.query.dataFim) filters.dataFim = String(req.query.dataFim);

    const result = await this.ordemServicoService.getMapaCalor(filters, tenantId);
    res.json(result);
  }

  /**
   * Carga de trabalho dos responsáveis
   * GET /api/ordens-servico/carga-trabalho
   */
  async getCargaTrabalho(req: Request, res: Response): Promise<void> {
    const context = getRequestContext();
    const tenantId = context?.getTenantId();
    if (!tenantId) {
      throw new BadRequestException('Tenant não identificado.');
    }

    const filters: any = {};
    if (req.query.semana) filters.semana = String(req.query.semana);
    if (req.query.fazendaId) filters.fazendaId = Number(req.query.fazendaId);

    const result = await this.ordemServicoService.getCargaTrabalho(filters, tenantId);
    res.json(result);
  }

  /**
   * Histórico de execução de um responsável
   * GET /api/ordens-servico/historico-execucao/:pessoaId
   */
  async getHistoricoExecucao(req: Request, res: Response): Promise<void> {
    const context = getRequestContext();
    const tenantId = context?.getTenantId();
    if (!tenantId) {
      throw new BadRequestException('Tenant não identificado.');
    }

    const pessoaId = parseInt(req.params.pessoaId, 10);
    if (isNaN(pessoaId)) {
      throw new BadRequestException('pessoaId inválido.');
    }

    const filters: any = {};
    if (req.query.tipoAtividadeOSId) filters.tipoAtividadeOSId = Number(req.query.tipoAtividadeOSId);
    if (req.query.dataInicio) filters.dataInicio = String(req.query.dataInicio);
    if (req.query.dataFim) filters.dataFim = String(req.query.dataFim);

    const result = await this.ordemServicoService.getHistoricoExecucao(pessoaId, filters, tenantId);
    res.json(result);
  }

  // --- Endpoints de Analytics (Sprint 7 OS) ---

  /**
   * Produtividade por operador/responsável
   * GET /api/ordens-servico/analytics/produtividade-operador
   */
  async getProdutividadeOperador(req: Request, res: Response): Promise<void> {
    const context = getRequestContext();
    const tenantId = context?.getTenantId();
    if (!tenantId) {
      throw new BadRequestException('Tenant não identificado.');
    }

    const filters: any = {};
    if (req.query.fazendaId) filters.fazendaId = Number(req.query.fazendaId);
    if (req.query.safraId) filters.safraId = Number(req.query.safraId);
    if (req.query.dataInicio) filters.dataInicio = String(req.query.dataInicio);
    if (req.query.dataFim) filters.dataFim = String(req.query.dataFim);
    if (req.query.tipoAtividadeOSId) filters.tipoAtividadeOSId = Number(req.query.tipoAtividadeOSId);

    const result = await this.ordemServicoService.getProdutividadeOperador(filters, tenantId);
    res.json(result);
  }

  /**
   * Rendimento por máquina
   * GET /api/ordens-servico/analytics/rendimento-maquina
   */
  async getRendimentoMaquina(req: Request, res: Response): Promise<void> {
    const context = getRequestContext();
    const tenantId = context?.getTenantId();
    if (!tenantId) {
      throw new BadRequestException('Tenant não identificado.');
    }

    const filters: any = {};
    if (req.query.fazendaId) filters.fazendaId = Number(req.query.fazendaId);
    if (req.query.safraId) filters.safraId = Number(req.query.safraId);
    if (req.query.dataInicio) filters.dataInicio = String(req.query.dataInicio);
    if (req.query.dataFim) filters.dataFim = String(req.query.dataFim);
    if (req.query.tipoAtividadeOSId) filters.tipoAtividadeOSId = Number(req.query.tipoAtividadeOSId);

    const result = await this.ordemServicoService.getRendimentoMaquina(filters, tenantId);
    res.json(result);
  }

  /**
   * Custo por categoria de atividade
   * GET /api/ordens-servico/analytics/custo-categoria
   */
  async getCustoCategoria(req: Request, res: Response): Promise<void> {
    const context = getRequestContext();
    const tenantId = context?.getTenantId();
    if (!tenantId) {
      throw new BadRequestException('Tenant não identificado.');
    }

    const filters: any = {};
    if (req.query.fazendaId) filters.fazendaId = Number(req.query.fazendaId);
    if (req.query.safraId) filters.safraId = Number(req.query.safraId);
    if (req.query.dataInicio) filters.dataInicio = String(req.query.dataInicio);
    if (req.query.dataFim) filters.dataFim = String(req.query.dataFim);

    const result = await this.ordemServicoService.getCustoCategoria(filters, tenantId);
    res.json(result);
  }

  /**
   * Ranking de talhões por custo/produtividade
   * GET /api/ordens-servico/analytics/ranking-talhoes
   */
  async getRankingTalhoes(req: Request, res: Response): Promise<void> {
    const context = getRequestContext();
    const tenantId = context?.getTenantId();
    if (!tenantId) {
      throw new BadRequestException('Tenant não identificado.');
    }

    const filters: any = {};
    if (req.query.fazendaId) filters.fazendaId = Number(req.query.fazendaId);
    if (req.query.safraId) filters.safraId = Number(req.query.safraId);
    if (req.query.dataInicio) filters.dataInicio = String(req.query.dataInicio);
    if (req.query.dataFim) filters.dataFim = String(req.query.dataFim);
    if (req.query.tipoAtividadeOSId) filters.tipoAtividadeOSId = Number(req.query.tipoAtividadeOSId);

    const result = await this.ordemServicoService.getRankingTalhoes(filters, tenantId);
    res.json(result);
  }

  /**
   * Evolução temporal de OS por semana ou mês
   * GET /api/ordens-servico/analytics/evolucao-temporal
   */
  async getEvolucaoTemporal(req: Request, res: Response): Promise<void> {
    const context = getRequestContext();
    const tenantId = context?.getTenantId();
    if (!tenantId) {
      throw new BadRequestException('Tenant não identificado.');
    }

    const filters: any = {};
    if (req.query.fazendaId) filters.fazendaId = Number(req.query.fazendaId);
    if (req.query.safraId) filters.safraId = Number(req.query.safraId);
    if (req.query.dataInicio) filters.dataInicio = String(req.query.dataInicio);
    if (req.query.dataFim) filters.dataFim = String(req.query.dataFim);
    if (req.query.agrupamento) filters.agrupamento = String(req.query.agrupamento) as 'semana' | 'mes';

    const result = await this.ordemServicoService.getEvolucaoTemporal(filters, tenantId);
    res.json(result);
  }

  /**
   * Sync endpoint para dispositivos mobile
   * GET /api/ordens-servico/sync
   */
  async getSync(req: Request, res: Response): Promise<void> {
    const context = getRequestContext();
    const tenantId = context?.getTenantId();
    if (!tenantId) {
      throw new BadRequestException('Tenant não identificado.');
    }

    const since = req.query.since ? String(req.query.since) : new Date(0).toISOString();
    const limit = req.query.limit ? Number(req.query.limit) : 100;

    const result = await this.ordemServicoService.getSync(since, tenantId, limit);
    res.json(result);
  }
}

export default OrdemServicoController;
