import { Injectable, Inject } from '../../../core/di';
import { TYPES } from '../../../core/di/types';
import { ITalhaoApplicationService } from './ITalhaoApplicationService';
import { ITalhaoRepository } from '../../../infrastructure/repository/ITalhaoRepository';
import { INdviService, NdviSatelliteResponse } from '../ndvi/INdviService';
import { CreateTalhaoDto } from '../../dto/talhao/CreateTalhaoDto';
import { UpdateTalhaoDto } from '../../dto/talhao/UpdateTalhaoDto';
import { TalhaoResponseDto } from '../../dto/talhao/TalhaoResponseDto';
import { TalhaoMapper } from '../../mappers/TalhaoMapper';
import { Auditable } from '../../../core/audit';
import { Cacheable, CacheEvict } from '../../../core/cache';
import { RequirePermission } from '../../../core/authorization';
import { Transactional } from '../../../core/unitofwork/Transactional';
import { PaginatedResult } from '../../../core/repository/types';
import { NotFoundException } from '../../../core/exceptions/NotFoundException';
import { BadRequestException } from '../../../core/exceptions/BadRequestException';
import { getRequestContext } from '../../../core/authorization/helpers';

/**
 * Application Service para Talhao
 *
 * Implementa a lógica de negócio para operações de talhões.
 */
@Injectable()
export class TalhaoApplicationService implements ITalhaoApplicationService {
  constructor(
    @Inject(TYPES.ITalhaoRepository) private talhaoRepository: ITalhaoRepository,
    @Inject(TYPES.INdviService) private ndviService: INdviService,
    private mapper: TalhaoMapper
  ) {}

  /**
   * Busca dados NDVI/satélite para um talhão
   */
  @RequirePermission('talhao.read')
  async getNdviData(talhaoId: number, startDate?: number, endDate?: number): Promise<NdviSatelliteResponse> {
    const talhao = await this.talhaoRepository.findById(talhaoId);
    if (!talhao) {
      throw new NotFoundException('Talhão não encontrado');
    }

    const now = Math.floor(Date.now() / 1000);
    const thirtyDaysAgo = now - (30 * 24 * 60 * 60);
    const start = startDate || thirtyDaysAgo;
    const end = endDate || now;

    if (!talhao.geometry) {
      return {
        talhaoId,
        images: [],
        provider: this.ndviService.isConfigured() ? 'agromonitoring' : 'none',
      };
    }

    const images = await this.ndviService.searchImages(talhao.geometry, start, end);

    return {
      talhaoId,
      images,
      provider: this.ndviService.isConfigured() ? 'agromonitoring' : 'none',
    };
  }

  /**
   * Busca talhões por fazenda com culturas associadas
   */
  @RequirePermission('talhao.read')
  async findByFazenda(fazendaId: number): Promise<TalhaoResponseDto[]> {
    const talhoes = await this.talhaoRepository.findByFazenda(fazendaId);
    return talhoes.map(t => this.mapper.toDto(t));
  }

  /**
   * Lista todos os talhões sem paginação (para selects/combos)
   */
  @RequirePermission('talhao.read')
  @Cacheable('talhao:listAll', 3600)
  async listAll(): Promise<TalhaoResponseDto[]> {
    const entities = await this.talhaoRepository.findAll();
    return entities.map(item => this.mapper.toDto(item));
  }

  /**
   * Lista todos os talhões com paginação
   */
  @RequirePermission('talhao.read')
  @Cacheable('talhao:list:{0}:{1}', 3600)
  async list(page: number = 1, limit: number = 10): Promise<PaginatedResult<TalhaoResponseDto>> {
    const result = await this.talhaoRepository.findAllPaginated(page, limit);
    return {
      ...result,
      data: result.data.map(item => this.mapper.toDto(item)),
    };
  }

  /**
   * Busca um talhão por ID
   */
  @RequirePermission('talhao.read')
  @Cacheable('talhao:getById', 3600)
  async getById(id: number | string): Promise<TalhaoResponseDto | null> {
    const talhao = await this.talhaoRepository.findById(id);
    return talhao ? this.mapper.toDto(talhao) : null;
  }

  /**
   * Cria um novo talhão
   */
  @RequirePermission('talhao.create')
  @Auditable('Talhao')
  @CacheEvict('talhao:list')
  @Transactional()
  async create(dto: CreateTalhaoDto): Promise<TalhaoResponseDto> {
    const context = getRequestContext();
    if (!context) {
      throw new BadRequestException('Contexto não disponível');
    }

    const userId = context.getUserId();
    const tenantId = context.getTenantId();

    if (!userId || !tenantId) {
      throw new BadRequestException('Usuário não autenticado ou tenant não identificado');
    }

    const entityData = await this.mapper.toEntity(dto);

    (entityData as any).usercreation = userId;
    (entityData as any).tenantId = tenantId;

    const talhao = await this.talhaoRepository.create(entityData);

    return this.mapper.toDto(talhao);
  }

  /**
   * Atualiza um talhão existente
   */
  @RequirePermission('talhao.update')
  @Auditable('Talhao')
  @CacheEvict('talhao:list:*', true)
  @CacheEvict('talhao:getById:*', true)
  @Transactional()
  async update(id: number | string, dto: UpdateTalhaoDto): Promise<TalhaoResponseDto> {
    const talhao = await this.talhaoRepository.findById(id);
    if (!talhao) {
      throw new NotFoundException('Talhão não encontrado');
    }

    const entityData = await this.mapper.toEntity(dto);
    const updated = await this.talhaoRepository.update(id, entityData);
    return this.mapper.toDto(updated);
  }

  /**
   * Remove um talhão
   */
  @RequirePermission('talhao.delete')
  @Auditable('Talhao')
  @CacheEvict('talhao:list:*', true)
  @CacheEvict('talhao:getById:*', true)
  @Transactional()
  async delete(id: number | string): Promise<boolean> {
    const talhao = await this.talhaoRepository.findById(id);
    if (!talhao) {
      return false;
    }

    await this.talhaoRepository.delete(id);
    return true;
  }
}
