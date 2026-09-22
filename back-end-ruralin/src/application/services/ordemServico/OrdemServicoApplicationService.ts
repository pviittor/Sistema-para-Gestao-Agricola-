import { Injectable, Inject } from '../../../core/di';
import { TYPES } from '../../../core/di/types';
import {
  IOrdemServicoApplicationService,
  OrdemServicoFilters,
  OrdemServicoKpis,
  OrdemServicoKpiFilters,
} from './IOrdemServicoApplicationService';
import { IOrdemServicoRepository } from '../../../infrastructure/repository/IOrdemServicoRepository';
import { IOrdemServicoTalhaoRepository } from '../../../infrastructure/repository/IOrdemServicoTalhaoRepository';
import { IOrdemServicoInsumoRepository } from '../../../infrastructure/repository/IOrdemServicoInsumoRepository';
import { IOrdemServicoMaquinaRepository } from '../../../infrastructure/repository/IOrdemServicoMaquinaRepository';
import { IOrdemServicoResponsavelRepository } from '../../../infrastructure/repository/IOrdemServicoResponsavelRepository';
import { ITipoAtividadeOSRepository } from '../../../infrastructure/repository/ITipoAtividadeOSRepository';
import { ICampoCondicionalTipoAtividadeRepository } from '../../../infrastructure/repository/ICampoCondicionalTipoAtividadeRepository';
import { IMovimentoEstoqueRepository } from '../../../infrastructure/repository/IMovimentoEstoqueRepository';
import { IMaquinaRepository } from '../../../infrastructure/repository/IMaquinaRepository';
import { ITituloPagarRepository } from '../../../infrastructure/repository/ITituloPagarRepository';
import { OrdemServicoMapper } from '../../mappers/OrdemServicoMapper';
import { CreateOrdemServicoDto } from '../../dto/ordemServico/CreateOrdemServicoDto';
import { CreateOrdemServicoCompletoDto } from '../../dto/ordemServico/CreateOrdemServicoCompletoDto';
import { UpdateOrdemServicoCompletoDto } from '../../dto/ordemServico/UpdateOrdemServicoCompletoDto';
import { OrdemServicoResponseDto } from '../../dto/ordemServico/OrdemServicoResponseDto';
import { AtribuirOrdemServicoDto } from '../../dto/ordemServico/AtribuirOrdemServicoDto';
import { IniciarOrdemServicoDto } from '../../dto/ordemServico/IniciarOrdemServicoDto';
import { ConcluirOrdemServicoDto } from '../../dto/ordemServico/ConcluirOrdemServicoDto';
import { ValidarOrdemServicoDto } from '../../dto/ordemServico/ValidarOrdemServicoDto';
import { CancelarOrdemServicoDto } from '../../dto/ordemServico/CancelarOrdemServicoDto';
import { PaginatedResult } from '../../../core/repository/types';
import { NotFoundException, BusinessException, ForbiddenException } from '../../../core/exceptions';
import { Transactional } from '../../../core/unitofwork/Transactional';
import { RequirePermission } from '../../../core/authorization';
import { Auditable } from '../../../core/audit';
import { Cacheable, CacheEvict } from '../../../core/cache';
import { getRequestContext } from '../../../core/authorization/helpers';
import OrdemServico from '../../../models/OrdemServico';
import { StatusOrdemServico, FuncaoResponsavelOS } from '../../../models/enums/OrdemServicoEnums';
import { TipoMovimento, OperacaoEstoque } from '../../../models/enums/MovimentoEstoqueEnums';
import { Op, QueryTypes } from 'sequelize';
import sequelize from '../../../config/database';

/**
 * OrdemServicoApplicationService - Application Service para OrdemServico
 *
 * Implementa lógica de negócio para ordens de serviço agrícolas, incluindo:
 * - CRUD completo com padrão master-detail (talhões, insumos, máquinas, responsáveis)
 * - Workflow de status (PLANEJADA → ATRIBUIDA → EM_EXECUCAO → CONCLUIDA → VALIDADA)
 * - Cálculo automático de custo real e variâncias na conclusão
 * - KPIs para dashboard
 */
@Injectable()
export class OrdemServicoApplicationService implements IOrdemServicoApplicationService {
  private mapper: OrdemServicoMapper;

  constructor(
    @Inject(TYPES.IOrdemServicoRepository)
    private ordemServicoRepository: IOrdemServicoRepository,
    @Inject(TYPES.IOrdemServicoTalhaoRepository)
    private talhaoRepository: IOrdemServicoTalhaoRepository,
    @Inject(TYPES.IOrdemServicoInsumoRepository)
    private insumoRepository: IOrdemServicoInsumoRepository,
    @Inject(TYPES.IOrdemServicoMaquinaRepository)
    private maquinaRepository: IOrdemServicoMaquinaRepository,
    @Inject(TYPES.IOrdemServicoResponsavelRepository)
    private responsavelRepository: IOrdemServicoResponsavelRepository,
    @Inject(TYPES.ITipoAtividadeOSRepository)
    private tipoAtividadeOSRepository: ITipoAtividadeOSRepository,
    @Inject(TYPES.ICampoCondicionalTipoAtividadeRepository)
    private campoCondicionalRepository: ICampoCondicionalTipoAtividadeRepository,
    @Inject(TYPES.IMovimentoEstoqueRepository)
    private movimentoEstoqueRepository: IMovimentoEstoqueRepository,
    @Inject(TYPES.IMaquinaRepository)
    private maquinaRealRepository: IMaquinaRepository,
    @Inject(TYPES.ITituloPagarRepository)
    private tituloPagarRepository: ITituloPagarRepository
  ) {
    this.mapper = new OrdemServicoMapper();
  }

  // ---------------------------------------------------------------------------
  // CRUD Base
  // ---------------------------------------------------------------------------

  /**
   * Lista OS com paginação e filtros opcionais
   */
  @RequirePermission('ordemServico.read')
  @Cacheable('ordemServico:list:{0}:{1}', 120)
  async list(
    page: number = 1,
    limit: number = 10,
    filters?: OrdemServicoFilters
  ): Promise<PaginatedResult<OrdemServicoResponseDto>> {
    const where: any = {};

    if (filters?.status) where.status = filters.status;
    if (filters?.fazendaId) where.fazendaId = filters.fazendaId;
    if (filters?.tipoAtividadeOSId) where.tipoAtividadeOSId = filters.tipoAtividadeOSId;
    if (filters?.prioridade) where.prioridade = filters.prioridade;
    if (filters?.safraId) where.safraId = filters.safraId;

    if (filters?.dataPlanejadaInicio || filters?.dataPlanejadaFim) {
      where.dataPlanejadaInicio = {};
      if (filters.dataPlanejadaInicio) {
        where.dataPlanejadaInicio[Op.gte] = new Date(filters.dataPlanejadaInicio);
      }
      if (filters.dataPlanejadaFim) {
        where.dataPlanejadaInicio[Op.lte] = new Date(filters.dataPlanejadaFim);
      }
    }

    // T11.4 — Filtros de variância
    if (filters?.atrasadas) {
      where.dataPlanejadaFim = { [Op.lt]: new Date() };
      where.status = { [Op.in]: [
        StatusOrdemServico.PLANEJADA,
        StatusOrdemServico.ATRIBUIDA,
        StatusOrdemServico.EM_EXECUCAO,
      ]};
    }
    if (filters?.acimaOrcamento) {
      where.varianciaCustoPercent = { [Op.gt]: 0 };
    }
    if (filters?.varianciaMinima != null) {
      const minVal = Number(filters.varianciaMinima);
      where[Op.or as any] = [
        sequelize.where(
          sequelize.fn('ABS', sequelize.col('varianciaCustoPercent')),
          { [Op.gt]: minVal }
        ),
        sequelize.where(
          sequelize.fn('ABS', sequelize.col('varianciaAreaPercent')),
          { [Op.gt]: minVal }
        ),
      ];
    }

    const result = await this.ordemServicoRepository.findAllPaginated(page, limit, { where });
    return {
      ...result,
      data: result.data.map(entity => this.mapper.toDto(entity)),
    };
  }

  /**
   * Busca uma OS por ID (completa com todos os filhos)
   */
  @RequirePermission('ordemServico.read')
  async getById(id: number | string): Promise<OrdemServicoResponseDto | null> {
    const entity = await this.ordemServicoRepository.findByIdCompleto(Number(id));
    return entity ? this.mapper.toDto(entity) : null;
  }

  /**
   * Cria uma OS simples (sem filhos)
   */
  @RequirePermission('ordemServico.create')
  @Transactional()
  @Auditable('OrdemServico')
  @CacheEvict('ordemServico:list:*', true)
  async create(dto: CreateOrdemServicoDto): Promise<OrdemServicoResponseDto> {
    const context = getRequestContext();
    const tenantId = context?.getTenantId();
    const userId = context?.getUserId();

    if (!tenantId) {
      throw new ForbiddenException('Tenant não identificado.', 'TENANT_NOT_IDENTIFIED');
    }

    // Validar tipo de atividade
    await this.validarTipoAtividade(dto.tipoAtividadeOSId, tenantId);

    const numero = await this.ordemServicoRepository.getNextNumero(tenantId);
    const entityData = this.mapper.toEntity(dto) as any;
    entityData.tenantId = tenantId;
    entityData.usercreation = userId;
    entityData.numero = numero;
    entityData.status = StatusOrdemServico.PLANEJADA;
    entityData.criadoPorId = userId;

    const created = await this.ordemServicoRepository.create(entityData);
    const completo = await this.ordemServicoRepository.findByIdCompleto(created.id);
    return this.mapper.toDto(completo!);
  }

  /**
   * Atualiza uma OS (alias para updateCompleto sem filhos)
   */
  @RequirePermission('ordemServico.update')
  @Transactional()
  @Auditable('OrdemServico')
  @CacheEvict('ordemServico:list:*', true)
  async update(id: number | string, dto: UpdateOrdemServicoCompletoDto): Promise<OrdemServicoResponseDto> {
    return this.updateCompleto(Number(id), dto);
  }

  /**
   * Cria uma OS completa com todos os filhos em uma única transação atômica
   */
  @RequirePermission('ordemServico.create')
  @Transactional()
  @Auditable('OrdemServico')
  @CacheEvict('ordemServico:list:*', true)
  async createCompleto(dto: CreateOrdemServicoCompletoDto): Promise<OrdemServicoResponseDto> {
    const context = getRequestContext();
    const tenantId = context?.getTenantId();
    const userId = context?.getUserId();

    if (!tenantId) {
      throw new ForbiddenException('Tenant não identificado.', 'TENANT_NOT_IDENTIFIED');
    }

    // Validar tipo de atividade existe e pertence ao tenant
    await this.validarTipoAtividade(dto.tipoAtividadeOSId, tenantId);

    // Gerar número sequencial
    const numero = await this.ordemServicoRepository.getNextNumero(tenantId);

    // Calcular área planejada total a partir dos talhões
    let areaPlanejadaTotal: number | null = null;
    if (dto.talhoes && dto.talhoes.length > 0) {
      const soma = dto.talhoes.reduce((acc, t) => acc + (t.areaPlanejada ?? 0), 0);
      areaPlanejadaTotal = Math.round(soma * 100) / 100;
    }

    // Criar a OS
    const entityData = this.mapper.toEntity(dto) as any;
    entityData.tenantId = tenantId;
    entityData.usercreation = userId;
    entityData.numero = numero;
    entityData.status = StatusOrdemServico.PLANEJADA;
    entityData.criadoPorId = userId;
    if (areaPlanejadaTotal !== null) {
      entityData.areaPlanejadaTotal = areaPlanejadaTotal;
    }

    const createdOS = await this.ordemServicoRepository.create(entityData);
    const osId = createdOS.id;

    // Criar talhões
    if (dto.talhoes && dto.talhoes.length > 0) {
      for (const talhaoDto of dto.talhoes) {
        await this.talhaoRepository.create({
          ...talhaoDto,
          ordemServicoId: osId,
          tenantId,
          usercreation: userId,
        } as any);
      }
    }

    // Criar insumos
    if (dto.insumos && dto.insumos.length > 0) {
      for (const insumoDto of dto.insumos) {
        await this.insumoRepository.create({
          ...insumoDto,
          ordemServicoId: osId,
          tenantId,
          usercreation: userId,
        } as any);
      }
    }

    // Criar máquinas
    if (dto.maquinas && dto.maquinas.length > 0) {
      for (const maquinaDto of dto.maquinas) {
        await this.maquinaRepository.create({
          ...maquinaDto,
          ordemServicoId: osId,
          tenantId,
          usercreation: userId,
        } as any);
      }
    }

    // Criar responsáveis
    if (dto.responsaveis && dto.responsaveis.length > 0) {
      for (const responsavelDto of dto.responsaveis) {
        await this.responsavelRepository.create({
          ...responsavelDto,
          ordemServicoId: osId,
          tenantId,
          usercreation: userId,
        } as any);
      }
    }

    // Retornar OS completa com todos os filhos
    const completo = await this.ordemServicoRepository.findByIdCompleto(osId);
    return this.mapper.toDto(completo!);
  }

  /**
   * Atualiza uma OS completa (delete-and-recreate para filhos)
   * Válido apenas para status PLANEJADA ou ATRIBUIDA
   */
  @RequirePermission('ordemServico.update')
  @Transactional()
  @Auditable('OrdemServico')
  @CacheEvict('ordemServico:list:*', true)
  async updateCompleto(id: number, dto: UpdateOrdemServicoCompletoDto): Promise<OrdemServicoResponseDto> {
    const existing = await this.ordemServicoRepository.findById(id);
    if (!existing) {
      throw new NotFoundException('Ordem de serviço', id);
    }

    // Validar status permitido para edição
    if (
      existing.status !== StatusOrdemServico.PLANEJADA &&
      existing.status !== StatusOrdemServico.ATRIBUIDA
    ) {
      throw new BusinessException(
        `Não é possível editar uma OS com status "${existing.status}". Apenas OS nos status PLANEJADA ou ATRIBUIDA podem ser editadas.`,
        'OS_STATUS_INVALIDO_PARA_EDICAO'
      );
    }

    const context = getRequestContext();
    const tenantId = context?.getTenantId();
    const userId = context?.getUserId();

    // Atualizar campos da OS
    const entityData = this.mapper.toEntity(dto);
    await this.ordemServicoRepository.update(id, entityData as any);

    // Delete-and-recreate para talhões
    if (dto.talhoes !== undefined) {
      await this.talhaoRepository.deleteByOrdemServico(id);
      let areaPlanejadaTotal = 0;
      for (const talhaoDto of dto.talhoes) {
        await this.talhaoRepository.create({
          ...talhaoDto,
          ordemServicoId: id,
          tenantId,
          usercreation: userId,
        } as any);
        areaPlanejadaTotal += talhaoDto.areaPlanejada ?? 0;
      }
      // Recalcular área planejada total
      await this.ordemServicoRepository.update(id, {
        areaPlanejadaTotal: Math.round(areaPlanejadaTotal * 100) / 100,
      } as any);
    }

    // Delete-and-recreate para insumos
    if (dto.insumos !== undefined) {
      await this.insumoRepository.deleteByOrdemServico(id);
      for (const insumoDto of dto.insumos) {
        await this.insumoRepository.create({
          ...insumoDto,
          ordemServicoId: id,
          tenantId,
          usercreation: userId,
        } as any);
      }
    }

    // Delete-and-recreate para máquinas
    if (dto.maquinas !== undefined) {
      await this.maquinaRepository.deleteByOrdemServico(id);
      for (const maquinaDto of dto.maquinas) {
        await this.maquinaRepository.create({
          ...maquinaDto,
          ordemServicoId: id,
          tenantId,
          usercreation: userId,
        } as any);
      }
    }

    // Delete-and-recreate para responsáveis
    if (dto.responsaveis !== undefined) {
      await this.responsavelRepository.deleteByOrdemServico(id);
      for (const responsavelDto of dto.responsaveis) {
        await this.responsavelRepository.create({
          ...responsavelDto,
          ordemServicoId: id,
          tenantId,
          usercreation: userId,
        } as any);
      }
    }

    const completo = await this.ordemServicoRepository.findByIdCompleto(id);
    return this.mapper.toDto(completo!);
  }

  /**
   * Remove uma OS
   * Válido apenas para status PLANEJADA (filhos removidos por CASCADE)
   */
  @RequirePermission('ordemServico.delete')
  @CacheEvict('ordemServico:list:*', true)
  async delete(id: number | string): Promise<boolean> {
    const existing = await this.ordemServicoRepository.findById(id);
    if (!existing) {
      return false;
    }

    if (existing.status !== StatusOrdemServico.PLANEJADA) {
      throw new BusinessException(
        `Não é possível excluir uma OS com status "${existing.status}". Somente OS com status PLANEJADA podem ser excluídas.`,
        'OS_STATUS_INVALIDO_PARA_EXCLUSAO'
      );
    }

    return this.ordemServicoRepository.delete(id);
  }

  // ---------------------------------------------------------------------------
  // Workflow de Status
  // ---------------------------------------------------------------------------

  /**
   * Atribui responsáveis à OS e muda status para ATRIBUIDA
   * Requer ao menos 1 responsável com funcao=RESPONSAVEL
   */
  @RequirePermission('ordemServico.atribuir')
  @Transactional()
  @Auditable('OrdemServico')
  @CacheEvict('ordemServico:list:*', true)
  async atribuir(id: number, dto: AtribuirOrdemServicoDto): Promise<OrdemServicoResponseDto> {
    const existing = await this.ordemServicoRepository.findById(id);
    if (!existing) {
      throw new NotFoundException('Ordem de serviço', id);
    }

    if (existing.status !== StatusOrdemServico.PLANEJADA) {
      throw new BusinessException(
        `Não é possível atribuir uma OS com status "${existing.status}". A OS precisa estar no status PLANEJADA.`,
        'OS_STATUS_INVALIDO_PARA_ATRIBUICAO'
      );
    }

    const context = getRequestContext();
    const tenantId = context?.getTenantId();
    const userId = context?.getUserId();

    // Se foram fornecidos novos responsáveis, substituir os existentes
    if (dto.responsaveis && dto.responsaveis.length > 0) {
      await this.responsavelRepository.deleteByOrdemServico(id);
      for (const responsavelDto of dto.responsaveis) {
        await this.responsavelRepository.create({
          ...responsavelDto,
          ordemServicoId: id,
          tenantId,
          usercreation: userId,
        } as any);
      }
    }

    // Verificar que existe ao menos 1 responsável com funcao=RESPONSAVEL
    const responsaveis = await this.responsavelRepository.findByOrdemServico(id);
    const temResponsavel = responsaveis.some(
      (r: any) => r.funcao === FuncaoResponsavelOS.RESPONSAVEL
    );

    if (!temResponsavel) {
      throw new BusinessException(
        'É necessário ao menos um responsável com a função RESPONSAVEL para atribuir a OS.',
        'OS_SEM_RESPONSAVEL_PRINCIPAL'
      );
    }

    // Mudar status para ATRIBUIDA
    await this.ordemServicoRepository.update(id, {
      status: StatusOrdemServico.ATRIBUIDA,
      atribuidoPorId: userId,
    } as any);

    const completo = await this.ordemServicoRepository.findByIdCompleto(id);
    return this.mapper.toDto(completo!);
  }

  /**
   * Inicia a execução de uma OS e muda status para EM_EXECUCAO
   * Requer que haja ao menos 1 talhão vinculado
   */
  @RequirePermission('ordemServico.iniciar')
  @Transactional()
  @Auditable('OrdemServico')
  @CacheEvict('ordemServico:list:*', true)
  async iniciar(id: number, dto: IniciarOrdemServicoDto): Promise<OrdemServicoResponseDto> {
    const existing = await this.ordemServicoRepository.findById(id);
    if (!existing) {
      throw new NotFoundException('Ordem de serviço', id);
    }

    if (existing.status !== StatusOrdemServico.ATRIBUIDA) {
      throw new BusinessException(
        `Não é possível iniciar uma OS com status "${existing.status}". A OS precisa estar no status ATRIBUIDA.`,
        'OS_STATUS_INVALIDO_PARA_INICIO'
      );
    }

    // Verificar que há ao menos 1 talhão vinculado
    const talhoes = await this.talhaoRepository.findByOrdemServico(id);
    if (talhoes.length === 0) {
      throw new BusinessException(
        'A OS precisa ter ao menos um talhão vinculado para ser iniciada.',
        'OS_SEM_TALHAO_VINCULADO'
      );
    }

    const context = getRequestContext();
    const userId = context?.getUserId();

    const dataInicioReal = dto.dataInicioReal ? new Date(dto.dataInicioReal) : new Date();

    await this.ordemServicoRepository.update(id, {
      status: StatusOrdemServico.EM_EXECUCAO,
      dataInicioReal,
      iniciadoPorId: userId,
    } as any);

    const completo = await this.ordemServicoRepository.findByIdCompleto(id);
    return this.mapper.toDto(completo!);
  }

  /**
   * Conclui uma OS e muda status para CONCLUIDA
   * Calcula custo real e variâncias automaticamente
   */
  @RequirePermission('ordemServico.concluir')
  @Transactional()
  @Auditable('OrdemServico')
  @CacheEvict('ordemServico:list:*', true)
  async concluir(id: number, dto: ConcluirOrdemServicoDto): Promise<OrdemServicoResponseDto> {
    const existing = await this.ordemServicoRepository.findById(id);
    if (!existing) {
      throw new NotFoundException('Ordem de serviço', id);
    }

    if (existing.status !== StatusOrdemServico.EM_EXECUCAO) {
      throw new BusinessException(
        `Não é possível concluir uma OS com status "${existing.status}". A OS precisa estar no status EM_EXECUCAO.`,
        'OS_STATUS_INVALIDO_PARA_CONCLUSAO'
      );
    }

    const context = getRequestContext();
    const tenantId = context?.getTenantId();
    const userId = context?.getUserId();

    // Atualizar filhos com dados reais (delete-and-recreate)
    if (dto.talhoes !== undefined) {
      await this.talhaoRepository.deleteByOrdemServico(id);
      for (const talhaoDto of dto.talhoes) {
        await this.talhaoRepository.create({
          ...talhaoDto,
          ordemServicoId: id,
          tenantId,
          usercreation: userId,
        } as any);
      }
    }

    if (dto.insumos !== undefined) {
      await this.insumoRepository.deleteByOrdemServico(id);
      for (const insumoDto of dto.insumos) {
        await this.insumoRepository.create({
          ...insumoDto,
          ordemServicoId: id,
          tenantId,
          usercreation: userId,
        } as any);
      }
    }

    if (dto.maquinas !== undefined) {
      await this.maquinaRepository.deleteByOrdemServico(id);
      for (const maquinaDto of dto.maquinas) {
        await this.maquinaRepository.create({
          ...maquinaDto,
          ordemServicoId: id,
          tenantId,
          usercreation: userId,
        } as any);
      }
    }

    if (dto.responsaveis !== undefined) {
      await this.responsavelRepository.deleteByOrdemServico(id);
      for (const responsavelDto of dto.responsaveis) {
        await this.responsavelRepository.create({
          ...responsavelDto,
          ordemServicoId: id,
          tenantId,
          usercreation: userId,
        } as any);
      }
    }

    // Calcular custo real e área real total
    const { custoReal, areaRealTotal } = await this.calcularCustoReal(id);

    // Calcular variâncias
    const osAtualizada = await this.ordemServicoRepository.findById(id);
    const variancia = this.calcularVariancia({
      ...osAtualizada!,
      areaRealTotal,
      custoReal,
    } as any, dto.dataFimReal);

    await this.ordemServicoRepository.update(id, {
      status: StatusOrdemServico.CONCLUIDA,
      dataFimReal: new Date(dto.dataFimReal),
      custoReal,
      areaRealTotal,
      varianciaAreaPercent: variancia.varianciaAreaPercent,
      varianciaCustoPercent: variancia.varianciaCustoPercent,
      varianciaDias: variancia.varianciaDias,
      concluidoPorId: userId,
      observacoesConclusao: dto.observacoesConclusao ?? null,
    } as any);

    // Rateio de custo por talhão
    await this.calcularRateioCustoTalhoes(id, custoReal);

    // Baixar estoque dos insumos consumidos
    await this.baixarEstoque(id, existing.fazendaId, tenantId!, userId!);

    // Atualizar horímetro das máquinas
    await this.atualizarHorimetroMaquinas(id, tenantId!);

    const completo = await this.ordemServicoRepository.findByIdCompleto(id);
    return this.mapper.toDto(completo!);
  }

  /**
   * Valida uma OS concluída e muda status para VALIDADA
   */
  @RequirePermission('ordemServico.validar')
  @Transactional()
  @Auditable('OrdemServico')
  @CacheEvict('ordemServico:list:*', true)
  async validar(id: number, dto: ValidarOrdemServicoDto): Promise<OrdemServicoResponseDto> {
    const existing = await this.ordemServicoRepository.findById(id);
    if (!existing) {
      throw new NotFoundException('Ordem de serviço', id);
    }

    if (existing.status !== StatusOrdemServico.CONCLUIDA) {
      throw new BusinessException(
        `Não é possível validar uma OS com status "${existing.status}". A OS precisa estar no status CONCLUIDA.`,
        'OS_STATUS_INVALIDO_PARA_VALIDACAO'
      );
    }

    const context = getRequestContext();
    const tenantId = context?.getTenantId();
    const userId = context?.getUserId();

    // Gerar títulos a pagar para mão de obra (idempotente)
    const osCompleta = await this.ordemServicoRepository.findByIdCompleto(id);
    await this.gerarTitulosPagar(osCompleta!, tenantId!, userId!);

    await this.ordemServicoRepository.update(id, {
      status: StatusOrdemServico.VALIDADA,
      validadoPorId: userId,
      dataValidacao: new Date(),
    } as any);

    const completo = await this.ordemServicoRepository.findByIdCompleto(id);
    return this.mapper.toDto(completo!);
  }

  /**
   * Cancela uma OS (qualquer status exceto VALIDADA e CANCELADA)
   */
  @RequirePermission('ordemServico.cancelar')
  @Transactional()
  @Auditable('OrdemServico')
  @CacheEvict('ordemServico:list:*', true)
  async cancelar(id: number, dto: CancelarOrdemServicoDto): Promise<OrdemServicoResponseDto> {
    const existing = await this.ordemServicoRepository.findById(id);
    if (!existing) {
      throw new NotFoundException('Ordem de serviço', id);
    }

    if (
      existing.status === StatusOrdemServico.VALIDADA ||
      existing.status === StatusOrdemServico.CANCELADA
    ) {
      throw new BusinessException(
        `Não é possível cancelar uma OS com status "${existing.status}".`,
        'OS_STATUS_INVALIDO_PARA_CANCELAMENTO'
      );
    }

    const context = getRequestContext();
    const tenantId = context?.getTenantId();
    const userId = context?.getUserId();

    // Reverter baixa de estoque se já foi processado
    if (existing.estoqueProcessado) {
      await this.reverterBaixaEstoque(id, existing.fazendaId, tenantId!, userId!);
    }

    await this.ordemServicoRepository.update(id, {
      status: StatusOrdemServico.CANCELADA,
      motivoCancelamento: dto.motivoCancelamento,
      canceladoPorId: userId,
    } as any);

    const completo = await this.ordemServicoRepository.findByIdCompleto(id);
    return this.mapper.toDto(completo!);
  }

  /**
   * Reabre uma OS concluída, voltando para EM_EXECUCAO e limpando dados de conclusão
   */
  @RequirePermission('ordemServico.update')
  @Transactional()
  @Auditable('OrdemServico')
  @CacheEvict('ordemServico:list:*', true)
  async reabrir(id: number): Promise<OrdemServicoResponseDto> {
    const existing = await this.ordemServicoRepository.findById(id);
    if (!existing) {
      throw new NotFoundException('Ordem de serviço', id);
    }

    if (existing.status !== StatusOrdemServico.CONCLUIDA) {
      throw new BusinessException(
        `Não é possível reabrir uma OS com status "${existing.status}". Somente OS com status CONCLUIDA podem ser reabertas.`,
        'OS_STATUS_INVALIDO_PARA_REABERTURA'
      );
    }

    const context = getRequestContext();
    const tenantId = context?.getTenantId();
    const userId = context?.getUserId();

    // Reverter baixa de estoque se já foi processado
    if (existing.estoqueProcessado) {
      await this.reverterBaixaEstoque(id, existing.fazendaId, tenantId!, userId!);
    }

    await this.ordemServicoRepository.update(id, {
      status: StatusOrdemServico.EM_EXECUCAO,
      dataFimReal: null,
      varianciaAreaPercent: null,
      varianciaCustoPercent: null,
      varianciaDias: null,
      custoReal: null,
      areaRealTotal: null,
      concluidoPorId: null,
      observacoesConclusao: null,
    } as any);

    const completo = await this.ordemServicoRepository.findByIdCompleto(id);
    return this.mapper.toDto(completo!);
  }

  // ---------------------------------------------------------------------------
  // KPIs
  // ---------------------------------------------------------------------------

  /**
   * Retorna KPIs consolidados das ordens de serviço
   */
  @RequirePermission('ordemServico.dashboard')
  async getKpis(filters?: OrdemServicoKpiFilters): Promise<OrdemServicoKpis> {
    const tenantId = getRequestContext()?.getTenantId();
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);

    const baseWhere: any = { tenantId };
    if (filters?.fazendaId) baseWhere.fazendaId = filters.fazendaId;
    if (filters?.safraId) baseWhere.safraId = filters.safraId;
    if (filters?.dataInicio || filters?.dataFim) {
      baseWhere.createdAt = {};
      if (filters.dataInicio) baseWhere.createdAt[Op.gte] = new Date(filters.dataInicio);
      if (filters.dataFim) baseWhere.createdAt[Op.lte] = new Date(filters.dataFim);
    }

    const model = (this.ordemServicoRepository as any).model;

    // Contagem por status
    const statusValues = [
      StatusOrdemServico.PLANEJADA,
      StatusOrdemServico.ATRIBUIDA,
      StatusOrdemServico.EM_EXECUCAO,
      StatusOrdemServico.CONCLUIDA,
      StatusOrdemServico.VALIDADA,
      StatusOrdemServico.CANCELADA,
    ];

    const totalPorStatus: any = {
      PLANEJADA: 0,
      ATRIBUIDA: 0,
      EM_EXECUCAO: 0,
      CONCLUIDA: 0,
      VALIDADA: 0,
      CANCELADA: 0,
    };

    for (const status of statusValues) {
      const count = await model.count({ where: { ...baseWhere, status } });
      totalPorStatus[status] = count;
    }

    // Total atrasadas: dataPlanejadaFim < hoje E status ativo
    const statusAtivos = [
      StatusOrdemServico.PLANEJADA,
      StatusOrdemServico.ATRIBUIDA,
      StatusOrdemServico.EM_EXECUCAO,
    ];
    const totalAtrasadas = await model.count({
      where: {
        ...baseWhere,
        dataPlanejadaFim: { [Op.lt]: hoje },
        status: { [Op.in]: statusAtivos },
      },
    });

    // Custo total real e estimado
    const { fn, col } = require('sequelize');
    const totalOS = await model.count({ where: baseWhere });

    const aggregados = await model.findOne({
      where: baseWhere,
      attributes: [
        [fn('SUM', col('custoReal')), 'custoTotalReal'],
        [fn('SUM', col('custoEstimado')), 'custoTotalEstimado'],
      ],
      raw: true,
    });

    const custoTotalReal = Math.round((Number(aggregados?.custoTotalReal) || 0) * 100) / 100;
    const custoTotalEstimado = Math.round((Number(aggregados?.custoTotalEstimado) || 0) * 100) / 100;

    return {
      totalPorStatus,
      totalAtrasadas,
      custoTotalReal,
      custoTotalEstimado,
      totalOS,
    };
  }

  // ---------------------------------------------------------------------------
  // Endpoints de Consulta (Fase 2B)
  // ---------------------------------------------------------------------------

  /**
   * T9.1 — Custeio por talhão/safra agregando dados de OS concluídas/validadas
   */
  @RequirePermission('ordemServico.read')
  async getCusteio(
    filters: { talhaoId?: number; safraId?: number; fazendaId?: number; dataInicio?: string; dataFim?: string },
    tenantId: number
  ): Promise<any[]> {
    let whereClause = `WHERE os.tenantId = :tenantId AND os.status IN ('CONCLUIDA', 'VALIDADA')`;
    const replacements: any = { tenantId };

    if (filters.talhaoId) {
      whereClause += ` AND ost.talhaoId = :talhaoId`;
      replacements.talhaoId = filters.talhaoId;
    }
    if (filters.safraId) {
      whereClause += ` AND os.safraId = :safraId`;
      replacements.safraId = filters.safraId;
    }
    if (filters.fazendaId) {
      whereClause += ` AND os.fazendaId = :fazendaId`;
      replacements.fazendaId = filters.fazendaId;
    }
    if (filters.dataInicio) {
      whereClause += ` AND os.dataPlanejadaInicio >= :dataInicio`;
      replacements.dataInicio = filters.dataInicio;
    }
    if (filters.dataFim) {
      whereClause += ` AND os.dataPlanejadaInicio <= :dataFim`;
      replacements.dataFim = filters.dataFim;
    }

    const query = `
      SELECT
        ost.talhaoId,
        t.descricao AS talhaoDescricao,
        os.safraId,
        s.nome AS safraNome,
        COUNT(DISTINCT os.id) AS totalOS,
        ROUND(COALESCE(SUM(os.custoReal), 0), 2) AS custoRealTotal,
        ROUND(COALESCE(SUM(os.custoEstimado), 0), 2) AS custoEstimadoTotal,
        CASE
          WHEN SUM(os.custoEstimado) > 0
          THEN ROUND(((SUM(os.custoReal) - SUM(os.custoEstimado)) / SUM(os.custoEstimado)) * 100, 2)
          ELSE NULL
        END AS varianciaCustoPercent,
        ROUND(COALESCE(SUM(ost.areaReal), SUM(ost.areaPlanejada), 0), 4) AS areaTotal,
        CASE
          WHEN COALESCE(SUM(ost.areaReal), SUM(ost.areaPlanejada), 0) > 0
          THEN ROUND(COALESCE(SUM(os.custoReal), 0) / COALESCE(SUM(ost.areaReal), SUM(ost.areaPlanejada), 1), 2)
          ELSE 0
        END AS custoPorHa
      FROM C069_ordemServicoTalhao ost
      INNER JOIN C068_ordemServico os ON os.id = ost.ordemServicoId
      LEFT JOIN C034_talhao t ON t.id_talhao = ost.talhaoId
      LEFT JOIN C017_safra s ON s.id = os.safraId
      ${whereClause}
      GROUP BY ost.talhaoId, t.descricao, os.safraId, s.nome
      ORDER BY ost.talhaoId, os.safraId
    `;

    const results = await sequelize.query(query, {
      replacements,
      type: QueryTypes.SELECT,
    });

    return results.map((row: any) => ({
      talhaoId: row.talhaoId,
      talhaoDescricao: row.talhaoDescricao,
      safraId: row.safraId,
      safraNome: row.safraNome,
      totalOS: Number(row.totalOS),
      custoRealTotal: Number(row.custoRealTotal),
      custoEstimadoTotal: Number(row.custoEstimadoTotal),
      varianciaCustoPercent: row.varianciaCustoPercent != null ? Number(row.varianciaCustoPercent) : null,
      areaTotal: Number(row.areaTotal),
      custoPorHa: Number(row.custoPorHa),
    }));
  }

  /**
   * T9.2 — Resumo de custeio agrupado por safra
   */
  @RequirePermission('ordemServico.read')
  async getCusteioResumo(
    filters: { safraId?: number; fazendaId?: number; dataInicio?: string; dataFim?: string },
    tenantId: number
  ): Promise<any[]> {
    let whereClause = `WHERE os.tenantId = :tenantId AND os.status IN ('CONCLUIDA', 'VALIDADA')`;
    const replacements: any = { tenantId };

    if (filters.safraId) {
      whereClause += ` AND os.safraId = :safraId`;
      replacements.safraId = filters.safraId;
    }
    if (filters.fazendaId) {
      whereClause += ` AND os.fazendaId = :fazendaId`;
      replacements.fazendaId = filters.fazendaId;
    }
    if (filters.dataInicio) {
      whereClause += ` AND os.dataPlanejadaInicio >= :dataInicio`;
      replacements.dataInicio = filters.dataInicio;
    }
    if (filters.dataFim) {
      whereClause += ` AND os.dataPlanejadaInicio <= :dataFim`;
      replacements.dataFim = filters.dataFim;
    }

    const query = `
      SELECT
        os.safraId,
        s.nome AS safraNome,
        COUNT(DISTINCT ost.talhaoId) AS totalTalhoes,
        ROUND(COALESCE(SUM(os.custoReal), 0), 2) AS custoTotal,
        CASE
          WHEN COALESCE(SUM(ost.areaReal), SUM(ost.areaPlanejada), 0) > 0
          THEN ROUND(COALESCE(SUM(os.custoReal), 0) / COALESCE(SUM(ost.areaReal), SUM(ost.areaPlanejada), 1), 2)
          ELSE 0
        END AS custoMedioHa,
        ROUND(COALESCE(SUM(ost.areaReal), SUM(ost.areaPlanejada), 0), 4) AS areaTotal
      FROM C068_ordemServico os
      LEFT JOIN C069_ordemServicoTalhao ost ON ost.ordemServicoId = os.id
      LEFT JOIN C017_safra s ON s.id = os.safraId
      ${whereClause}
      GROUP BY os.safraId, s.nome
      ORDER BY os.safraId
    `;

    const results = await sequelize.query(query, {
      replacements,
      type: QueryTypes.SELECT,
    });

    return results.map((row: any) => ({
      safraId: row.safraId,
      safraNome: row.safraNome,
      totalTalhoes: Number(row.totalTalhoes),
      custoTotal: Number(row.custoTotal),
      custoMedioHa: Number(row.custoMedioHa),
      areaTotal: Number(row.areaTotal),
    }));
  }

  /**
   * T10.1 — Timeline de OS por dia (máx 28 dias)
   */
  @RequirePermission('ordemServico.dashboard')
  async getTimeline(
    filters: { fazendaId?: number; safraId?: number; dataInicio: string; dataFim: string },
    tenantId: number
  ): Promise<any[]> {
    const inicio = new Date(filters.dataInicio);
    const fim = new Date(filters.dataFim);
    const diffDias = Math.ceil((fim.getTime() - inicio.getTime()) / (1000 * 60 * 60 * 24));

    if (diffDias > 28) {
      throw new BusinessException(
        'O período máximo para timeline é de 28 dias.',
        'TIMELINE_PERIODO_MAXIMO'
      );
    }

    let whereClause = `WHERE os.tenantId = :tenantId
      AND COALESCE(os.dataInicioReal, os.dataPlanejadaInicio) >= :dataInicio
      AND COALESCE(os.dataInicioReal, os.dataPlanejadaInicio) <= :dataFim`;
    const replacements: any = { tenantId, dataInicio: filters.dataInicio, dataFim: filters.dataFim };

    if (filters.fazendaId) {
      whereClause += ` AND os.fazendaId = :fazendaId`;
      replacements.fazendaId = filters.fazendaId;
    }
    if (filters.safraId) {
      whereClause += ` AND os.safraId = :safraId`;
      replacements.safraId = filters.safraId;
    }

    const query = `
      SELECT
        DATE(COALESCE(os.dataInicioReal, os.dataPlanejadaInicio)) AS data,
        os.status,
        COUNT(*) AS total
      FROM C068_ordemServico os
      ${whereClause}
      GROUP BY DATE(COALESCE(os.dataInicioReal, os.dataPlanejadaInicio)), os.status
      ORDER BY data, os.status
    `;

    const results: any[] = await sequelize.query(query, {
      replacements,
      type: QueryTypes.SELECT,
    });

    // Agrupar por data
    const mapaTimeline = new Map<string, { totalPorStatus: Record<string, number>; totalOS: number }>();

    for (const row of results) {
      const dataStr = String(row.data);
      if (!mapaTimeline.has(dataStr)) {
        mapaTimeline.set(dataStr, { totalPorStatus: {}, totalOS: 0 });
      }
      const entry = mapaTimeline.get(dataStr)!;
      entry.totalPorStatus[row.status] = Number(row.total);
      entry.totalOS += Number(row.total);
    }

    return Array.from(mapaTimeline.entries()).map(([data, val]) => ({
      data,
      totalPorStatus: val.totalPorStatus,
      totalOS: val.totalOS,
    }));
  }

  /**
   * T10.2 — Mapa de calor por talhão com agregações de OS
   */
  @RequirePermission('ordemServico.dashboard')
  async getMapaCalor(
    filters: { fazendaId?: number; safraId?: number; status?: string; dataInicio?: string; dataFim?: string },
    tenantId: number
  ): Promise<any[]> {
    let whereClause = `WHERE os.tenantId = :tenantId`;
    const replacements: any = { tenantId };

    if (filters.fazendaId) {
      whereClause += ` AND os.fazendaId = :fazendaId`;
      replacements.fazendaId = filters.fazendaId;
    }
    if (filters.safraId) {
      whereClause += ` AND os.safraId = :safraId`;
      replacements.safraId = filters.safraId;
    }
    if (filters.status) {
      whereClause += ` AND os.status = :status`;
      replacements.status = filters.status;
    }
    if (filters.dataInicio) {
      whereClause += ` AND os.dataPlanejadaInicio >= :dataInicio`;
      replacements.dataInicio = filters.dataInicio;
    }
    if (filters.dataFim) {
      whereClause += ` AND os.dataPlanejadaInicio <= :dataFim`;
      replacements.dataFim = filters.dataFim;
    }

    const query = `
      SELECT
        ost.talhaoId,
        t.descricao AS talhaoDescricao,
        COUNT(DISTINCT os.id) AS totalOS,
        SUM(CASE WHEN os.status = 'CONCLUIDA' THEN 1 ELSE 0 END) AS totalConcluidas,
        SUM(CASE WHEN os.status = 'EM_EXECUCAO' THEN 1 ELSE 0 END) AS totalEmExecucao,
        ROUND(COALESCE(SUM(os.custoReal), 0), 2) AS custoTotal,
        ROUND(COALESCE(SUM(ost.areaReal), SUM(ost.areaPlanejada), 0), 4) AS areaTotal
      FROM C069_ordemServicoTalhao ost
      INNER JOIN C068_ordemServico os ON os.id = ost.ordemServicoId
      LEFT JOIN C034_talhao t ON t.id_talhao = ost.talhaoId
      ${whereClause}
      GROUP BY ost.talhaoId, t.descricao
      ORDER BY totalOS DESC
    `;

    const results = await sequelize.query(query, {
      replacements,
      type: QueryTypes.SELECT,
    });

    return results.map((row: any) => ({
      talhaoId: row.talhaoId,
      talhaoDescricao: row.talhaoDescricao,
      totalOS: Number(row.totalOS),
      totalConcluidas: Number(row.totalConcluidas),
      totalEmExecucao: Number(row.totalEmExecucao),
      custoTotal: Number(row.custoTotal),
      areaTotal: Number(row.areaTotal),
    }));
  }

  /**
   * T12.1 — Carga de trabalho dos responsáveis na semana
   */
  @RequirePermission('ordemServico.dashboard')
  async getCargaTrabalho(
    filters: { semana?: string; fazendaId?: number },
    tenantId: number
  ): Promise<any[]> {
    // Se semana não especificada, usar semana corrente (segunda a domingo)
    let inicioSemana: string;
    let fimSemana: string;

    if (filters.semana) {
      // semana no formato YYYY-MM-DD (segunda-feira da semana)
      const seg = new Date(filters.semana);
      inicioSemana = seg.toISOString().split('T')[0];
      const dom = new Date(seg);
      dom.setDate(dom.getDate() + 6);
      fimSemana = dom.toISOString().split('T')[0];
    } else {
      const hoje = new Date();
      const diaSemana = hoje.getDay(); // 0=dom, 1=seg...
      const diffSeg = diaSemana === 0 ? -6 : 1 - diaSemana;
      const seg = new Date(hoje);
      seg.setDate(hoje.getDate() + diffSeg);
      inicioSemana = seg.toISOString().split('T')[0];
      const dom = new Date(seg);
      dom.setDate(dom.getDate() + 6);
      fimSemana = dom.toISOString().split('T')[0];
    }

    let whereClause = `WHERE os.tenantId = :tenantId
      AND COALESCE(os.dataPlanejadaInicio, os.dataInicioReal) <= :fimSemana
      AND COALESCE(os.dataPlanejadaFim, os.dataFimReal, :fimSemana) >= :inicioSemana`;
    const replacements: any = { tenantId, inicioSemana, fimSemana };

    if (filters.fazendaId) {
      whereClause += ` AND os.fazendaId = :fazendaId`;
      replacements.fazendaId = filters.fazendaId;
    }

    const query = `
      SELECT
        osr.pessoaId,
        p.nomerazao_pessoa AS nomerazaoPessoa,
        COUNT(DISTINCT os.id) AS totalOSSemana,
        ROUND(COALESCE(SUM(osr.horasPlanejadas), 0), 2) AS horasPlanejadas,
        ROUND(COALESCE(SUM(osr.horasReais), 0), 2) AS horasReais,
        SUM(CASE WHEN os.status IN ('PLANEJADA', 'ATRIBUIDA', 'EM_EXECUCAO') THEN 1 ELSE 0 END) AS osAtivas
      FROM C072_ordemServicoResponsavel osr
      INNER JOIN C068_ordemServico os ON os.id = osr.ordemServicoId
      LEFT JOIN C001_PESSOA p ON p.id_pessoa = osr.pessoaId
      ${whereClause}
      GROUP BY osr.pessoaId, p.nomerazao_pessoa
      ORDER BY totalOSSemana DESC
    `;

    const results = await sequelize.query(query, {
      replacements,
      type: QueryTypes.SELECT,
    });

    return results.map((row: any) => ({
      pessoaId: row.pessoaId,
      nomerazaoPessoa: row.nomerazaoPessoa,
      totalOSSemana: Number(row.totalOSSemana),
      horasPlanejadas: Number(row.horasPlanejadas),
      horasReais: Number(row.horasReais),
      osAtivas: Number(row.osAtivas),
    }));
  }

  /**
   * T12.2 — Histórico de execução de um responsável
   */
  @RequirePermission('ordemServico.dashboard')
  async getHistoricoExecucao(
    pessoaId: number,
    filters: { tipoAtividadeOSId?: number; dataInicio?: string; dataFim?: string },
    tenantId: number
  ): Promise<any> {
    let whereClause = `WHERE os.tenantId = :tenantId AND osr.pessoaId = :pessoaId`;
    const replacements: any = { tenantId, pessoaId };

    if (filters.tipoAtividadeOSId) {
      whereClause += ` AND os.tipoAtividadeOSId = :tipoAtividadeOSId`;
      replacements.tipoAtividadeOSId = filters.tipoAtividadeOSId;
    }
    if (filters.dataInicio) {
      whereClause += ` AND os.dataPlanejadaInicio >= :dataInicio`;
      replacements.dataInicio = filters.dataInicio;
    }
    if (filters.dataFim) {
      whereClause += ` AND os.dataPlanejadaInicio <= :dataFim`;
      replacements.dataFim = filters.dataFim;
    }

    // Totais gerais
    const queryTotais = `
      SELECT
        COUNT(DISTINCT os.id) AS totalOS,
        SUM(CASE WHEN os.status = 'CONCLUIDA' THEN 1 ELSE 0 END) AS totalConcluidas,
        SUM(CASE WHEN os.status = 'VALIDADA' THEN 1 ELSE 0 END) AS totalValidadas,
        CASE
          WHEN COUNT(DISTINCT os.id) > 0
          THEN ROUND(COALESCE(SUM(osr.horasReais), 0) / COUNT(DISTINCT os.id), 2)
          ELSE 0
        END AS mediaHorasPorOS
      FROM C072_ordemServicoResponsavel osr
      INNER JOIN C068_ordemServico os ON os.id = osr.ordemServicoId
      ${whereClause}
    `;

    const [totais]: any[] = await sequelize.query(queryTotais, {
      replacements,
      type: QueryTypes.SELECT,
    });

    // Tipos de atividade executados
    const queryTipos = `
      SELECT
        os.tipoAtividadeOSId AS tipoId,
        ta.nome AS tipoNome,
        COUNT(DISTINCT os.id) AS count
      FROM C072_ordemServicoResponsavel osr
      INNER JOIN C068_ordemServico os ON os.id = osr.ordemServicoId
      LEFT JOIN C066_tipoAtividadeOS ta ON ta.id = os.tipoAtividadeOSId
      ${whereClause}
      GROUP BY os.tipoAtividadeOSId, ta.descricao
      ORDER BY count DESC
    `;

    const tipos = await sequelize.query(queryTipos, {
      replacements,
      type: QueryTypes.SELECT,
    });

    return {
      pessoaId,
      totalOS: Number(totais?.totalOS) || 0,
      totalConcluidas: Number(totais?.totalConcluidas) || 0,
      totalValidadas: Number(totais?.totalValidadas) || 0,
      mediaHorasPorOS: Number(totais?.mediaHorasPorOS) || 0,
      tiposAtividadeExecutados: tipos.map((row: any) => ({
        tipoId: row.tipoId,
        tipoNome: row.tipoNome,
        count: Number(row.count),
      })),
    };
  }

  // ---------------------------------------------------------------------------
  // Analytics (Sprint 7 OS)
  // ---------------------------------------------------------------------------

  /**
   * T13.1 — Produtividade por operador/responsável
   * Agrega dados de OS concluídas/validadas por responsável
   */
  @RequirePermission('ordemServico.analytics')
  async getProdutividadeOperador(
    filters: { fazendaId?: number; safraId?: number; dataInicio?: string; dataFim?: string; tipoAtividadeOSId?: number },
    tenantId: number
  ): Promise<any[]> {
    let whereClause = `WHERE os.tenantId = :tenantId AND os.status IN ('CONCLUIDA', 'VALIDADA')`;
    const replacements: any = { tenantId };

    if (filters.fazendaId) {
      whereClause += ` AND os.fazendaId = :fazendaId`;
      replacements.fazendaId = filters.fazendaId;
    }
    if (filters.safraId) {
      whereClause += ` AND os.safraId = :safraId`;
      replacements.safraId = filters.safraId;
    }
    if (filters.dataInicio) {
      whereClause += ` AND COALESCE(os.dataInicioReal, os.dataPlanejadaInicio) >= :dataInicio`;
      replacements.dataInicio = filters.dataInicio;
    }
    if (filters.dataFim) {
      whereClause += ` AND COALESCE(os.dataInicioReal, os.dataPlanejadaInicio) <= :dataFim`;
      replacements.dataFim = filters.dataFim;
    }
    if (filters.tipoAtividadeOSId) {
      whereClause += ` AND os.tipoAtividadeOSId = :tipoAtividadeOSId`;
      replacements.tipoAtividadeOSId = filters.tipoAtividadeOSId;
    }

    const query = `
      SELECT
        osr.pessoaId,
        p.nomerazao_pessoa AS nomerazaoPessoa,
        COUNT(DISTINCT os.id) AS totalOS,
        SUM(CASE WHEN os.status IN ('CONCLUIDA','VALIDADA') THEN 1 ELSE 0 END) AS totalConcluidas,
        ROUND(COALESCE(SUM(osr.horasReais), 0), 2) AS horasReaisTotal,
        ROUND(COALESCE(SUM(os.areaRealTotal), 0), 4) AS areaTrabalhadaTotal,
        ROUND(COALESCE(SUM(osr.horasReais * osr.custoHoraReal), 0), 2) AS custoTotal
      FROM C072_ordemServicoResponsavel osr
      INNER JOIN C068_ordemServico os ON os.id = osr.ordemServicoId
      LEFT JOIN C001_PESSOA p ON p.id_pessoa = osr.pessoaId
      ${whereClause}
      GROUP BY osr.pessoaId, p.nomerazao_pessoa
      ORDER BY areaTrabalhadaTotal DESC
    `;

    const results = await sequelize.query(query, {
      replacements,
      type: QueryTypes.SELECT,
    });

    return results.map((row: any) => {
      const horasReaisTotal = Number(row.horasReaisTotal) || 0;
      const areaTrabalhadaTotal = Number(row.areaTrabalhadaTotal) || 0;
      const totalOS = Number(row.totalOS) || 0;
      const hasPorHora = horasReaisTotal > 0 ? Math.round((areaTrabalhadaTotal / horasReaisTotal) * 100) / 100 : 0;
      const mediaHorasPorOS = totalOS > 0 ? Math.round((horasReaisTotal / totalOS) * 100) / 100 : 0;

      return {
        pessoaId: row.pessoaId,
        nomerazaoPessoa: row.nomerazaoPessoa,
        totalOS,
        totalConcluidas: Number(row.totalConcluidas) || 0,
        horasReaisTotal,
        areaTrabalhadaTotal,
        hasPorHora,
        custoTotal: Number(row.custoTotal) || 0,
        mediaHorasPorOS,
      };
    });
  }

  /**
   * T13.2 — Rendimento por máquina
   * Agrega dados de uso de máquinas em OS concluídas/validadas
   */
  @RequirePermission('ordemServico.analytics')
  async getRendimentoMaquina(
    filters: { fazendaId?: number; safraId?: number; dataInicio?: string; dataFim?: string; tipoAtividadeOSId?: number },
    tenantId: number
  ): Promise<any[]> {
    let whereClause = `WHERE os.tenantId = :tenantId AND os.status IN ('CONCLUIDA', 'VALIDADA')`;
    const replacements: any = { tenantId };

    if (filters.fazendaId) {
      whereClause += ` AND os.fazendaId = :fazendaId`;
      replacements.fazendaId = filters.fazendaId;
    }
    if (filters.safraId) {
      whereClause += ` AND os.safraId = :safraId`;
      replacements.safraId = filters.safraId;
    }
    if (filters.dataInicio) {
      whereClause += ` AND COALESCE(os.dataInicioReal, os.dataPlanejadaInicio) >= :dataInicio`;
      replacements.dataInicio = filters.dataInicio;
    }
    if (filters.dataFim) {
      whereClause += ` AND COALESCE(os.dataInicioReal, os.dataPlanejadaInicio) <= :dataFim`;
      replacements.dataFim = filters.dataFim;
    }
    if (filters.tipoAtividadeOSId) {
      whereClause += ` AND os.tipoAtividadeOSId = :tipoAtividadeOSId`;
      replacements.tipoAtividadeOSId = filters.tipoAtividadeOSId;
    }

    const query = `
      SELECT
        osm.maquinaId,
        m.descricao AS maquinaDescricao,
        COUNT(DISTINCT os.id) AS totalOS,
        ROUND(COALESCE(SUM(osm.horasReais), 0), 2) AS horasReaisTotal,
        ROUND(COALESCE(SUM(osm.areaTrabalhada), 0), 4) AS areaTrabalhadaTotal,
        ROUND(COALESCE(SUM(osm.consumoCombustivel), 0), 2) AS consumoCombustivelTotal,
        ROUND(COALESCE(SUM(osm.horasReais * osm.custoHoraReal), 0), 2) AS custoTotalHora
      FROM C071_ordemServicoMaquina osm
      INNER JOIN C068_ordemServico os ON os.id = osm.ordemServicoId
      LEFT JOIN C030_maquina m ON m.id_mqn = osm.maquinaId
      ${whereClause}
      GROUP BY osm.maquinaId, m.descricao
      ORDER BY areaTrabalhadaTotal DESC
    `;

    const results = await sequelize.query(query, {
      replacements,
      type: QueryTypes.SELECT,
    });

    return results.map((row: any) => {
      const horasReaisTotal = Number(row.horasReaisTotal) || 0;
      const areaTrabalhadaTotal = Number(row.areaTrabalhadaTotal) || 0;
      const consumoCombustivelTotal = Number(row.consumoCombustivelTotal) || 0;
      const hasPorHora = horasReaisTotal > 0 ? Math.round((areaTrabalhadaTotal / horasReaisTotal) * 100) / 100 : 0;
      const litrosPorHa = areaTrabalhadaTotal > 0 ? Math.round((consumoCombustivelTotal / areaTrabalhadaTotal) * 100) / 100 : 0;
      const custoPorHa = areaTrabalhadaTotal > 0 ? Math.round((Number(row.custoTotalHora) / areaTrabalhadaTotal) * 100) / 100 : 0;

      return {
        maquinaId: row.maquinaId,
        maquinaDescricao: row.maquinaDescricao,
        totalOS: Number(row.totalOS) || 0,
        horasReaisTotal,
        areaTrabalhadaTotal,
        consumoCombustivelTotal,
        custoTotalHora: Number(row.custoTotalHora) || 0,
        hasPorHora,
        litrosPorHa,
        custoPorHa,
      };
    });
  }

  /**
   * T13.3 — Custo por categoria de atividade
   * Agrega custos estimados e reais por tipo/categoria de atividade
   */
  @RequirePermission('ordemServico.analytics')
  async getCustoCategoria(
    filters: { fazendaId?: number; safraId?: number; dataInicio?: string; dataFim?: string },
    tenantId: number
  ): Promise<any[]> {
    let whereClause = `WHERE os.tenantId = :tenantId AND os.status IN ('CONCLUIDA', 'VALIDADA')`;
    const replacements: any = { tenantId };

    if (filters.fazendaId) {
      whereClause += ` AND os.fazendaId = :fazendaId`;
      replacements.fazendaId = filters.fazendaId;
    }
    if (filters.safraId) {
      whereClause += ` AND os.safraId = :safraId`;
      replacements.safraId = filters.safraId;
    }
    if (filters.dataInicio) {
      whereClause += ` AND COALESCE(os.dataInicioReal, os.dataPlanejadaInicio) >= :dataInicio`;
      replacements.dataInicio = filters.dataInicio;
    }
    if (filters.dataFim) {
      whereClause += ` AND COALESCE(os.dataInicioReal, os.dataPlanejadaInicio) <= :dataFim`;
      replacements.dataFim = filters.dataFim;
    }

    const query = `
      SELECT
        ta.categoria,
        os.tipoAtividadeOSId,
        ta.nome AS tipoNome,
        COUNT(os.id) AS totalOS,
        ROUND(COALESCE(SUM(os.custoEstimado), 0), 2) AS custoEstimadoTotal,
        ROUND(COALESCE(SUM(os.custoReal), 0), 2) AS custoRealTotal
      FROM C068_ordemServico os
      LEFT JOIN C066_tipoAtividadeOS ta ON ta.id = os.tipoAtividadeOSId
      ${whereClause}
      GROUP BY os.tipoAtividadeOSId, ta.categoria, ta.nome
      ORDER BY custoRealTotal DESC
    `;

    const results = await sequelize.query(query, {
      replacements,
      type: QueryTypes.SELECT,
    });

    return results.map((row: any) => {
      const custoEstimadoTotal = Number(row.custoEstimadoTotal) || 0;
      const custoRealTotal = Number(row.custoRealTotal) || 0;
      const totalOS = Number(row.totalOS) || 0;
      const varianciaCustoPercent = custoEstimadoTotal > 0
        ? Math.round(((custoRealTotal - custoEstimadoTotal) / custoEstimadoTotal) * 100 * 100) / 100
        : null;
      const custoMedioOS = totalOS > 0 ? Math.round((custoRealTotal / totalOS) * 100) / 100 : 0;

      return {
        categoria: row.categoria,
        tipoAtividadeOSId: row.tipoAtividadeOSId,
        tipoNome: row.tipoNome,
        totalOS,
        custoEstimadoTotal,
        custoRealTotal,
        varianciaCustoPercent,
        custoMedioOS,
      };
    });
  }

  /**
   * T13.4 — Ranking de talhões por custo/produtividade
   */
  @RequirePermission('ordemServico.analytics')
  async getRankingTalhoes(
    filters: { fazendaId?: number; safraId?: number; dataInicio?: string; dataFim?: string; tipoAtividadeOSId?: number },
    tenantId: number
  ): Promise<any[]> {
    let whereClause = `WHERE os.tenantId = :tenantId AND os.status IN ('CONCLUIDA', 'VALIDADA')`;
    const replacements: any = { tenantId };

    if (filters.fazendaId) {
      whereClause += ` AND os.fazendaId = :fazendaId`;
      replacements.fazendaId = filters.fazendaId;
    }
    if (filters.safraId) {
      whereClause += ` AND os.safraId = :safraId`;
      replacements.safraId = filters.safraId;
    }
    if (filters.dataInicio) {
      whereClause += ` AND COALESCE(os.dataInicioReal, os.dataPlanejadaInicio) >= :dataInicio`;
      replacements.dataInicio = filters.dataInicio;
    }
    if (filters.dataFim) {
      whereClause += ` AND COALESCE(os.dataInicioReal, os.dataPlanejadaInicio) <= :dataFim`;
      replacements.dataFim = filters.dataFim;
    }
    if (filters.tipoAtividadeOSId) {
      whereClause += ` AND os.tipoAtividadeOSId = :tipoAtividadeOSId`;
      replacements.tipoAtividadeOSId = filters.tipoAtividadeOSId;
    }

    const query = `
      SELECT
        ost.talhaoId,
        t.descricao AS talhaoDescricao,
        COUNT(DISTINCT os.id) AS totalOS,
        ROUND(COALESCE(SUM(ost.custoRateado), 0), 2) AS custoRealTotal,
        ROUND(COALESCE(SUM(ost.areaReal), 0), 4) AS areaTotal,
        ROUND(COALESCE(SUM(os.custoEstimado * ost.percentualArea / 100), 0), 2) AS custoEstimadoTotal
      FROM C069_ordemServicoTalhao ost
      INNER JOIN C068_ordemServico os ON os.id = ost.ordemServicoId
      LEFT JOIN C034_talhao t ON t.id_talhao = ost.talhaoId
      ${whereClause}
      GROUP BY ost.talhaoId, t.descricao
      ORDER BY custoRealTotal DESC
    `;

    const results = await sequelize.query(query, {
      replacements,
      type: QueryTypes.SELECT,
    });

    return results.map((row: any) => {
      const custoRealTotal = Number(row.custoRealTotal) || 0;
      const custoEstimadoTotal = Number(row.custoEstimadoTotal) || 0;
      const areaTotal = Number(row.areaTotal) || 0;
      const custoPorHa = areaTotal > 0 ? Math.round((custoRealTotal / areaTotal) * 100) / 100 : 0;
      const varianciaPercent = custoEstimadoTotal > 0
        ? Math.round(((custoRealTotal - custoEstimadoTotal) / custoEstimadoTotal) * 100 * 100) / 100
        : null;

      return {
        talhaoId: row.talhaoId,
        talhaoDescricao: row.talhaoDescricao,
        totalOS: Number(row.totalOS) || 0,
        custoRealTotal,
        custoEstimadoTotal,
        areaTotal,
        custoPorHa,
        varianciaPercent,
      };
    });
  }

  /**
   * T13.5 — Evolução temporal de OS por semana ou mês
   * Período máximo de 12 meses (365 dias)
   */
  @RequirePermission('ordemServico.analytics')
  async getEvolucaoTemporal(
    filters: { fazendaId?: number; safraId?: number; dataInicio?: string; dataFim?: string; agrupamento?: 'semana' | 'mes' },
    tenantId: number
  ): Promise<any[]> {
    const agrupamento = filters.agrupamento || 'mes';

    // Validar período máximo de 365 dias
    if (filters.dataInicio && filters.dataFim) {
      const inicio = new Date(filters.dataInicio);
      const fim = new Date(filters.dataFim);
      const diffDias = Math.ceil((fim.getTime() - inicio.getTime()) / (1000 * 60 * 60 * 24));
      if (diffDias > 365) {
        throw new BusinessException(
          'O período máximo para evolução temporal é de 12 meses (365 dias).',
          'EVOLUCAO_PERIODO_MAXIMO'
        );
      }
    }

    let whereClause = `WHERE os.tenantId = :tenantId`;
    const replacements: any = { tenantId };

    if (filters.fazendaId) {
      whereClause += ` AND os.fazendaId = :fazendaId`;
      replacements.fazendaId = filters.fazendaId;
    }
    if (filters.safraId) {
      whereClause += ` AND os.safraId = :safraId`;
      replacements.safraId = filters.safraId;
    }
    if (filters.dataInicio) {
      whereClause += ` AND COALESCE(os.dataInicioReal, os.dataPlanejadaInicio) >= :dataInicio`;
      replacements.dataInicio = filters.dataInicio;
    }
    if (filters.dataFim) {
      whereClause += ` AND COALESCE(os.dataInicioReal, os.dataPlanejadaInicio) <= :dataFim`;
      replacements.dataFim = filters.dataFim;
    }

    const periodoExpr = agrupamento === 'semana'
      ? `YEARWEEK(COALESCE(os.dataInicioReal, os.dataPlanejadaInicio), 1)`
      : `DATE_FORMAT(COALESCE(os.dataInicioReal, os.dataPlanejadaInicio), '%Y-%m')`;

    const query = `
      SELECT
        ${periodoExpr} AS periodo,
        COUNT(*) AS totalOS,
        SUM(CASE WHEN os.status IN ('CONCLUIDA','VALIDADA') THEN 1 ELSE 0 END) AS totalConcluidas,
        SUM(CASE WHEN os.status = 'CANCELADA' THEN 1 ELSE 0 END) AS totalCanceladas,
        ROUND(COALESCE(SUM(os.custoReal), 0), 2) AS custoRealTotal,
        ROUND(COALESCE(SUM(os.areaRealTotal), 0), 4) AS areaTotal
      FROM C068_ordemServico os
      ${whereClause}
      GROUP BY periodo
      ORDER BY periodo
    `;

    const results = await sequelize.query(query, {
      replacements,
      type: QueryTypes.SELECT,
    });

    return results.map((row: any) => ({
      periodo: String(row.periodo),
      totalOS: Number(row.totalOS) || 0,
      totalConcluidas: Number(row.totalConcluidas) || 0,
      totalCanceladas: Number(row.totalCanceladas) || 0,
      custoRealTotal: Number(row.custoRealTotal) || 0,
      areaTotal: Number(row.areaTotal) || 0,
    }));
  }

  /**
   * T16.2 — Sync endpoint para dispositivos mobile
   * Retorna OS atualizadas desde 'since' com todos os filhos
   */
  @RequirePermission('ordemServico.read')
  async getSync(
    since: string,
    tenantId: number,
    limit: number = 100
  ): Promise<{ data: any[]; nextSince: string | null }> {
    const sinceDate = new Date(since);

    const where: any = {
      tenantId,
      [Op.or]: [
        { updatedAt: { [Op.gt]: sinceDate } },
        { syncedAt: null },
      ],
    };

    const model = (this.ordemServicoRepository as any).model;

    // Import child models for includes
    const OrdemServicoTalhao = require('../../../models/OrdemServicoTalhao').default;
    const OrdemServicoInsumo = require('../../../models/OrdemServicoInsumo').default;
    const OrdemServicoMaquina = require('../../../models/OrdemServicoMaquina').default;
    const OrdemServicoResponsavel = require('../../../models/OrdemServicoResponsavel').default;

    const results = await model.findAll({
      where,
      include: [
        { model: OrdemServicoTalhao, as: 'talhoes', required: false },
        { model: OrdemServicoInsumo, as: 'insumos', required: false },
        { model: OrdemServicoMaquina, as: 'maquinas', required: false },
        { model: OrdemServicoResponsavel, as: 'responsaveis', required: false },
      ],
      order: [['updatedAt', 'ASC']],
      limit,
    });

    let nextSince: string | null = null;
    if (results.length > 0) {
      const lastUpdatedAt = results[results.length - 1].updatedAt;
      nextSince = lastUpdatedAt ? new Date(lastUpdatedAt).toISOString() : null;
    }

    const data = results.map((os: any) => this.mapper.toDto(os));

    return { data, nextSince };
  }

  // ---------------------------------------------------------------------------
  // Métodos Privados
  // ---------------------------------------------------------------------------

  /**
   * Calcula custo real e área real total a partir dos filhos da OS
   */
  private async calcularCustoReal(
    osId: number
  ): Promise<{ custoReal: number; areaRealTotal: number }> {
    const insumos = await this.insumoRepository.findByOrdemServico(osId);
    const maquinas = await this.maquinaRepository.findByOrdemServico(osId);
    const responsaveis = await this.responsavelRepository.findByOrdemServico(osId);
    const talhoes = await this.talhaoRepository.findByOrdemServico(osId);

    // custoReal = SUM(insumos: qtdReal * custoUnitReal)
    //           + SUM(maquinas: horasReais * custoHoraReal)
    //           + SUM(responsaveis: horasReais * custoHoraReal)
    let custoReal = 0;

    for (const insumo of insumos) {
      const qtd = Number((insumo as any).quantidadeReal) || 0;
      const custo = Number((insumo as any).custoUnitarioReal) || 0;
      custoReal += qtd * custo;
    }

    for (const maquina of maquinas) {
      const horas = Number((maquina as any).horasReais) || 0;
      const custo = Number((maquina as any).custoHoraReal) || 0;
      custoReal += horas * custo;
    }

    for (const responsavel of responsaveis) {
      const horas = Number((responsavel as any).horasReais) || 0;
      const custo = Number((responsavel as any).custoHoraReal) || 0;
      custoReal += horas * custo;
    }

    // areaRealTotal = SUM(talhoes: areaReal)
    let areaRealTotal = 0;
    for (const talhao of talhoes) {
      areaRealTotal += Number((talhao as any).areaReal) || 0;
    }

    return {
      custoReal: Math.round(custoReal * 100) / 100,
      areaRealTotal: Math.round(areaRealTotal * 100) / 100,
    };
  }

  /**
   * Calcula variâncias de área, custo e dias em relação ao planejado
   */
  private calcularVariancia(
    os: OrdemServico & { areaRealTotal?: number; custoReal?: number },
    dataFimReal: string
  ): {
    varianciaAreaPercent: number | null;
    varianciaCustoPercent: number | null;
    varianciaDias: number | null;
  } {
    let varianciaAreaPercent: number | null = null;
    let varianciaCustoPercent: number | null = null;
    let varianciaDias: number | null = null;

    // varianciaAreaPercent = ((areaRealTotal - areaPlanejadaTotal) / areaPlanejadaTotal) * 100
    const areaPlanejada = Number(os.areaPlanejadaTotal) || 0;
    const areaReal = Number(os.areaRealTotal) || 0;
    if (areaPlanejada !== 0) {
      varianciaAreaPercent = Math.round(((areaReal - areaPlanejada) / areaPlanejada) * 100 * 100) / 100;
    }

    // varianciaCustoPercent = ((custoReal - custoEstimado) / custoEstimado) * 100
    const custoEstimado = Number(os.custoEstimado) || 0;
    const custoReal = Number(os.custoReal) || 0;
    if (custoEstimado !== 0) {
      varianciaCustoPercent = Math.round(((custoReal - custoEstimado) / custoEstimado) * 100 * 100) / 100;
    }

    // varianciaDias = diff(dataFimReal, dataPlanejadaFim) em dias
    // positivo = atrasou; null se sem dataPlanejadaFim
    if (os.dataPlanejadaFim) {
      const fim = new Date(dataFimReal);
      const planejadoFim = new Date(os.dataPlanejadaFim as any);
      const diffMs = fim.getTime() - planejadoFim.getTime();
      const diffDias = diffMs / (1000 * 60 * 60 * 24);
      varianciaDias = Math.round(diffDias * 100) / 100;
    }

    return { varianciaAreaPercent, varianciaCustoPercent, varianciaDias };
  }

  /**
   * Valida que o tipoAtividadeOSId existe e pertence ao tenant atual
   */
  private async validarTipoAtividade(tipoAtividadeOSId: number, tenantId: number): Promise<void> {
    const tipo = await this.tipoAtividadeOSRepository.findById(tipoAtividadeOSId);
    if (!tipo) {
      throw new NotFoundException('Tipo de atividade OS', tipoAtividadeOSId);
    }
    // Permitir templates globais (tenantId = null) e tipos do tenant atual
    const tipoTenantId = (tipo as any).tenantId;
    if (tipoTenantId !== null && tipoTenantId !== tenantId) {
      throw new BusinessException(
        'O tipo de atividade informado não pertence ao tenant atual.',
        'TIPO_ATIVIDADE_CROSS_TENANT'
      );
    }
  }

  /**
   * Baixa estoque dos insumos consumidos na OS.
   * Para cada insumo com quantidadeReal > 0, cria MovimentoEstoque negativo (saída).
   * NÃO falha a conclusão se a criação do movimento falhar (log de erro).
   */
  private async baixarEstoque(
    osId: number,
    fazendaId: number,
    tenantId: number,
    userId: number
  ): Promise<void> {
    try {
      const insumos = await this.insumoRepository.findByOrdemServico(osId);
      const os = await this.ordemServicoRepository.findById(osId);

      for (const insumo of insumos) {
        const qtdReal = Number((insumo as any).quantidadeReal) || 0;
        if (qtdReal <= 0) continue;

        const custoUnitReal = Number((insumo as any).custoUnitarioReal) || 0;
        const valorMovimento = Math.round(qtdReal * custoUnitReal * 10000) / 10000;

        const movimento = await this.movimentoEstoqueRepository.create({
          tenantId,
          idProduto: (insumo as any).produtoId,
          idFazenda: fazendaId,
          idOrdemServicoInsumo: (insumo as any).id,
          tipomov: TipoMovimento.ESTOQUE_FISICO,
          operacao: OperacaoEstoque.CONSUMO_OS,
          quantidade: -Math.abs(qtdReal),
          data: os?.dataFimReal
            ? new Date(os.dataFimReal as any).toISOString().split('T')[0]
            : new Date().toISOString().split('T')[0],
          valor: valorMovimento,
          usercreation: userId,
        } as any);

        // Atualizar referência do movimento no insumo
        await this.insumoRepository.update((insumo as any).id, {
          movimentoEstoqueId: (movimento as any).id_mov,
        } as any);
      }

      // Marcar estoque como processado
      await this.ordemServicoRepository.update(osId, {
        estoqueProcessado: true,
      } as any);
    } catch (error) {
      console.error(`[OrdemServicoService] Erro ao baixar estoque da OS #${osId}:`, error);
    }
  }

  /**
   * Reverte a baixa de estoque dos insumos da OS.
   * Para cada insumo com movimentoEstoqueId preenchido, cria MovimentoEstoque de estorno (positivo).
   * Limpa referência do movimento nos insumos e marca estoqueProcessado = false.
   */
  private async reverterBaixaEstoque(
    osId: number,
    fazendaId: number,
    tenantId: number,
    userId: number
  ): Promise<void> {
    try {
      const insumos = await this.insumoRepository.findByOrdemServico(osId);

      for (const insumo of insumos) {
        const movEstoqueId = (insumo as any).movimentoEstoqueId;
        if (!movEstoqueId) continue;

        const qtdReal = Number((insumo as any).quantidadeReal) || 0;
        const custoUnitReal = Number((insumo as any).custoUnitarioReal) || 0;
        const valorMovimento = Math.round(qtdReal * custoUnitReal * 10000) / 10000;

        // Criar movimento de estorno (quantidade POSITIVA)
        await this.movimentoEstoqueRepository.create({
          tenantId,
          idProduto: (insumo as any).produtoId,
          idFazenda: fazendaId,
          idOrdemServicoInsumo: (insumo as any).id,
          tipomov: TipoMovimento.ESTOQUE_FISICO,
          operacao: OperacaoEstoque.ESTORNO_OS,
          quantidade: Math.abs(qtdReal),
          data: new Date().toISOString().split('T')[0],
          valor: valorMovimento,
          usercreation: userId,
        } as any);

        // Limpar referência do movimento no insumo
        await this.insumoRepository.update((insumo as any).id, {
          movimentoEstoqueId: null,
        } as any);
      }

      // Marcar estoque como não processado
      await this.ordemServicoRepository.update(osId, {
        estoqueProcessado: false,
      } as any);
    } catch (error) {
      console.error(`[OrdemServicoService] Erro ao reverter estoque da OS #${osId}:`, error);
    }
  }

  /**
   * Atualiza o horímetro das máquinas utilizadas na OS.
   * Para cada máquina da OS com horimetroFim > 0, atualiza Maquina.ultimoHorimetro.
   */
  private async atualizarHorimetroMaquinas(osId: number, tenantId: number): Promise<void> {
    try {
      const maquinasOS = await this.maquinaRepository.findByOrdemServico(osId);

      for (const maqOS of maquinasOS) {
        const horimetroFim = Number((maqOS as any).horimetroFim) || 0;
        if (horimetroFim <= 0) continue;

        const maquinaId = (maqOS as any).maquinaId;

        // Buscar a máquina real pelo ID (PK é id_mqn)
        const maquinaReal = await this.maquinaRealRepository.findById(maquinaId);
        if (maquinaReal) {
          await this.maquinaRealRepository.update((maquinaReal as any).id_mqn, {
            ultimoHorimetro: horimetroFim,
          } as any);
        }
      }
    } catch (error) {
      console.error(`[OrdemServicoService] Erro ao atualizar horímetro das máquinas da OS #${osId}:`, error);
    }
  }

  /**
   * Gera títulos a pagar para mão de obra dos responsáveis da OS.
   * Agrupa responsáveis por pessoaId e cria um título para cada grupo com custo > 0.
   * Idempotente: não gera se financeiroProcessado === true.
   * NÃO falha a validação se falhar.
   */
  private async gerarTitulosPagar(os: any, tenantId: number, userId: number): Promise<void> {
    try {
      // Idempotente: se já processou, não gera novamente
      if (os.financeiroProcessado) return;

      const responsaveis = await this.responsavelRepository.findByOrdemServico(os.id);
      if (!responsaveis || responsaveis.length === 0) return;

      // Agrupar por pessoaId e somar custo (horasReais * custoHoraReal)
      const grupoPorPessoa = new Map<number, number>();
      for (const resp of responsaveis) {
        const pessoaId = (resp as any).pessoaId;
        const horasReais = Number((resp as any).horasReais) || 0;
        const custoHoraReal = Number((resp as any).custoHoraReal) || 0;
        const custoResp = horasReais * custoHoraReal;

        if (custoResp > 0) {
          const atual = grupoPorPessoa.get(pessoaId) || 0;
          grupoPorPessoa.set(pessoaId, atual + custoResp);
        }
      }

      if (grupoPorPessoa.size === 0) return;

      // Buscar plano de conta e centro de custo padrão do tipo de atividade
      const tipoAtividade = await this.tipoAtividadeOSRepository.findById(os.tipoAtividadeOSId);
      const planoContaId = (tipoAtividade as any)?.planoContaIdPadrao ?? null;
      const centroCustoId = (tipoAtividade as any)?.centroCustoIdPadrao ?? null;

      for (const [pessoaId, valorTotal] of grupoPorPessoa) {
        const valorArredondado = Math.round(valorTotal * 100) / 100;
        if (valorArredondado <= 0) continue;

        await this.tituloPagarRepository.create({
          tenantId,
          idFornecedor: pessoaId,
          valorTitulo: valorArredondado,
          dataLancamento: new Date(),
          numeroTitulo: `OS-${os.numero}-MO-${pessoaId}`,
          observacao: `OS #${os.numero} - Mão de obra`,
          quantidadeParcelas: 1,
          idFazenda: os.fazendaId,
          idSafra: os.safraId || null,
          usercreation: userId,
        } as any);
      }

      // Marcar financeiro como processado
      await this.ordemServicoRepository.update(os.id, {
        financeiroProcessado: true,
      } as any);
    } catch (error) {
      console.error(`[OrdemServicoService] Erro ao gerar títulos a pagar da OS #${os.id}:`, error);
    }
  }

  /**
   * Calcula o rateio do custo real por talhão, proporcional à área.
   * Usa areaReal de cada talhão; se null, usa areaPlanejada.
   * Ajusta o último talhão para compensar arredondamento.
   */
  private async calcularRateioCustoTalhoes(osId: number, custoReal: number): Promise<void> {
    try {
      const talhoes = await this.talhaoRepository.findByOrdemServico(osId);
      if (!talhoes || talhoes.length === 0) return;

      // Calcular área total (prioriza areaReal, fallback areaPlanejada)
      let areaTotalOS = 0;
      const areasDosTalhoes: { id: number; area: number }[] = [];
      for (const talhao of talhoes) {
        const areaReal = Number((talhao as any).areaReal) || 0;
        const areaPlanejada = Number((talhao as any).areaPlanejada) || 0;
        const area = areaReal > 0 ? areaReal : areaPlanejada;
        areaTotalOS += area;
        areasDosTalhoes.push({ id: (talhao as any).id, area });
      }

      if (areaTotalOS <= 0) return;

      let custoAcumulado = 0;

      for (let i = 0; i < areasDosTalhoes.length; i++) {
        const { id, area } = areasDosTalhoes[i];
        const percentualArea = Math.round((area / areaTotalOS) * 100 * 100) / 100;

        let custoRateado: number;
        if (i === areasDosTalhoes.length - 1) {
          // Último talhão: compensar arredondamento
          custoRateado = Math.round((custoReal - custoAcumulado) * 100) / 100;
        } else {
          custoRateado = Math.round((custoReal * (area / areaTotalOS)) * 100) / 100;
          custoAcumulado += custoRateado;
        }

        await this.talhaoRepository.update(id, {
          percentualArea,
          custoRateado,
        } as any);
      }
    } catch (error) {
      console.error(`[OrdemServicoService] Erro ao calcular rateio de custo por talhão da OS #${osId}:`, error);
    }
  }
}
