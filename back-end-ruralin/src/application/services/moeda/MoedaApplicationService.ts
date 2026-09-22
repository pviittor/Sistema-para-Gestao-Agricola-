import { Injectable, Inject } from '../../../core/di';
import { TYPES } from '../../../core/di/types';
import { IMoedaApplicationService } from './IMoedaApplicationService';
import { IMoedaRepository } from '../../../infrastructure/repository/IMoedaRepository';
import { CreateMoedaDto } from '../../dto/moeda/CreateMoedaDto';
import { UpdateMoedaDto } from '../../dto/moeda/UpdateMoedaDto';
import { MoedaResponseDto } from '../../dto/moeda/MoedaResponseDto';
import { MoedaMapper } from '../../mappers/MoedaMapper';
import { Auditable } from '../../../core/audit';
import { Cacheable, CacheEvict } from '../../../core/cache';
import { RequirePermission } from '../../../core/authorization';
import { Transactional } from '../../../core/unitofwork/Transactional';
import { PaginatedResult } from '../../../core/repository/types';
import { ForbiddenException } from '../../../core/exceptions';
import { getRequestContext } from '../../../core/authorization/helpers';

/**
 * Application Service para Moeda
 */
@Injectable()
export class MoedaApplicationService implements IMoedaApplicationService {
  constructor(
    @Inject(TYPES.IMoedaRepository) private moedaRepository: IMoedaRepository,
    private mapper: MoedaMapper
  ) {}

  @RequirePermission('moeda.read')
  @Cacheable('moeda:list:{0}:{1}', 3600)
  async list(page: number = 1, limit: number = 10): Promise<PaginatedResult<MoedaResponseDto>> {
    const result = await this.moedaRepository.findAllPaginated(page, limit);
    return {
      ...result,
      data: result.data.map(item => this.mapper.toDto(item)),
    };
  }

  @RequirePermission('moeda.read')
  @Cacheable('moeda:getById', 3600)
  async getById(id: number | string): Promise<MoedaResponseDto | null> {
    const moeda = await this.moedaRepository.findById(id);
    return moeda ? this.mapper.toDto(moeda) : null;
  }

  @RequirePermission('moeda.create')
  @Auditable('Moeda')
  @CacheEvict('moeda:list:*', true)
  @Transactional()
  async create(dto: CreateMoedaDto): Promise<MoedaResponseDto> {
    const context = getRequestContext();
    if (!context || !context.getUserId()) {
      throw new ForbiddenException(
        'Usuário não autenticado. Não é possível criar moeda sem userId.',
        'USER_NOT_AUTHENTICATED'
      );
    }
    const userId = context.getUserId()!;

    const entityData = await this.mapper.toEntity(dto);
    
    const entityWithAudit = {
      ...entityData,
      usercreation: userId,
      datecreation: new Date(),
    };

    const moeda = await this.moedaRepository.create(entityWithAudit);
    return this.mapper.toDto(moeda);
  }

  @RequirePermission('moeda.update')
  @Auditable('Moeda')
  @CacheEvict('moeda:list:*', true)
  @CacheEvict('moeda:getById:*', true)
  @Transactional()
  async update(id: number | string, dto: UpdateMoedaDto): Promise<MoedaResponseDto> {
    const moeda = await this.moedaRepository.findById(id);
    if (!moeda) {
      throw new Error('Moeda não encontrada');
    }
    
    const entityData = await this.mapper.toEntity(dto);
    const updated = await this.moedaRepository.update(id, entityData);
    return this.mapper.toDto(updated);
  }

  @RequirePermission('moeda.delete')
  @Auditable('Moeda')
  @CacheEvict('moeda:list:*', true)
  @CacheEvict('moeda:getById:*', true)
  @Transactional()
  async delete(id: number | string): Promise<boolean> {
    const moeda = await this.moedaRepository.findById(id);
    if (!moeda) {
      return false;
    }
    
    await this.moedaRepository.delete(id);
    return true;
  }
}
