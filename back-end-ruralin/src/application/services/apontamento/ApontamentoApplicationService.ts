import { Injectable, Inject } from '../../../core/di';
import { TYPES } from '../../../core/di/types';
import { IApontamentoApplicationService } from './IApontamentoApplicationService';
import { IApontamentoRepository } from '../../../infrastructure/repository/IApontamentoRepository';
import { CreateApontamentoDto } from '../../dto/apontamento/CreateApontamentoDto';
import { UpdateApontamentoDto } from '../../dto/apontamento/UpdateApontamentoDto';
import { ApontamentoResponseDto } from '../../dto/apontamento/ApontamentoResponseDto';
import { ApontamentoMapper } from '../../mappers/ApontamentoMapper';
import { Auditable } from '../../../core/audit';
import { Cacheable, CacheEvict } from '../../../core/cache';
import { RequirePermission } from '../../../core/authorization';
import { Transactional } from '../../../core/unitofwork/Transactional';
import { PaginatedResult } from '../../../core/repository/types';
import { NotFoundException } from '../../../core/exceptions/NotFoundException';
import { BadRequestException } from '../../../core/exceptions/BadRequestException';
import { getRequestContext } from '../../../core/authorization/helpers';

/**
 * Application Service para Apontamento
 *
 * Implementa a logica de negocio para operacoes de apontamento de atividades agricolas.
 */
@Injectable()
export class ApontamentoApplicationService implements IApontamentoApplicationService {
  constructor(
    @Inject(TYPES.IApontamentoRepository) private apontamentoRepository: IApontamentoRepository,
    private mapper: ApontamentoMapper
  ) {}

  /**
   * Lista todos os apontamentos com paginacao
   */
  @RequirePermission('apontamento.read')
  @Cacheable('apontamento:list:{0}:{1}', 3600)
  async list(page: number = 1, limit: number = 10): Promise<PaginatedResult<ApontamentoResponseDto>> {
    const result = await this.apontamentoRepository.findAllPaginated(page, limit);
    return {
      ...result,
      data: result.data.map(item => this.mapper.toDto(item)),
    };
  }

  /**
   * Busca um apontamento por ID
   */
  @RequirePermission('apontamento.read')
  @Cacheable('apontamento:getById', 3600)
  async getById(id: number | string): Promise<ApontamentoResponseDto | null> {
    const apontamento = await this.apontamentoRepository.findById(id);
    return apontamento ? this.mapper.toDto(apontamento) : null;
  }

  /**
   * Cria um novo apontamento
   */
  @RequirePermission('apontamento.create')
  @Auditable('Apontamento')
  @CacheEvict('apontamento:list')
  @Transactional()
  async create(dto: CreateApontamentoDto): Promise<ApontamentoResponseDto> {
    const context = getRequestContext();
    if (!context) {
      throw new BadRequestException('Contexto nao disponivel');
    }

    const userId = context.getUserId();
    const tenantId = context.getTenantId();

    if (!userId || !tenantId) {
      throw new BadRequestException('Usuario nao autenticado ou tenant nao identificado');
    }

    const entityData = await this.mapper.toEntity(dto);

    (entityData as any).usercreation = userId;
    (entityData as any).tenantId = tenantId;

    const apontamento = await this.apontamentoRepository.create(entityData);

    return this.mapper.toDto(apontamento);
  }

  /**
   * Atualiza um apontamento existente
   */
  @RequirePermission('apontamento.update')
  @Auditable('Apontamento')
  @CacheEvict('apontamento:list:*', true)
  @CacheEvict('apontamento:getById:*', true)
  @Transactional()
  async update(id: number | string, dto: UpdateApontamentoDto): Promise<ApontamentoResponseDto> {
    const apontamento = await this.apontamentoRepository.findById(id);
    if (!apontamento) {
      throw new NotFoundException('Apontamento nao encontrado');
    }

    const entityData = await this.mapper.toEntity(dto);
    const updated = await this.apontamentoRepository.update(id, entityData);
    return this.mapper.toDto(updated);
  }

  /**
   * Remove um apontamento
   */
  @RequirePermission('apontamento.delete')
  @Auditable('Apontamento')
  @CacheEvict('apontamento:list:*', true)
  @CacheEvict('apontamento:getById:*', true)
  @Transactional()
  async delete(id: number | string): Promise<boolean> {
    const apontamento = await this.apontamentoRepository.findById(id);
    if (!apontamento) {
      return false;
    }

    await this.apontamentoRepository.delete(id);
    return true;
  }
}
