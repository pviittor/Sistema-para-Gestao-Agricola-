/**
 * TituloPagarApplicationService - Application Service para entidade TituloPagar
 * 
 * Contém a lógica de negócio para operações com títulos a pagar, separando
 * controllers (HTTP) da lógica de aplicação.
 * 
 * Responsabilidades:
 * - Validações de negócio (RN-001 a RN-018)
 * - Validações cross-tenant
 * - Cálculos automáticos (valor total, quantidade de parcelas)
 * - Conversão de moeda (RN-009)
 * - Orquestração de repositórios e mappers
 * 
 * @example
 * ```typescript
 * const service = container.resolve<ITituloPagarApplicationService>(TYPES.ITituloPagarApplicationService);
 * 
 * const titulo = await service.create({
 *   idFornecedor: 1,
 *   idPortador: 2,
 *   idProdutor: 3,
 *   idFazenda: 1,
 *   idSafra: 1,
 *   idMoeda: 1,
 *   dataLancamento: '2024-01-15',
 *   numeroTitulo: 'TP-001',
 *   valorTitulo: 10000.00,
 *   // ...
 * });
 * ```
 */

import { Injectable, Inject } from '../../../core/di';
import { TYPES } from '../../../core/di/types';
import { ITituloPagarApplicationService } from './ITituloPagarApplicationService';
import { ITituloPagarRepository } from '../../../infrastructure/repository/ITituloPagarRepository';
import { IParcelaTituloPagarRepository } from '../../../infrastructure/repository/IParcelaTituloPagarRepository';
import { IRateioPlanoContaTituloPagarRepository } from '../../../infrastructure/repository/IRateioPlanoContaTituloPagarRepository';
import { IRateioCentroCustoTituloPagarRepository } from '../../../infrastructure/repository/IRateioCentroCustoTituloPagarRepository';
import { IPessoaRepository } from '../../../infrastructure/repository/IPessoaRepository';
import { IFazendaRepository } from '../../../infrastructure/repository/IFazendaRepository';
import { ISafraRepository } from '../../../infrastructure/repository/ISafraRepository';
import { IPlanoContaGerencialRepository } from '../../../infrastructure/repository/IPlanoContaGerencialRepository';
import { ICentroCustoRepository } from '../../../infrastructure/repository/ICentroCustoRepository';
import { IMoedaConversionService } from '../moedaConversion/IMoedaConversionService';
import { TituloPagarMapper } from '../../mappers/TituloPagarMapper';
import { CreateTituloPagarDto } from '../../dto/tituloPagar/CreateTituloPagarDto';
import { CreateTituloPagarCompletoDto } from '../../dto/tituloPagar/CreateTituloPagarCompletoDto';  
import { UpdateTituloPagarDto } from '../../dto/tituloPagar/UpdateTituloPagarDto';
import { TituloPagarResponseDto } from '../../dto/tituloPagar/TituloPagarResponseDto';
import { ParcelaTituloPagarMapper } from '../../mappers/ParcelaTituloPagarMapper';
import { RateioPlanoContaTituloPagarMapper } from '../../mappers/RateioPlanoContaTituloPagarMapper';
import { RateioCentroCustoTituloPagarMapper } from '../../mappers/RateioCentroCustoTituloPagarMapper';
import { CreateParcelaTituloPagarDto } from '../../dto/parcelaTituloPagar/CreateParcelaTituloPagarDto';
import { CreateRateioPlanoContaTituloPagarDto } from '../../dto/rateioPlanoContaTituloPagar/CreateRateioPlanoContaTituloPagarDto';
import { CreateRateioCentroCustoTituloPagarDto } from '../../dto/rateioCentroCustoTituloPagar/CreateRateioCentroCustoTituloPagarDto';
import { PaginatedResult } from '../../../core/repository/types';
import { NotFoundException, BusinessException, ForbiddenException, ValidationException } from '../../../core/exceptions';
import { Transactional } from '../../../core/unitofwork/Transactional';
import { RequirePermission } from '../../../core/authorization';
import { Auditable } from '../../../core/audit';
import { Cacheable, CacheEvict } from '../../../core/cache';
import { getRequestContext } from '../../../core/authorization/helpers';
import { IAuditService } from '../../../core/audit/IAuditService';
import TituloPagar, { StatusTituloPagar } from '../../../models/TituloPagar';
import { StatusParcela } from '../../../models/ParcelaTituloPagar';
import { Op } from 'sequelize';

/**
 * Application Service para entidade TituloPagar
 * 
 * Implementa lógica de negócio para operações com títulos a pagar, usando
 * repositórios para acesso a dados e mapper para conversão DTO-Entidade.
 */
@Injectable()
export class TituloPagarApplicationService implements ITituloPagarApplicationService {
  private mapper: TituloPagarMapper;
  private parcelaMapper: ParcelaTituloPagarMapper;
  private rateioPlanoContaMapper: RateioPlanoContaTituloPagarMapper;
  private rateioCentroCustoMapper: RateioCentroCustoTituloPagarMapper;

  constructor(
    @Inject(TYPES.IAuditService)
    private auditService: IAuditService,
    @Inject(TYPES.ITituloPagarRepository)
    private tituloPagarRepository: ITituloPagarRepository,
    @Inject(TYPES.IParcelaTituloPagarRepository)
    private parcelaTituloPagarRepository: IParcelaTituloPagarRepository,
    @Inject(TYPES.IRateioPlanoContaTituloPagarRepository)
    private rateioPlanoContaRepository: IRateioPlanoContaTituloPagarRepository,
    @Inject(TYPES.IRateioCentroCustoTituloPagarRepository)
    private rateioCentroCustoRepository: IRateioCentroCustoTituloPagarRepository,
    @Inject(TYPES.IPessoaRepository)
    private pessoaRepository: IPessoaRepository,
    @Inject(TYPES.IFazendaRepository)
    private fazendaRepository: IFazendaRepository,
    @Inject(TYPES.ISafraRepository)
    private safraRepository: ISafraRepository,
    @Inject(TYPES.IPlanoContaGerencialRepository)
    private planoContaGerencialRepository: IPlanoContaGerencialRepository,
    @Inject(TYPES.ICentroCustoRepository)
    private centroCustoRepository: ICentroCustoRepository,
    @Inject(TYPES.IMoedaConversionService)
    private moedaConversionService: IMoedaConversionService
  ) {
    this.mapper = new TituloPagarMapper();
    this.parcelaMapper = new ParcelaTituloPagarMapper();
    this.rateioPlanoContaMapper = new RateioPlanoContaTituloPagarMapper();
    this.rateioCentroCustoMapper = new RateioCentroCustoTituloPagarMapper();
  }

  /**
   * Cria um novo título a pagar
   * 
   * Implementa validações de negócio (RN-001 a RN-018) e conversão de moeda (RN-009).
   * 
   * @param dto - DTO com dados para criação
   * @returns Promise que resolve com o DTO do título criado
   * @throws BusinessException se validações de negócio falharem
   * @throws ForbiddenException se usuário não tiver permissão 'tituloPagar.create'
   */
  @RequirePermission('tituloPagar.create')
  @Transactional()
  @Auditable('TituloPagar')
  @CacheEvict('tituloPagar:list:*', true)
  @CacheEvict('tituloPagar:findBySafra:*', true)
  @CacheEvict('tituloPagar:findByFazenda:*', true)
  @CacheEvict('tituloPagar:findByFornecedor:*', true)
  @CacheEvict('tituloPagar:findByStatus:*', true)
  async create(dto: CreateTituloPagarDto): Promise<TituloPagarResponseDto> {
    // Obter userId e tenantId do contexto
    const context = getRequestContext();
    if (!context || !context.getUserId()) {
      throw new ForbiddenException(
        'Usuário não autenticado. Não é possível criar título sem userId.',
        'USER_NOT_AUTHENTICATED'
      );
    }
    const userId = context.getUserId()!;
    const tenantId = context.getTenantId();
    if (!tenantId) {
      throw new ForbiddenException(
        'Tenant não identificado. Não é possível criar título sem tenantId.',
        'TENANT_NOT_IDENTIFIED'
      );
    }

    // RN-008: Validar unicidade do número do título por tenant
    const tituloExistente = await this.tituloPagarRepository.findByNumeroTitulo(dto.numeroTitulo);
    if (tituloExistente) {
      throw new BusinessException(
        `Já existe um título com o número "${dto.numeroTitulo}" para este tenant.`,
        'NUMERO_TITULO_DUPLICADO'
      );
    }

    // RN-014, RN-015, RN-016: Validações cross-tenant
    await this.validarRelacionamentosCrossTenant(dto, tenantId);

    // RN-009: Conversão de moeda (se necessário)
    const valoresConvertidos = await this.moedaConversionService.converterParaMoedaPadrao(
      dto.idMoeda,
      dto.valorTitulo,
      dto.dataLancamento,
      tenantId
    );

    // Converter DTO para entidade
    const entity = await this.mapper.toEntity(dto);

    // Adicionar campos automáticos
    (entity as any).usercreation = userId;
    (entity as any).datecreation = new Date();
    (entity as any).tenantId = tenantId;
    (entity as any).status = dto.status || StatusTituloPagar.ABERTO;
    (entity as any).impostoRenda = dto.impostoRenda ?? false;
    (entity as any).quantidadeParcelas = dto.quantidadeParcelas || 0;

    // Adicionar valores convertidos
    if (valoresConvertidos.valorMoedaOriginal !== undefined) {
      (entity as any).valorTituloMoedaOriginal = valoresConvertidos.valorMoedaOriginal;
    }
    if (valoresConvertidos.valorMoedaPadrao !== undefined) {
      (entity as any).valorTituloMoedaPadrao = valoresConvertidos.valorMoedaPadrao;
    }

    // Criar título via repositório
    const created = await this.tituloPagarRepository.create(entity as any);

    // Registrar auditoria
    await this.auditService.logCreate('tituloPagar', userId, dto);

    // Retornar como DTO
    return this.mapper.toDto(created);
  }

  /**
   * Atualiza um título a pagar existente
   * 
   * @param id - ID do título
   * @param dto - DTO com dados para atualização
   * @returns Promise que resolve com o DTO do título atualizado
   * @throws NotFoundException se título não for encontrado
   * @throws BusinessException se validações de negócio falharem
   * @throws ForbiddenException se usuário não tiver permissão 'tituloPagar.update'
   */
  @RequirePermission('tituloPagar.update')
  @Transactional()
  @Auditable('TituloPagar')
  @CacheEvict('tituloPagar:getById:{0}')
  @CacheEvict('tituloPagar:list:*', true)
  @CacheEvict('tituloPagar:findBySafra:*', true)
  @CacheEvict('tituloPagar:findByFazenda:*', true)
  @CacheEvict('tituloPagar:findByFornecedor:*', true)
  @CacheEvict('tituloPagar:findByStatus:*', true)
  async update(id: number | string, dto: UpdateTituloPagarDto): Promise<TituloPagarResponseDto> {
    // Verificar se título existe
    const existing = await this.tituloPagarRepository.findById(id);
    if (!existing) {
      throw new NotFoundException('Título a pagar', id);
    }

    // Validar se título pode ser atualizado (não pode estar totalmente baixado)
    if (existing.status === StatusTituloPagar.BAIXADO) {
      throw new BusinessException(
        'Não é possível atualizar um título totalmente baixado.',
        'TITULO_BAIXADO'
      );
    }

    if (existing.status === StatusTituloPagar.CANCELADO) {
      throw new BusinessException(
        'Não é possível atualizar um título cancelado.',
        'TITULO_CANCELADO'
      );
    }

    const context = getRequestContext();
    const tenantId = context?.getTenantId();
    if (!tenantId) {
      throw new ForbiddenException(
        'Tenant não identificado.',
        'TENANT_NOT_IDENTIFIED'
      );
    }

    // RN-008: Validar unicidade do número do título (se alterado)
    if (dto.numeroTitulo && dto.numeroTitulo !== existing.numeroTitulo) {
      const tituloExistente = await this.tituloPagarRepository.findByNumeroTitulo(dto.numeroTitulo);
      if (tituloExistente && tituloExistente.id !== existing.id) {
        throw new BusinessException(
          `Já existe um título com o número "${dto.numeroTitulo}" para este tenant.`,
          'NUMERO_TITULO_DUPLICADO'
        );
      }
    }

    // RN-014, RN-015, RN-016: Validações cross-tenant (se relacionamentos alterados)
    await this.validarRelacionamentosCrossTenantUpdate(dto, tenantId);

    // RN-009: Conversão de moeda (se moeda ou valor alterados)
    let valoresConvertidos: { valorMoedaOriginal: number; valorMoedaPadrao: number } | null = null;
    if (dto.idMoeda !== undefined || dto.valorTitulo !== undefined) {
      const idMoeda = dto.idMoeda ?? existing.idMoeda;
      const valorTitulo = dto.valorTitulo ?? existing.valorTitulo;
      const dataLancamento = dto.dataLancamento ?? existing.dataLancamento.toISOString().split('T')[0];
      valoresConvertidos = await this.moedaConversionService.converterParaMoedaPadrao(idMoeda, valorTitulo, dataLancamento, tenantId);
    }

    // Converter DTO para entidade
    const entity = await this.mapper.toEntity(dto);

    // Adicionar valores convertidos se calculados
    if (valoresConvertidos) {
      (entity as any).valorTituloMoedaOriginal = valoresConvertidos.valorMoedaOriginal;
      (entity as any).valorTituloMoedaPadrao = valoresConvertidos.valorMoedaPadrao;
    }

    // Atualizar via repositório
    const updated = await this.tituloPagarRepository.update(id, entity as any);

    // Registrar auditoria
    const userId = context?.getUserId();
    if (userId) {
      await this.auditService.logUpdate('tituloPagar', Number(id), existing, dto);
    }

    // Retornar como DTO
    return this.mapper.toDto(updated);
  }

  /**
   * Remove um título a pagar
   * 
   * @param id - ID do título
   * @returns Promise que resolve com true se removido, false caso contrário
   * @throws ForbiddenException se usuário não tiver permissão 'tituloPagar.delete'
   */
  @RequirePermission('tituloPagar.delete')
  @Transactional()
  @Auditable('TituloPagar')
  @CacheEvict('tituloPagar:getById:{0}')
  @CacheEvict('tituloPagar:list:*', true)
  @CacheEvict('tituloPagar:findBySafra:*', true)
  @CacheEvict('tituloPagar:findByFazenda:*', true)
  @CacheEvict('tituloPagar:findByFornecedor:*', true)
  @CacheEvict('tituloPagar:findByStatus:*', true)
  async delete(id: number | string): Promise<boolean> {
    // Verificar se título existe
    const existing = await this.tituloPagarRepository.findById(id);
    if (!existing) {
      return false;
    }

    // Validar se título pode ser deletado (não pode ter parcelas baixadas)
    const parcelas = await this.parcelaTituloPagarRepository.findByTituloPagar(Number(id));
    const parcelasBaixadas = parcelas.filter(p => p.status === StatusParcela.BAIXADA);
    if (parcelasBaixadas.length > 0) {
      throw new BusinessException(
        'Não é possível deletar um título que possui parcelas baixadas.',
        'TITULO_COM_PARCELAS_BAIXADAS'
      );
    }

    // Remover via repositório
    const deleted = await this.tituloPagarRepository.delete(id);

    // Registrar auditoria
    const context = getRequestContext();
    const userId = context?.getUserId();
    if (userId) {
      await this.auditService.logDelete('tituloPagar', Number(id), existing);
    }

    return deleted;
  }

  /**
   * Busca um título a pagar por ID
   * 
   * @param id - ID do título
   * @returns Promise que resolve com o DTO do título encontrado ou null
   * @throws ForbiddenException se usuário não tiver permissão 'tituloPagar.read'
   */
  @RequirePermission('tituloPagar.read')
  @Cacheable('tituloPagar:getById:{0}', 3600)
  async getById(id: number | string): Promise<TituloPagarResponseDto | null> {
    const entity = await this.tituloPagarRepository.findById(id);
    return entity ? this.mapper.toDto(entity) : null;
  }

  /**
   * Lista títulos a pagar com paginação
   * 
   * @param page - Número da página (padrão: 1)
   * @param limit - Limite de registros por página (padrão: 10)
   * @returns Promise que resolve com resultado paginado
   * @throws ForbiddenException se usuário não tiver permissão 'tituloPagar.read'
   */
  @RequirePermission('tituloPagar.read')
  @Cacheable('tituloPagar:list:{0}:{1}', 300)
  async list(page: number = 1, limit: number = 10): Promise<PaginatedResult<TituloPagarResponseDto>> {
    const result = await this.tituloPagarRepository.findAllPaginated(page, limit);
    return {
      ...result,
      data: result.data.map(entity => this.mapper.toDto(entity)),
    };
  }

  /**
   * Retorna KPIs consolidados dos títulos a pagar
   *
   * Calcula métricas a nível de parcela:
   * - totalAberto: soma do saldo de parcelas abertas/parciais
   * - totalVencido: soma do saldo de parcelas vencidas (abertas/parciais)
   * - totalAVencer30Dias: soma do saldo de parcelas a vencer nos próximos 30 dias
   * - totalBaixadoMes: soma do valorBaixa de parcelas baixadas no mês corrente
   * - quantidadeAberto: quantidade de parcelas abertas/parciais
   * - quantidadeVencido: quantidade de parcelas vencidas
   */
  @RequirePermission('tituloPagar.read')
  async getKpis(filtros?: { idFazenda?: number; idSafra?: number }): Promise<{
    totalAberto: number;
    totalVencido: number;
    totalAVencer30Dias: number;
    totalBaixadoMes: number;
    quantidadeAberto: number;
    quantidadeVencido: number;
  }> {
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);
    const inicioMes = new Date(hoje.getFullYear(), hoje.getMonth(), 1);
    const em30Dias = new Date(hoje);
    em30Dias.setDate(em30Dias.getDate() + 30);

    // Buscar todas as parcelas com seus títulos (para filtros de fazenda/safra)
    const where: any = {};
    const tituloWhere: any = {};
    if (filtros?.idFazenda) tituloWhere.idFazenda = filtros.idFazenda;
    if (filtros?.idSafra) tituloWhere.idSafra = filtros.idSafra;

    const parcelas = await (this.parcelaTituloPagarRepository as any).model.findAll({
      where,
      include: [{
        model: TituloPagar,
        as: 'tituloPagar',
        required: true,
        where: {
          ...tituloWhere,
          tenantId: getRequestContext()?.getTenantId(),
        },
        attributes: ['id'],
      }],
      raw: true,
    });

    let totalAberto = 0;
    let totalVencido = 0;
    let totalAVencer30Dias = 0;
    let totalBaixadoMes = 0;
    let quantidadeAberto = 0;
    let quantidadeVencido = 0;

    for (const p of parcelas) {
      const status = (p.status || '').toUpperCase();
      const valorParcela = Number(p.valorParcela) || 0;
      const valorBaixa = Number(p.valorBaixa) || 0;
      const saldo = Math.max(0, valorParcela - valorBaixa);

      if (status === 'ABERTA' || status === 'PARCIAL') {
        totalAberto += saldo;
        quantidadeAberto++;

        const venc = new Date(p.dataVencimento + 'T00:00:00');
        if (venc < hoje) {
          totalVencido += saldo;
          quantidadeVencido++;
        } else if (venc <= em30Dias) {
          totalAVencer30Dias += saldo;
        }
      } else if (status === 'BAIXADA') {
        const dataBaixa = p.dataBaixa ? new Date(p.dataBaixa) : null;
        if (dataBaixa && dataBaixa >= inicioMes) {
          totalBaixadoMes += valorBaixa;
        }
      }
    }

    return {
      totalAberto: Math.round(totalAberto * 100) / 100,
      totalVencido: Math.round(totalVencido * 100) / 100,
      totalAVencer30Dias: Math.round(totalAVencer30Dias * 100) / 100,
      totalBaixadoMes: Math.round(totalBaixadoMes * 100) / 100,
      quantidadeAberto,
      quantidadeVencido,
    };
  }

  /**
   * Busca títulos a pagar por safra
   * 
   * @param idSafra - ID da safra
   * @param page - Número da página (padrão: 1)
   * @param limit - Limite de registros por página (padrão: 10)
   * @returns Promise que resolve com resultado paginado
   * @throws ForbiddenException se usuário não tiver permissão 'tituloPagar.read'
   */
  @RequirePermission('tituloPagar.read')
  @Cacheable('tituloPagar:findBySafra:{0}:{1}:{2}', 600)
  async findBySafra(idSafra: number, page: number = 1, limit: number = 10): Promise<PaginatedResult<TituloPagarResponseDto>> {
    const entities = await this.tituloPagarRepository.findBySafra(idSafra);
    
    // Aplicar paginação manualmente (já que o repositório retorna array)
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedEntities = entities.slice(startIndex, endIndex);
    const total = entities.length;
    const totalPages = Math.ceil(total / limit);
    
    return {
      data: paginatedEntities.map(entity => this.mapper.toDto(entity)),
      total,
      page,
      limit,
      totalPages,
    };
  }

  /**
   * Busca títulos a pagar por fazenda
   * 
   * @param idFazenda - ID da fazenda
   * @param page - Número da página (padrão: 1)
   * @param limit - Limite de registros por página (padrão: 10)
   * @returns Promise que resolve com resultado paginado
   * @throws ForbiddenException se usuário não tiver permissão 'tituloPagar.read'
   */
  @RequirePermission('tituloPagar.read')
  @Cacheable('tituloPagar:findByFazenda:{0}:{1}:{2}', 600)
  async findByFazenda(idFazenda: number, page: number = 1, limit: number = 10): Promise<PaginatedResult<TituloPagarResponseDto>> {
    const entities = await this.tituloPagarRepository.findByFazenda(idFazenda);
    
    // Aplicar paginação manualmente (já que o repositório retorna array)
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedEntities = entities.slice(startIndex, endIndex);
    const total = entities.length;
    const totalPages = Math.ceil(total / limit);
    
    return {
      data: paginatedEntities.map(entity => this.mapper.toDto(entity)),
      total,
      page,
      limit,
      totalPages,
    };
  }

  /**
   * Busca títulos a pagar por fornecedor
   * 
   * @param idFornecedor - ID do fornecedor
   * @param page - Número da página (padrão: 1)
   * @param limit - Limite de registros por página (padrão: 10)
   * @returns Promise que resolve com resultado paginado
   * @throws ForbiddenException se usuário não tiver permissão 'tituloPagar.read'
   */
  @RequirePermission('tituloPagar.read')
  @Cacheable('tituloPagar:findByFornecedor:{0}:{1}:{2}', 600)
  async findByFornecedor(idFornecedor: number, page: number = 1, limit: number = 10): Promise<PaginatedResult<TituloPagarResponseDto>> {
    const entities = await this.tituloPagarRepository.findByFornecedor(idFornecedor);
    
    // Aplicar paginação manualmente (já que o repositório retorna array)
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedEntities = entities.slice(startIndex, endIndex);
    const total = entities.length;
    const totalPages = Math.ceil(total / limit);
    
    return {
      data: paginatedEntities.map(entity => this.mapper.toDto(entity)),
      total,
      page,
      limit,
      totalPages,
    };
  }

  /**
   * Busca títulos a pagar por status
   * 
   * @param status - Status do título
   * @param page - Número da página (padrão: 1)
   * @param limit - Limite de registros por página (padrão: 10)
   * @returns Promise que resolve com resultado paginado
   * @throws ForbiddenException se usuário não tiver permissão 'tituloPagar.read'
   */
  @RequirePermission('tituloPagar.read')
  @Cacheable('tituloPagar:findByStatus:{0}:{1}:{2}', 600)
  async findByStatus(status: StatusTituloPagar, page: number = 1, limit: number = 10): Promise<PaginatedResult<TituloPagarResponseDto>> {
    const entities = await this.tituloPagarRepository.findByStatus(status);
    
    // Aplicar paginação manualmente (já que o repositório retorna array)
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedEntities = entities.slice(startIndex, endIndex);
    const total = entities.length;
    const totalPages = Math.ceil(total / limit);
    
    return {
      data: paginatedEntities.map(entity => this.mapper.toDto(entity)),
      total,
      page,
      limit,
      totalPages,
    };
  }

  /**
   * Busca títulos a pagar por período de lançamento
   * 
   * @param dataInicio - Data inicial (formato YYYY-MM-DD)
   * @param dataFim - Data final (formato YYYY-MM-DD)
   * @param page - Número da página (padrão: 1)
   * @param limit - Limite de registros por página (padrão: 10)
   * @returns Promise que resolve com resultado paginado
   * @throws ForbiddenException se usuário não tiver permissão 'tituloPagar.read'
   */
  @RequirePermission('tituloPagar.read')
  @Cacheable('tituloPagar:findByDataLancamento:{0}:{1}:{2}:{3}', 600)
  async findByDataLancamento(dataInicio: string, dataFim: string, page: number = 1, limit: number = 10): Promise<PaginatedResult<TituloPagarResponseDto>> {
    const dataInicioDate = new Date(dataInicio);
    const dataFimDate = new Date(dataFim);
    const entities = await this.tituloPagarRepository.findByDataLancamento(dataInicioDate, dataFimDate);
    
    // Aplicar paginação manualmente (já que o repositório retorna array)
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedEntities = entities.slice(startIndex, endIndex);
    const total = entities.length;
    const totalPages = Math.ceil(total / limit);
    
    return {
      data: paginatedEntities.map(entity => this.mapper.toDto(entity)),
      total,
      page,
      limit,
      totalPages,
    };
  }

  /**
   * Cancela um título a pagar
   * Atualiza status do título e de todas as parcelas abertas para CANCELADO/CANCELADA
   * 
   * @param id - ID do título
   * @returns Promise que resolve com o DTO do título cancelado
   * @throws NotFoundException se título não for encontrado
   * @throws BusinessException se título já estiver totalmente baixado
   * @throws ForbiddenException se usuário não tiver permissão 'tituloPagar.delete'
   */
  @RequirePermission('tituloPagar.delete')
  @Transactional()
  @Auditable('TituloPagar')
  @CacheEvict('tituloPagar:getById:{0}')
  @CacheEvict('tituloPagar:list:*', true)
  @CacheEvict('tituloPagar:findByStatus:*', true)
  async cancelar(id: number): Promise<TituloPagarResponseDto> {
    // Verificar se título existe
    const existing = await this.tituloPagarRepository.findById(id);
    if (!existing) {
      throw new NotFoundException('Título a pagar', id);
    }

    // Validar se título pode ser cancelado
    if (existing.status === StatusTituloPagar.BAIXADO) {
      throw new BusinessException(
        'Não é possível cancelar um título totalmente baixado.',
        'TITULO_BAIXADO'
      );
    }

    if (existing.status === StatusTituloPagar.CANCELADO) {
      throw new BusinessException(
        'Título já está cancelado.',
        'TITULO_JA_CANCELADO'
      );
    }

    // Atualizar status do título
    const updated = await this.tituloPagarRepository.update(id, {
      status: StatusTituloPagar.CANCELADO,
    } as any);

    // Cancelar todas as parcelas abertas
    const parcelas = await this.parcelaTituloPagarRepository.findByTituloPagar(id);
    for (const parcela of parcelas) {
      if (parcela.status === StatusParcela.ABERTA) {
        await this.parcelaTituloPagarRepository.update(parcela.id, {
          status: StatusParcela.CANCELADA,
        } as any);
      }
    }

    // Registrar auditoria
    const context = getRequestContext();
    const userId = context?.getUserId();
    if (userId) {
      await this.auditService.logUpdate('tituloPagar', id, existing, { status: StatusTituloPagar.CANCELADO });
    }

    return this.mapper.toDto(updated);
  }

  /**
   * Valida relacionamentos cross-tenant (RN-014, RN-015, RN-016, RN-017, RN-018)
   * 
   * @param dto - DTO de criação
   * @param tenantId - ID do tenant atual
   * @throws NotFoundException se relacionamento não existir
   * @throws ForbiddenException se relacionamento não pertencer ao tenant
   */
  private async validarRelacionamentosCrossTenant(
    dto: CreateTituloPagarDto,
    tenantId: number
  ): Promise<void> {
    // RN-014: Validar Pessoa (Fornecedor)
    const fornecedor = await this.pessoaRepository.findById(dto.idFornecedor);
    if (!fornecedor) {
      throw new NotFoundException('Fornecedor não encontrado ou não pertence ao tenant atual');
    }
    if ((fornecedor as any).tenantId !== tenantId) {
      throw new ForbiddenException(
        'Fornecedor não pertence ao tenant atual',
        'CROSS_TENANT_ACCESS_DENIED'
      );
    }
    if (!(fornecedor as any).fornecedor_pessoa) {
      throw new BusinessException('Pessoa informada não é um fornecedor');
    }

    // RN-014: Validar Pessoa (Portador)
    const portador = await this.pessoaRepository.findById(dto.idPortador);
    if (!portador) {
      throw new NotFoundException('Portador não encontrado ou não pertence ao tenant atual');
    }
    if ((portador as any).tenantId !== tenantId) {
      throw new ForbiddenException(
        'Portador não pertence ao tenant atual',
        'CROSS_TENANT_ACCESS_DENIED'
      );
    }
    if (!(portador as any).portador_pessoa) {
      throw new BusinessException('Pessoa informada não é um portador');
    }

    // RN-014: Validar Pessoa (Produtor)
    const produtor = await this.pessoaRepository.findById(dto.idProdutor);
    if (!produtor) {
      throw new NotFoundException('Produtor não encontrado ou não pertence ao tenant atual');
    }
    if ((produtor as any).tenantId !== tenantId) {
      throw new ForbiddenException(
        'Produtor não pertence ao tenant atual',
        'CROSS_TENANT_ACCESS_DENIED'
      );
    }
    if (!(produtor as any).produtor_pessoa) {
      throw new BusinessException('Pessoa informada não é um produtor');
    }

    // RN-015: Validar Fazenda
    const fazenda = await this.fazendaRepository.findById(dto.idFazenda);
    if (!fazenda) {
      throw new NotFoundException('Fazenda não encontrada ou não pertence ao tenant atual');
    }
    if (fazenda.tenantId !== tenantId) {
      throw new ForbiddenException(
        'Fazenda não pertence ao tenant atual',
        'CROSS_TENANT_ACCESS_DENIED'
      );
    }

    // RN-016: Validar Safra
    const safra = await this.safraRepository.findById(dto.idSafra);
    if (!safra) {
      throw new NotFoundException('Safra não encontrada ou não pertence ao tenant atual');
    }
    if (safra.tenantId !== tenantId) {
      throw new ForbiddenException(
        'Safra não pertence ao tenant atual',
        'CROSS_TENANT_ACCESS_DENIED'
      );
    }

    // Moeda já é validada pelo DTO através do decorator @Validate(IsExists)
  }

  /**
   * Valida relacionamentos cross-tenant no update (apenas se alterados)
   * 
   * @param dto - DTO de atualização
   * @param tenantId - ID do tenant atual
   */
  private async validarRelacionamentosCrossTenantUpdate(
    dto: UpdateTituloPagarDto,
    tenantId: number
  ): Promise<void> {
    // Validar Fornecedor (se alterado)
    if (dto.idFornecedor !== undefined) {
      const fornecedor = await this.pessoaRepository.findById(dto.idFornecedor);
      if (!fornecedor) {
        throw new NotFoundException('Fornecedor não encontrado ou não pertence ao tenant atual');
      }
      if ((fornecedor as any).tenantId !== tenantId) {
        throw new ForbiddenException(
          'Fornecedor não pertence ao tenant atual',
          'CROSS_TENANT_ACCESS_DENIED'
        );
      }
      if (!(fornecedor as any).fornecedor_pessoa) {
        throw new BusinessException('Pessoa informada não é um fornecedor');
      }
    }

    // Validar Portador (se alterado)
    if (dto.idPortador !== undefined) {
      const portador = await this.pessoaRepository.findById(dto.idPortador);
      if (!portador) {
        throw new NotFoundException('Portador não encontrado ou não pertence ao tenant atual');
      }
      if ((portador as any).tenantId !== tenantId) {
        throw new ForbiddenException(
          'Portador não pertence ao tenant atual',
          'CROSS_TENANT_ACCESS_DENIED'
        );
      }
      if (!(portador as any).portador_pessoa) {
        throw new BusinessException('Pessoa informada não é um portador');
      }
    }

    // Validar Produtor (se alterado)
    if (dto.idProdutor !== undefined) {
      const produtor = await this.pessoaRepository.findById(dto.idProdutor);
      if (!produtor) {
        throw new NotFoundException('Produtor não encontrado ou não pertence ao tenant atual');
      }
      if ((produtor as any).tenantId !== tenantId) {
        throw new ForbiddenException(
          'Produtor não pertence ao tenant atual',
          'CROSS_TENANT_ACCESS_DENIED'
        );
      }
      if (!(produtor as any).produtor_pessoa) {
        throw new BusinessException('Pessoa informada não é um produtor');
      }
    }

    // Validar Fazenda (se alterada)
    if (dto.idFazenda !== undefined) {
      const fazenda = await this.fazendaRepository.findById(dto.idFazenda);
      if (!fazenda) {
        throw new NotFoundException('Fazenda não encontrada ou não pertence ao tenant atual');
      }
      if (fazenda.tenantId !== tenantId) {
        throw new ForbiddenException(
          'Fazenda não pertence ao tenant atual',
          'CROSS_TENANT_ACCESS_DENIED'
        );
      }
    }

    // Validar Safra (se alterada)
    if (dto.idSafra !== undefined) {
      const safra = await this.safraRepository.findById(dto.idSafra);
      if (!safra) {
        throw new NotFoundException('Safra não encontrada ou não pertence ao tenant atual');
      }
      if (safra.tenantId !== tenantId) {
        throw new ForbiddenException(
          'Safra não pertence ao tenant atual',
          'CROSS_TENANT_ACCESS_DENIED'
        );
      }
    }

    // Moeda já é validada pelo DTO através do decorator @Validate(IsExists)
  }

  /**
   * Cria um título a pagar completo com parcelas e rateios em uma única transação
   * 
   * @param dto - DTO completo com título, parcelas e rateios
   * @returns Promise que resolve com o DTO do título criado
   * @throws BusinessException se validações de negócio falharem
   * @throws ForbiddenException se usuário não tiver permissão 'tituloPagar.create'
   */
  @RequirePermission('tituloPagar.create')
  @Transactional()
  @Auditable('TituloPagar')
  @CacheEvict('tituloPagar:list:*', true)
  @CacheEvict('tituloPagar:findBySafra:*', true)
  @CacheEvict('tituloPagar:findByFazenda:*', true)
  @CacheEvict('tituloPagar:findByFornecedor:*', true)
  @CacheEvict('tituloPagar:findByStatus:*', true)
  async createCompleto(dto: CreateTituloPagarCompletoDto): Promise<TituloPagarResponseDto> {
    // Obter userId e tenantId do contexto
    const context = getRequestContext();
    if (!context || !context.getUserId()) {
      throw new ForbiddenException(
        'Usuário não autenticado. Não é possível criar título sem userId.',
        'USER_NOT_AUTHENTICATED'
      );
    }
    const userId = context.getUserId()!;
    const tenantId = context.getTenantId();
    if (!tenantId) {
      throw new ForbiddenException(
        'Tenant não identificado. Não é possível criar título sem tenantId.',
        'TENANT_NOT_IDENTIFIED'
      );
    }

    // Validar soma das parcelas
    const somaParcelas = dto.parcelas.reduce((sum, parcela) => sum + parcela.valorParcela, 0);
    if (Math.abs(somaParcelas - dto.valorTitulo) > 0.01) {
      throw new BusinessException(
        `A soma dos valores das parcelas (${somaParcelas.toFixed(2)}) deve ser igual ao valor do título (${dto.valorTitulo.toFixed(2)}).`,
        'SOMA_PARCELAS_DIFERENTE_VALOR_TITULO'
      );
    }

    // Validar soma dos rateios de plano de contas (se informados)
    if (dto.rateiosPlanoConta && dto.rateiosPlanoConta.length > 0) {
      const somaRateiosPlanoConta = dto.rateiosPlanoConta.reduce((sum, rateio) => sum + rateio.valorRateio, 0);
      if (Math.abs(somaRateiosPlanoConta - dto.valorTitulo) > 0.01) {
        throw new BusinessException(
          `A soma dos valores dos rateios de plano de contas (${somaRateiosPlanoConta.toFixed(2)}) deve ser igual ao valor do título (${dto.valorTitulo.toFixed(2)}).`,
          'SOMA_RATEIOS_PLANO_CONTA_DIFERENTE_VALOR_TITULO'
        );
      }
    }

    // Validar soma dos rateios de centro de custo (se informados)
    if (dto.rateiosCentroCusto && dto.rateiosCentroCusto.length > 0) {
      const somaRateiosCentroCusto = dto.rateiosCentroCusto.reduce((sum, rateio) => sum + rateio.valorRateio, 0);
      if (Math.abs(somaRateiosCentroCusto - dto.valorTitulo) > 0.01) {
        throw new BusinessException(
          `A soma dos valores dos rateios de centro de custo (${somaRateiosCentroCusto.toFixed(2)}) deve ser igual ao valor do título (${dto.valorTitulo.toFixed(2)}).`,
          'SOMA_RATEIOS_CENTRO_CUSTO_DIFERENTE_VALOR_TITULO'
        );
      }
    }

    // RN-008: Validar unicidade do número do título por tenant
    const tituloExistente = await this.tituloPagarRepository.findByNumeroTitulo(dto.numeroTitulo);
    if (tituloExistente) {
      throw new BusinessException(
        `Já existe um título com o número "${dto.numeroTitulo}" para este tenant.`,
        'NUMERO_TITULO_DUPLICADO'
      );
    }

    // RN-014, RN-015, RN-016: Validações cross-tenant
    await this.validarRelacionamentosCrossTenant(dto, tenantId);

    // RN-009: Conversão de moeda (se necessário)
    const valoresConvertidos = await this.moedaConversionService.converterParaMoedaPadrao(
      dto.idMoeda,
      dto.valorTitulo,
      dto.dataLancamento,
      tenantId
    );

    // Converter DTO do título para entidade
    const tituloEntity = await this.mapper.toEntity(dto);

    // Adicionar campos automáticos
    (tituloEntity as any).usercreation = userId;
    (tituloEntity as any).datecreation = new Date();
    (tituloEntity as any).tenantId = tenantId;
    (tituloEntity as any).status = dto.status || StatusTituloPagar.ABERTO;
    (tituloEntity as any).impostoRenda = dto.impostoRenda ?? false;
    (tituloEntity as any).quantidadeParcelas = dto.parcelas.length;

    // Adicionar valores convertidos
    if (valoresConvertidos.valorMoedaOriginal !== undefined) {
      (tituloEntity as any).valorTituloMoedaOriginal = valoresConvertidos.valorMoedaOriginal;
    }
    if (valoresConvertidos.valorMoedaPadrao !== undefined) {
      (tituloEntity as any).valorTituloMoedaPadrao = valoresConvertidos.valorMoedaPadrao;
    }

    // Criar título via repositório
    const createdTitulo = await this.tituloPagarRepository.create(tituloEntity as any);

    // Criar parcelas
    for (const parcelaDto of dto.parcelas) {
      const parcelaComTitulo: CreateParcelaTituloPagarDto = {
        ...parcelaDto,
        idTituloPagar: createdTitulo.id,
      };
      const parcelaEntity = await this.parcelaMapper.toEntity(parcelaComTitulo);
      (parcelaEntity as any).usercreation = userId;
      (parcelaEntity as any).datecreation = new Date();
      (parcelaEntity as any).tenantId = tenantId;
      (parcelaEntity as any).status = parcelaDto.status || StatusParcela.ABERTA;
      
      await this.parcelaTituloPagarRepository.create(parcelaEntity as any);
    }

    // Criar rateios de plano de contas (se informados)
    if (dto.rateiosPlanoConta && dto.rateiosPlanoConta.length > 0) {
      for (const rateioDto of dto.rateiosPlanoConta) {
        const rateioComTitulo: CreateRateioPlanoContaTituloPagarDto = {
          ...rateioDto,
          idTituloPagar: createdTitulo.id,
        };
        const rateioEntity = await this.rateioPlanoContaMapper.toEntity(rateioComTitulo);
        (rateioEntity as any).usercreation = userId;
        (rateioEntity as any).datecreation = new Date();
        (rateioEntity as any).tenantId = tenantId;
        
        // Calcular percentual se não informado
        if (!rateioEntity.percentualRateio) {
          (rateioEntity as any).percentualRateio = (rateioDto.valorRateio / dto.valorTitulo) * 100;
        }
        
        await this.rateioPlanoContaRepository.create(rateioEntity as any);
      }
    }

    // Criar rateios de centro de custo (se informados)
    if (dto.rateiosCentroCusto && dto.rateiosCentroCusto.length > 0) {
      for (const rateioDto of dto.rateiosCentroCusto) {
        const rateioComTitulo: CreateRateioCentroCustoTituloPagarDto = {
          ...rateioDto,
          idTituloPagar: createdTitulo.id,
        };
        const rateioEntity = await this.rateioCentroCustoMapper.toEntity(rateioComTitulo);
        (rateioEntity as any).usercreation = userId;
        (rateioEntity as any).datecreation = new Date();
        (rateioEntity as any).tenantId = tenantId;
        
        // Calcular percentual se não informado
        if (!rateioEntity.percentualRateio) {
          (rateioEntity as any).percentualRateio = (rateioDto.valorRateio / dto.valorTitulo) * 100;
        }
        
        await this.rateioCentroCustoRepository.create(rateioEntity as any);
      }
    }

    // Registrar auditoria
    await this.auditService.logCreate('tituloPagar', userId, dto);

    // Buscar título completo com relacionamentos para retornar
    const tituloCompleto = await this.tituloPagarRepository.findById(createdTitulo.id);

    // Retornar como DTO
    return this.mapper.toDto(tituloCompleto!);
  }

}
