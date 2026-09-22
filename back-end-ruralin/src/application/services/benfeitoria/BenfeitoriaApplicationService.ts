import { Injectable, Inject } from '../../../core/di';
import { TYPES } from '../../../core/di/types';
import { IBenfeitoriaApplicationService } from './IBenfeitoriaApplicationService';
import { IBenfeitoriaRepository } from '../../../infrastructure/repository/IBenfeitoriaRepository';
import { CreateBenfeitoriaDto } from '../../dto/benfeitoria/CreateBenfeitoriaDto';
import { UpdateBenfeitoriaDto } from '../../dto/benfeitoria/UpdateBenfeitoriaDto';
import { BenfeitoriaResponseDto } from '../../dto/benfeitoria/BenfeitoriaResponseDto';
import { BenfeitoriaMapper } from '../../mappers/BenfeitoriaMapper';
import { Auditable } from '../../../core/audit';
import { Cacheable, CacheEvict } from '../../../core/cache';
import { RequirePermission } from '../../../core/authorization';
import { Transactional } from '../../../core/unitofwork/Transactional';
import { PaginatedResult } from '../../../core/repository/types';
import { NotFoundException } from '../../../core/exceptions/NotFoundException';
import { BadRequestException } from '../../../core/exceptions/BadRequestException';
import { getRequestContext } from '../../../core/authorization/helpers';

/**
 * Application Service para Benfeitoria
 *
 * Implementa a lógica de negócio para operações de benfeitoria.
 * CRUD simples sem lógica de negócio adicional.
 */
@Injectable()
export class BenfeitoriaApplicationService implements IBenfeitoriaApplicationService {
  constructor(
    @Inject(TYPES.IBenfeitoriaRepository) private benfeitoriaRepository: IBenfeitoriaRepository,
    private mapper: BenfeitoriaMapper
  ) {}

  /**
   * Lista todas as benfeitorias com paginação
   */
  @RequirePermission('benfeitoria.read')
  @Cacheable('benfeitoria:list:{0}:{1}', 3600)
  async list(page: number = 1, limit: number = 10): Promise<PaginatedResult<BenfeitoriaResponseDto>> {
    const result = await this.benfeitoriaRepository.findAllPaginated(page, limit);
    return {
      ...result,
      data: result.data.map(item => this.mapper.toDto(item)),
    };
  }

  /**
   * Busca uma benfeitoria por ID
   */
  @RequirePermission('benfeitoria.read')
  @Cacheable('benfeitoria:getById', 3600)
  async getById(id: number | string): Promise<BenfeitoriaResponseDto | null> {
    const benfeitoria = await this.benfeitoriaRepository.findById(id);
    return benfeitoria ? this.mapper.toDto(benfeitoria) : null;
  }

  /**
   * Cria uma nova benfeitoria
   */
  @RequirePermission('benfeitoria.create')
  @Auditable('Benfeitoria')
  @CacheEvict('benfeitoria:list')
  @Transactional()
  async create(dto: CreateBenfeitoriaDto): Promise<BenfeitoriaResponseDto> {
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

    const benfeitoria = await this.benfeitoriaRepository.create(entityData);

    return this.mapper.toDto(benfeitoria);
  }

  /**
   * Atualiza uma benfeitoria existente
   */
  @RequirePermission('benfeitoria.update')
  @Auditable('Benfeitoria')
  @CacheEvict('benfeitoria:list:*', true)
  @CacheEvict('benfeitoria:getById:*', true)
  @Transactional()
  async update(id: number | string, dto: UpdateBenfeitoriaDto): Promise<BenfeitoriaResponseDto> {
    const benfeitoria = await this.benfeitoriaRepository.findById(id);
    if (!benfeitoria) {
      throw new NotFoundException('Benfeitoria', String(id));
    }

    const entityData = await this.mapper.toEntity(dto);
    const updated = await this.benfeitoriaRepository.update(id, entityData);
    return this.mapper.toDto(updated);
  }

  /**
   * Remove uma benfeitoria
   */
  @RequirePermission('benfeitoria.delete')
  @Auditable('Benfeitoria')
  @CacheEvict('benfeitoria:list:*', true)
  @CacheEvict('benfeitoria:getById:*', true)
  @Transactional()
  async delete(id: number | string): Promise<boolean> {
    const benfeitoria = await this.benfeitoriaRepository.findById(id);
    if (!benfeitoria) {
      return false;
    }

    await this.benfeitoriaRepository.delete(id);
    return true;
  }
}
