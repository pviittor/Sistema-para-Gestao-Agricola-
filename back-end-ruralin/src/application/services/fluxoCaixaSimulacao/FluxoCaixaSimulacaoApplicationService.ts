/**
 * FluxoCaixaSimulacaoApplicationService - Application Service para FluxoCaixaSimulacao
 *
 * Implementa o padrão master-detail para simulações e seus itens de override.
 * Gerencia CRUD de simulações, operações com itens (addItem, updateItem, deleteItem),
 * e o cálculo de resultados com overrides aplicados ao fluxo de caixa projetado.
 *
 * Regras de negócio:
 * - RN-11/RN-12: Overrides aplicados in-memory sobre projeção base
 * - RN-13: Qualquer alteração em itens invalida resultado_snapshot
 * - RN-14: Simulações arquivadas não podem ser editadas ou removidas
 * - RN-15: Validação cross-tenant em todas as operações
 */

import { Injectable, Inject } from '../../../core/di';
import { TYPES } from '../../../core/di/types';
import { IFluxoCaixaSimulacaoApplicationService } from './IFluxoCaixaSimulacaoApplicationService';
import { IFluxoCaixaSimulacaoRepository } from '../../../infrastructure/repository/IFluxoCaixaSimulacaoRepository';
import { IFluxoCaixaSimulacaoItemRepository } from '../../../infrastructure/repository/IFluxoCaixaSimulacaoItemRepository';
import { IFluxoCaixaCalculadorService, FluxoCaixaQueryParams } from '../fluxoCaixa/IFluxoCaixaCalculadorService';
import { CreateFluxoCaixaSimulacaoDto } from '../../dto/fluxoCaixaSimulacao/CreateFluxoCaixaSimulacaoDto';
import { CreateFluxoCaixaSimulacaoCompletoDto } from '../../dto/fluxoCaixaSimulacao/CreateFluxoCaixaSimulacaoCompletoDto';
import { UpdateFluxoCaixaSimulacaoDto } from '../../dto/fluxoCaixaSimulacao/UpdateFluxoCaixaSimulacaoDto';
import { FluxoCaixaSimulacaoItemSemIdDto } from '../../dto/fluxoCaixaSimulacao/FluxoCaixaSimulacaoItemSemIdDto';
import { FluxoCaixaSimulacaoResponseDto, FluxoCaixaSimulacaoDetailResponseDto } from '../../dto/fluxoCaixaSimulacao/FluxoCaixaSimulacaoResponseDto';
import { FluxoCaixaSimulacaoItemResponseDto } from '../../dto/fluxoCaixaSimulacao/FluxoCaixaSimulacaoItemResponseDto';
import { FluxoCaixaConsolidadoDto, FluxoCaixaEntryDto, FluxoCaixaPeriodoDto } from '../../dto/fluxoCaixa/FluxoCaixaConsolidadoDto';
import { Transactional } from '../../../core/unitofwork/Transactional';
import { Auditable } from '../../../core/audit';
import { NotFoundException, ForbiddenException, BusinessException } from '../../../core/exceptions';
import { StatusSimulacao } from '../../../models/FluxoCaixaSimulacao';
import FluxoCaixaSimulacao from '../../../models/FluxoCaixaSimulacao';
import FluxoCaixaSimulacaoItem from '../../../models/FluxoCaixaSimulacaoItem';

/**
 * Application Service para FluxoCaixaSimulacao (master-detail)
 *
 * O serviço orquestra todas as operações com a simulação pai e os itens filhos,
 * seguindo o padrão master-detail do projeto.
 */
@Injectable()
export class FluxoCaixaSimulacaoApplicationService implements IFluxoCaixaSimulacaoApplicationService {
  constructor(
    @Inject(TYPES.IFluxoCaixaSimulacaoRepository)
    private simulacaoRepository: IFluxoCaixaSimulacaoRepository,
    @Inject(TYPES.IFluxoCaixaSimulacaoItemRepository)
    private itemRepository: IFluxoCaixaSimulacaoItemRepository,
    @Inject(TYPES.IFluxoCaixaCalculadorService)
    private calculadorService: IFluxoCaixaCalculadorService,
  ) {}

  // ──── CRUD Simulacao ────

  /**
   * Busca todas as simulações de um usuário em um tenant
   */
  async findByUsuario(usuarioId: number, tenantId: number): Promise<FluxoCaixaSimulacaoResponseDto[]> {
    const simulacoes = await this.simulacaoRepository.findByUsuario(usuarioId, tenantId);
    return simulacoes.map((s) => this.toResponseDto(s));
  }

  /**
   * Busca uma simulação pelo ID com seus itens incluídos
   */
  async findById(id: number, tenantId: number): Promise<FluxoCaixaSimulacaoDetailResponseDto> {
    const simulacao = await this.simulacaoRepository.findByIdWithItens(id, tenantId);
    if (!simulacao) {
      throw new NotFoundException(
        `Simulação de fluxo de caixa com ID ${id} não encontrada.`,
        'SIMULACAO_NAO_ENCONTRADA',
      );
    }
    return this.toDetailResponseDto(simulacao);
  }

  /**
   * Cria uma simulação sem itens
   */
  @Transactional()
  @Auditable('FluxoCaixaSimulacao')
  async create(dto: CreateFluxoCaixaSimulacaoDto, tenantId: number, usuarioId: number): Promise<FluxoCaixaSimulacaoResponseDto> {
    this.validarPeriodo(dto.dataInicio, dto.dataFim);

    const simulacao = await this.simulacaoRepository.create({
      tenantId,
      usuarioId,
      nome: dto.nome,
      descricao: dto.descricao || null,
      dataInicio: dto.dataInicio,
      dataFim: dto.dataFim,
      status: StatusSimulacao.RASCUNHO,
    } as any);

    return this.toResponseDto(simulacao);
  }

  /**
   * Cria uma simulação com itens em uma única transação (master-detail)
   *
   * Segue o padrão SemId: os itens não contêm simulacaoId, que é injetado
   * pelo serviço após criar a simulação pai.
   */
  @Transactional()
  @Auditable('FluxoCaixaSimulacao')
  async createCompleto(
    dto: CreateFluxoCaixaSimulacaoCompletoDto,
    tenantId: number,
    usuarioId: number,
  ): Promise<FluxoCaixaSimulacaoDetailResponseDto> {
    this.validarPeriodo(dto.dataInicio, dto.dataFim);

    // 1. Criar simulação pai
    const simulacao = await this.simulacaoRepository.create({
      tenantId,
      usuarioId,
      nome: dto.nome,
      descricao: dto.descricao || null,
      dataInicio: dto.dataInicio,
      dataFim: dto.dataFim,
      status: StatusSimulacao.RASCUNHO,
    } as any);

    // 2. Criar itens filhos — injetar FK do pai (master-detail SemId pattern)
    if (dto.itens && dto.itens.length > 0) {
      for (const itemDto of dto.itens) {
        await this.itemRepository.create({
          simulacaoId: simulacao.id,
          tipoOverride: itemDto.tipoOverride,
          referenciaTipo: itemDto.referenciaTipo || null,
          referenciaId: itemDto.referenciaId || null,
          descricao: itemDto.descricao,
          tipoFluxo: itemDto.tipoFluxo,
          dataOriginal: itemDto.dataOriginal || null,
          dataNova: itemDto.dataNova || itemDto.dataOriginal || dto.dataInicio,
          valorOriginal: itemDto.valorOriginal ?? null,
          valorNovo: itemDto.valorNovo ?? 0,
          contaBancariaId: itemDto.contaBancariaId || null,
        } as any);
      }
    }

    // 3. Buscar registro completo com itens incluídos
    const simulacaoCompleta = await this.simulacaoRepository.findByIdWithItens(simulacao.id, tenantId);
    return this.toDetailResponseDto(simulacaoCompleta!);
  }

  /**
   * Atualiza dados da simulação
   *
   * RN-14: Simulações arquivadas não podem ser editadas.
   */
  @Transactional()
  @Auditable('FluxoCaixaSimulacao')
  async update(id: number, dto: UpdateFluxoCaixaSimulacaoDto, tenantId: number): Promise<FluxoCaixaSimulacaoResponseDto> {
    const simulacao = await this.carregarSimulacao(id, tenantId);

    // RN-14: Não permite edição se arquivada
    this.validarNaoArquivada(simulacao);

    // Validar período se ambas as datas forem informadas
    const dataInicio = dto.dataInicio || simulacao.dataInicio;
    const dataFim = dto.dataFim || simulacao.dataFim;
    this.validarPeriodo(dataInicio, dataFim);

    // Atualizar campos informados
    const dadosAtualizacao: any = {};
    if (dto.nome !== undefined) dadosAtualizacao.nome = dto.nome;
    if (dto.descricao !== undefined) dadosAtualizacao.descricao = dto.descricao;
    if (dto.dataInicio !== undefined) dadosAtualizacao.dataInicio = dto.dataInicio;
    if (dto.dataFim !== undefined) dadosAtualizacao.dataFim = dto.dataFim;
    if (dto.status !== undefined) dadosAtualizacao.status = dto.status;

    await this.simulacaoRepository.update(id, dadosAtualizacao);

    const simulacaoAtualizada = await this.simulacaoRepository.findById(id);
    return this.toResponseDto(simulacaoAtualizada!);
  }

  /**
   * Remove uma simulação e seus itens (cascade via DB)
   *
   * RN-14: Simulações arquivadas não podem ser removidas.
   */
  @Transactional()
  async delete(id: number, tenantId: number): Promise<void> {
    const simulacao = await this.carregarSimulacao(id, tenantId);

    // RN-14: Não permite remoção se arquivada
    this.validarNaoArquivada(simulacao);

    await this.simulacaoRepository.delete(id);
  }

  // ──── Items ────

  /**
   * Adiciona um item à simulação
   *
   * RN-13: Invalida resultado_snapshot após alteração nos itens.
   * RN-14: Simulações arquivadas não podem ser editadas.
   * RN-15: Validação cross-tenant.
   */
  @Transactional()
  async addItem(
    simulacaoId: number,
    dto: FluxoCaixaSimulacaoItemSemIdDto,
    tenantId: number,
  ): Promise<FluxoCaixaSimulacaoItemResponseDto> {
    const simulacao = await this.carregarSimulacao(simulacaoId, tenantId);
    this.validarNaoArquivada(simulacao);

    const item = await this.itemRepository.create({
      simulacaoId,
      tipoOverride: dto.tipoOverride,
      referenciaTipo: dto.referenciaTipo || null,
      referenciaId: dto.referenciaId || null,
      descricao: dto.descricao,
      tipoFluxo: dto.tipoFluxo,
      dataOriginal: dto.dataOriginal || null,
      dataNova: dto.dataNova || dto.dataOriginal || simulacao.dataInicio,
      valorOriginal: dto.valorOriginal ?? null,
      valorNovo: dto.valorNovo ?? 0,
      contaBancariaId: dto.contaBancariaId || null,
    } as any);

    // RN-13: Invalidar snapshot
    await this.invalidarSnapshot(simulacao);

    return this.toItemResponseDto(item);
  }

  /**
   * Atualiza um item da simulação
   *
   * RN-13: Invalida resultado_snapshot após alteração nos itens.
   * RN-14: Simulações arquivadas não podem ser editadas.
   * RN-15: Validação cross-tenant.
   */
  @Transactional()
  async updateItem(
    simulacaoId: number,
    itemId: number,
    dto: FluxoCaixaSimulacaoItemSemIdDto,
    tenantId: number,
  ): Promise<FluxoCaixaSimulacaoItemResponseDto> {
    const simulacao = await this.carregarSimulacao(simulacaoId, tenantId);
    this.validarNaoArquivada(simulacao);

    // Verificar se o item pertence à simulação
    const itemExistente = await this.itemRepository.findById(itemId);
    if (!itemExistente || itemExistente.simulacaoId !== simulacaoId) {
      throw new NotFoundException(
        `Item ${itemId} não encontrado na simulação ${simulacaoId}.`,
        'ITEM_SIMULACAO_NAO_ENCONTRADO',
      );
    }

    await this.itemRepository.update(itemId, {
      tipoOverride: dto.tipoOverride,
      referenciaTipo: dto.referenciaTipo || null,
      referenciaId: dto.referenciaId || null,
      descricao: dto.descricao,
      tipoFluxo: dto.tipoFluxo,
      dataOriginal: dto.dataOriginal || null,
      dataNova: dto.dataNova || dto.dataOriginal || simulacao.dataInicio,
      valorOriginal: dto.valorOriginal ?? null,
      valorNovo: dto.valorNovo ?? 0,
      contaBancariaId: dto.contaBancariaId || null,
    } as any);

    // RN-13: Invalidar snapshot
    await this.invalidarSnapshot(simulacao);

    const itemAtualizado = await this.itemRepository.findById(itemId);
    return this.toItemResponseDto(itemAtualizado!);
  }

  /**
   * Remove um item da simulação
   *
   * RN-13: Invalida resultado_snapshot após alteração nos itens.
   * RN-14: Simulações arquivadas não podem ser editadas.
   * RN-15: Validação cross-tenant.
   */
  @Transactional()
  async deleteItem(simulacaoId: number, itemId: number, tenantId: number): Promise<void> {
    const simulacao = await this.carregarSimulacao(simulacaoId, tenantId);
    this.validarNaoArquivada(simulacao);

    // Verificar se o item pertence à simulação
    const itemExistente = await this.itemRepository.findById(itemId);
    if (!itemExistente || itemExistente.simulacaoId !== simulacaoId) {
      throw new NotFoundException(
        `Item ${itemId} não encontrado na simulação ${simulacaoId}.`,
        'ITEM_SIMULACAO_NAO_ENCONTRADO',
      );
    }

    await this.itemRepository.delete(itemId);

    // RN-13: Invalidar snapshot
    await this.invalidarSnapshot(simulacao);
  }

  // ──── Calculation ────

  /**
   * Calcula o resultado da simulação aplicando overrides ao fluxo de caixa projetado
   *
   * Fluxo:
   * 1. Carrega simulação com itens
   * 2. Obtém projeção base via FluxoCaixaCalculadorService.calcularProjetado()
   * 3. Aplica overrides IN MEMORY (RN-11, RN-12):
   *    - adiar_pagamento: altera data do lançamento referenciado
   *    - antecipar_recebimento: altera data do lançamento referenciado
   *    - adicionar_entrada/saida: injeta novo lançamento
   *    - remover_lancamento: remove lançamento por referência
   *    - alterar_valor: altera valor do lançamento referenciado
   * 4. Re-agrupa e recalcula saldos por período
   * 5. Persiste resultado_snapshot na simulação
   */
  @Transactional()
  async calcularResultado(simulacaoId: number, tenantId: number, queryParams?: FluxoCaixaQueryParams): Promise<FluxoCaixaConsolidadoDto> {
    const simulacao = await this.simulacaoRepository.findByIdWithItens(simulacaoId, tenantId);
    if (!simulacao) {
      throw new NotFoundException(
        `Simulação de fluxo de caixa com ID ${simulacaoId} não encontrada.`,
        'SIMULACAO_NAO_ENCONTRADA',
      );
    }

    // 1. Obter projeção base do fluxo de caixa
    // Usa os params da view (se informados) para alinhar períodos com o gráfico base
    const params: FluxoCaixaQueryParams = queryParams ?? {
      dataInicio: simulacao.dataInicio,
      dataFim: simulacao.dataFim,
      periodicidade: 'mensal',
    };

    const projecaoBase = await this.calculadorService.calcularConsolidado(tenantId, params);

    // 2. Extrair todos os lançamentos da projeção base
    let lancamentos: FluxoCaixaEntryDto[] = [];
    for (const periodo of projecaoBase.periodos) {
      lancamentos.push(...periodo.lancamentos);
    }

    // 3. Aplicar overrides in-memory (RN-11, RN-12)
    const itens = (simulacao as any).itens as FluxoCaixaSimulacaoItem[] || [];
    for (const item of itens) {
      lancamentos = this.aplicarOverride(lancamentos, item);
    }

    // 4. Re-agrupar por período mensal e recalcular saldos
    const resultado = this.reagruparPeriodos(lancamentos, projecaoBase, params);

    // 5. Persistir resultado_snapshot
    await this.simulacaoRepository.update(simulacaoId, {
      resultadoSnapshot: resultado,
    } as any);

    return resultado;
  }

  // ──── Métodos Privados ────

  /**
   * Carrega a simulação e valida cross-tenant (RN-15)
   */
  private async carregarSimulacao(id: number, tenantId: number): Promise<FluxoCaixaSimulacao> {
    const simulacao = await this.simulacaoRepository.findById(id);
    if (!simulacao) {
      throw new NotFoundException(
        `Simulação de fluxo de caixa com ID ${id} não encontrada.`,
        'SIMULACAO_NAO_ENCONTRADA',
      );
    }

    // RN-15: Validação cross-tenant
    if (simulacao.tenantId !== tenantId) {
      throw new ForbiddenException(
        'Acesso negado. A simulação pertence a outro tenant.',
        'CROSS_TENANT_ACCESS_DENIED',
      );
    }

    return simulacao;
  }

  /**
   * RN-14: Valida que a simulação não está arquivada
   */
  private validarNaoArquivada(simulacao: FluxoCaixaSimulacao): void {
    if (simulacao.status === StatusSimulacao.ARQUIVADO) {
      throw new ForbiddenException(
        'Não é possível alterar ou remover uma simulação arquivada.',
        'SIMULACAO_ARQUIVADA',
      );
    }
  }

  /**
   * Valida que dataFim é posterior a dataInicio
   */
  private validarPeriodo(dataInicio: string, dataFim: string): void {
    if (new Date(dataFim) <= new Date(dataInicio)) {
      throw new BusinessException(
        'A data de fim deve ser posterior à data de início.',
        'PERIODO_INVALIDO',
      );
    }
  }

  /**
   * RN-13: Invalida o resultado_snapshot quando itens são alterados
   */
  private async invalidarSnapshot(simulacao: FluxoCaixaSimulacao): Promise<void> {
    if (simulacao.resultadoSnapshot !== null) {
      await this.simulacaoRepository.update(simulacao.id, {
        resultadoSnapshot: null,
      } as any);
    }
  }

  /**
   * Aplica um override in-memory sobre a lista de lançamentos (RN-11, RN-12)
   */
  private aplicarOverride(
    lancamentos: FluxoCaixaEntryDto[],
    item: FluxoCaixaSimulacaoItem,
  ): FluxoCaixaEntryDto[] {
    switch (item.tipoOverride) {
      case 'adiar_pagamento':
      case 'antecipar_recebimento': {
        // Encontrar lançamento pela referência e alterar a data
        return lancamentos.map((l) => {
          if (
            item.referenciaTipo &&
            item.referenciaId &&
            l.origem === item.referenciaTipo &&
            l.origemId === item.referenciaId
          ) {
            return {
              ...l,
              data: item.dataNova,
              valor: item.valorNovo != null ? Number(item.valorNovo) : l.valor,
            };
          }
          return l;
        });
      }

      case 'adicionar_entrada':
      case 'adicionar_saida': {
        // Injetar novo lançamento
        const novoLancamento: FluxoCaixaEntryDto = {
          tipoFluxo: item.tipoFluxo,
          origem: item.referenciaTipo || 'simulacao',
          origemId: item.referenciaId || null,
          descricao: item.descricao,
          data: item.dataNova,
          valor: Number(item.valorNovo),
          contaBancariaId: item.contaBancariaId || null,
          contaBancariaNome: null,
          realizado: false,
          planoContaId: null,
          planoContaNome: null,
        };
        return [...lancamentos, novoLancamento];
      }

      case 'remover_lancamento': {
        // Remover lançamento por referência
        return lancamentos.filter((l) => {
          if (
            item.referenciaTipo &&
            item.referenciaId &&
            l.origem === item.referenciaTipo &&
            l.origemId === item.referenciaId
          ) {
            return false;
          }
          return true;
        });
      }

      case 'alterar_valor': {
        // Alterar valor do lançamento referenciado
        return lancamentos.map((l) => {
          if (
            item.referenciaTipo &&
            item.referenciaId &&
            l.origem === item.referenciaTipo &&
            l.origemId === item.referenciaId
          ) {
            return {
              ...l,
              valor: Number(item.valorNovo),
            };
          }
          return l;
        });
      }

      default:
        return lancamentos;
    }
  }

  /**
   * Re-agrupa lançamentos usando os mesmos períodos da projeção base
   * para garantir alinhamento com o gráfico principal
   */
  private reagruparPeriodos(
    lancamentos: FluxoCaixaEntryDto[],
    projecaoBase: FluxoCaixaConsolidadoDto,
    params: FluxoCaixaQueryParams,
  ): FluxoCaixaConsolidadoDto {
    // Ordenar lançamentos por data
    lancamentos.sort((a, b) => a.data.localeCompare(b.data));

    let saldoAcumulado = projecaoBase.saldoInicial;
    let totalEntradas = 0;
    let totalSaidas = 0;
    const periodos: FluxoCaixaPeriodoDto[] = [];

    // Usar os mesmos períodos da base para manter alinhamento no gráfico
    for (const periodoBase of projecaoBase.periodos) {
      const lancamentosPeriodo = lancamentos.filter(
        (l) => l.data >= periodoBase.dataInicio && l.data <= periodoBase.dataFim,
      );

      let entradasPeriodo = 0;
      let saidasPeriodo = 0;

      for (const l of lancamentosPeriodo) {
        if (l.tipoFluxo === 'entrada') {
          entradasPeriodo += l.valor;
        } else {
          saidasPeriodo += l.valor;
        }
      }

      const saldoPeriodo = entradasPeriodo - saidasPeriodo;
      saldoAcumulado += saldoPeriodo;
      totalEntradas += entradasPeriodo;
      totalSaidas += saidasPeriodo;

      periodos.push({
        rotulo: periodoBase.rotulo,
        dataInicio: periodoBase.dataInicio,
        dataFim: periodoBase.dataFim,
        totalEntradas: entradasPeriodo,
        totalSaidas: saidasPeriodo,
        saldoPeriodo,
        saldoAcumulado,
        lancamentos: lancamentosPeriodo,
      });
    }

    return {
      periodicidade: params.periodicidade,
      dataInicio: params.dataInicio,
      dataFim: params.dataFim,
      saldoInicial: projecaoBase.saldoInicial,
      saldoFinal: saldoAcumulado,
      totalEntradas,
      totalSaidas,
      periodos,
      saldosPorConta: projecaoBase.saldosPorConta,
      alertas: projecaoBase.alertas,
    };
  }

  // ──── Mappers ────

  /**
   * Converte entidade FluxoCaixaSimulacao para DTO de resposta
   */
  private toResponseDto(entity: FluxoCaixaSimulacao): FluxoCaixaSimulacaoResponseDto {
    return {
      id: entity.id,
      tenantId: entity.tenantId,
      nome: entity.nome,
      descricao: entity.descricao,
      dataInicio: entity.dataInicio,
      dataFim: entity.dataFim,
      status: entity.status,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
    };
  }

  /**
   * Converte entidade FluxoCaixaSimulacao (com itens) para DTO de resposta detalhada
   */
  private toDetailResponseDto(entity: FluxoCaixaSimulacao): FluxoCaixaSimulacaoDetailResponseDto {
    const dto: FluxoCaixaSimulacaoDetailResponseDto = {
      ...this.toResponseDto(entity),
    };

    const itens = (entity as any).itens;
    if (itens && Array.isArray(itens)) {
      dto.itens = itens.map((item: FluxoCaixaSimulacaoItem) => this.toItemResponseDto(item));
    } else {
      dto.itens = null;
    }

    return dto;
  }

  /**
   * Converte entidade FluxoCaixaSimulacaoItem para DTO de resposta
   */
  private toItemResponseDto(entity: FluxoCaixaSimulacaoItem): FluxoCaixaSimulacaoItemResponseDto {
    return {
      id: entity.id,
      simulacaoId: entity.simulacaoId,
      tipoOverride: entity.tipoOverride || '',
      referenciaTipo: entity.referenciaTipo,
      referenciaId: entity.referenciaId,
      descricao: entity.descricao,
      tipoFluxo: entity.tipoFluxo,
      dataOriginal: entity.dataOriginal,
      dataNova: entity.dataNova,
      valorOriginal: entity.valorOriginal != null ? Number(entity.valorOriginal) : null,
      valorNovo: entity.valorNovo != null ? Number(entity.valorNovo) : null,
      contaBancariaId: entity.contaBancariaId,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
    };
  }
}
