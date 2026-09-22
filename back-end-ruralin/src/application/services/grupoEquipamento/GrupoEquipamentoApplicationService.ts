import { Injectable, Inject } from '../../../core/di';
import { TYPES } from '../../../core/di/types';
import { IGrupoEquipamentoApplicationService } from './IGrupoEquipamentoApplicationService';
import { IGrupoEquipamentoRepository } from '../../../infrastructure/repository/IGrupoEquipamentoRepository';
import { CreateGrupoEquipamentoDto } from '../../dto/grupoEquipamento/CreateGrupoEquipamentoDto';
import { UpdateGrupoEquipamentoDto } from '../../dto/grupoEquipamento/UpdateGrupoEquipamentoDto';
import { GrupoEquipamentoResponseDto } from '../../dto/grupoEquipamento/GrupoEquipamentoResponseDto';
import { GrupoEquipamentoMapper } from '../../mappers/GrupoEquipamentoMapper';
import { Auditable } from '../../../core/audit';
import { Cacheable, CacheEvict } from '../../../core/cache';
import { RequirePermission } from '../../../core/authorization';
import { Transactional } from '../../../core/unitofwork/Transactional';
import { PaginatedResult } from '../../../core/repository/types';
import { NotFoundException } from '../../../core/exceptions/NotFoundException';

/**
 * Application Service para GrupoEquipamento
 *
 * Implementa a lógica de negócio para operações com grupos de equipamento.
 */
@Injectable()
export class GrupoEquipamentoApplicationService implements IGrupoEquipamentoApplicationService {
  constructor(
    @Inject(TYPES.IGrupoEquipamentoRepository) private grupoEquipamentoRepository: IGrupoEquipamentoRepository,
    private mapper: GrupoEquipamentoMapper
  ) {}

  /**
   * Lista todos os grupos de equipamento com paginação
   */
  @RequirePermission('grupoEquipamento.read')
  @Cacheable('grupoEquipamento:list:{0}:{1}', 3600)
  async list(page: number = 1, limit: number = 10): Promise<PaginatedResult<GrupoEquipamentoResponseDto>> {
    const result = await this.grupoEquipamentoRepository.findAllPaginated(page, limit);
    return {
      ...result,
      data: result.data.map(item => this.mapper.toDto(item)),
    };
  }

  /**
   * Busca um grupo de equipamento por ID
   */
  @RequirePermission('grupoEquipamento.read')
  @Cacheable('grupoEquipamento:getById', 3600)
  async getById(id: number | string): Promise<GrupoEquipamentoResponseDto | null> {
    const grupoEquipamento = await this.grupoEquipamentoRepository.findById(id);
    return grupoEquipamento ? this.mapper.toDto(grupoEquipamento) : null;
  }

  /**
   * Cria um novo grupo de equipamento
   */
  @RequirePermission('grupoEquipamento.create')
  @Auditable('GrupoEquipamento')
  @CacheEvict('grupoEquipamento:list')
  @Transactional()
  async create(dto: CreateGrupoEquipamentoDto): Promise<GrupoEquipamentoResponseDto> {
    const entityData = await this.mapper.toEntity(dto);
    const grupoEquipamento = await this.grupoEquipamentoRepository.create(entityData);
    return this.mapper.toDto(grupoEquipamento);
  }

  /**
   * Atualiza um grupo de equipamento existente
   */
  @RequirePermission('grupoEquipamento.update')
  @Auditable('GrupoEquipamento')
  @CacheEvict('grupoEquipamento:list:*', true)
  @CacheEvict('grupoEquipamento:getById:*', true)
  @Transactional()
  async update(id: number | string, dto: UpdateGrupoEquipamentoDto): Promise<GrupoEquipamentoResponseDto> {
    const grupoEquipamento = await this.grupoEquipamentoRepository.findById(id);
    if (!grupoEquipamento) {
      throw new NotFoundException('Grupo de equipamento não encontrado');
    }

    const entityData = await this.mapper.toEntity(dto);
    const updated = await this.grupoEquipamentoRepository.update(id, entityData);
    return this.mapper.toDto(updated);
  }

  /**
   * Remove um grupo de equipamento
   */
  @RequirePermission('grupoEquipamento.delete')
  @Auditable('GrupoEquipamento')
  @CacheEvict('grupoEquipamento:list:*', true)
  @CacheEvict('grupoEquipamento:getById:*', true)
  @Transactional()
  async delete(id: number | string): Promise<boolean> {
    const grupoEquipamento = await this.grupoEquipamentoRepository.findById(id);
    if (!grupoEquipamento) {
      return false;
    }

    await this.grupoEquipamentoRepository.delete(id);
    return true;
  }
}
