import { Injectable, Inject } from '../../../core/di';
import { TYPES } from '../../../core/di/types';
import { IServicoAgricolaApplicationService } from './IServicoAgricolaApplicationService';
import { IServicoAgricolaRepository } from '../../../infrastructure/repository/IServicoAgricolaRepository';
import { CreateServicoAgricolaDto } from '../../dto/servicoAgricola/CreateServicoAgricolaDto';
import { UpdateServicoAgricolaDto } from '../../dto/servicoAgricola/UpdateServicoAgricolaDto';
import { ServicoAgricolaResponseDto } from '../../dto/servicoAgricola/ServicoAgricolaResponseDto';
import { ServicoAgricolaMapper } from '../../mappers/ServicoAgricolaMapper';
import { Auditable } from '../../../core/audit';
import { Cacheable, CacheEvict } from '../../../core/cache';
import { RequirePermission } from '../../../core/authorization';
import { Transactional } from '../../../core/unitofwork/Transactional';
import { PaginatedResult } from '../../../core/repository/types';
import { NotFoundException, ForbiddenException } from '../../../core/exceptions';
import { getRequestContext } from '../../../core/authorization/helpers';

/**
 * Application Service para ServicoAgricola
 */
@Injectable()
export class ServicoAgricolaApplicationService implements IServicoAgricolaApplicationService {
  constructor(
    @Inject(TYPES.IServicoAgricolaRepository) private servicoAgricolaRepository: IServicoAgricolaRepository,
    private mapper: ServicoAgricolaMapper
  ) {}

  @RequirePermission('servicoAgricola.read')
  @Cacheable('servicoAgricola:list:{0}:{1}', 3600)
  async list(page: number = 1, limit: number = 10): Promise<PaginatedResult<ServicoAgricolaResponseDto>> {
    const result = await this.servicoAgricolaRepository.findAllPaginated(page, limit);
    return {
      ...result,
      data: result.data.map(item => this.mapper.toDto(item)),
    };
  }

  @RequirePermission('servicoAgricola.read')
  @Cacheable('servicoAgricola:getById', 3600)
  async getById(id: number | string): Promise<ServicoAgricolaResponseDto | null> {
    const servicoAgricola = await this.servicoAgricolaRepository.findById(id);
    return servicoAgricola ? this.mapper.toDto(servicoAgricola) : null;
  }

  @RequirePermission('servicoAgricola.create')
  @Auditable('ServicoAgricola')
  @CacheEvict('servicoAgricola:list:*', true)
  @Transactional()
  async create(dto: CreateServicoAgricolaDto): Promise<ServicoAgricolaResponseDto> {
    const context = getRequestContext();
    if (!context || !context.getUserId() || !context.getTenantId()) {
      throw new ForbiddenException(
        'Usuário não autenticado ou tenant não identificado.',
        'USER_NOT_AUTHENTICATED'
      );
    }
    const userId = context.getUserId()!;
    const tenantId = context.getTenantId()!;

    const entityData = await this.mapper.toEntity(dto);
    
    const entityWithAudit = {
      ...entityData,
      usercreation: userId,
      datecreation: new Date(),
    };

    const servicoAgricola = await this.servicoAgricolaRepository.create(entityWithAudit);
    return this.mapper.toDto(servicoAgricola);
  }

  @RequirePermission('servicoAgricola.update')
  @Auditable('ServicoAgricola')
  @CacheEvict('servicoAgricola:list:*', true)
  @CacheEvict('servicoAgricola:getById:*', true)
  @Transactional()
  async update(id: number | string, dto: UpdateServicoAgricolaDto): Promise<ServicoAgricolaResponseDto> {
    const servicoAgricola = await this.servicoAgricolaRepository.findById(id);
    if (!servicoAgricola) {
      throw new NotFoundException('Serviço agrícola não encontrado');
    }

    const entityData = await this.mapper.toEntity(dto);
    const updated = await this.servicoAgricolaRepository.update(id, entityData);
    return this.mapper.toDto(updated);
  }

  @RequirePermission('servicoAgricola.delete')
  @Auditable('ServicoAgricola')
  @CacheEvict('servicoAgricola:list:*', true)
  @CacheEvict('servicoAgricola:getById:*', true)
  @Transactional()
  async delete(id: number | string): Promise<boolean> {
    const servicoAgricola = await this.servicoAgricolaRepository.findById(id);
    if (!servicoAgricola) {
      return false;
    }
    
    await this.servicoAgricolaRepository.delete(id);
    return true;
  }
}
