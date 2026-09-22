import { Injectable, Inject } from '../../../core/di';
import { TYPES } from '../../../core/di/types';
import { RequirePermission } from '../../../core/authorization/RequirePermission';
import { Transactional } from '../../../core/unitofwork/Transactional';
import { Cacheable } from '../../../core/cache/Cacheable';
import { CacheEvict } from '../../../core/cache/CacheEvict';
import { NotFoundException } from '../../../core/exceptions/NotFoundException';
import { INumeracaoReciboRepository } from '../../../infrastructure/repository/INumeracaoReciboRepository';
import { INumeracaoReciboApplicationService } from './INumeracaoReciboApplicationService';
import { NumeracaoReciboMapper } from '../../mappers/NumeracaoReciboMapper';
import { CreateNumeracaoReciboDto, UpdateNumeracaoReciboDto, NumeracaoReciboResponseDto } from '../../dto/numeracaoRecibo';
import { PaginatedResult } from '../../../core/repository/types';
import { getRequestContext } from '../../../core/authorization/helpers';

@Injectable()
export class NumeracaoReciboApplicationService implements INumeracaoReciboApplicationService {
  constructor(
    @Inject(TYPES.INumeracaoReciboRepository) private readonly repository: INumeracaoReciboRepository,
    private readonly mapper: NumeracaoReciboMapper
  ) {}

  @RequirePermission('numeracaoRecibo.read')
  @Cacheable('numeracaoRecibo:list:{0}:{1}', 300)
  async list(page = 1, limit = 100): Promise<PaginatedResult<NumeracaoReciboResponseDto>> {
    const result = await this.repository.findAllPaginated(page, limit);
    return { ...result, data: result.data.map((e: any) => this.mapper.toResponseDto(e)) };
  }

  @RequirePermission('numeracaoRecibo.read')
  async findById(id: number): Promise<NumeracaoReciboResponseDto> {
    const entity = await this.repository.findById(id);
    if (!entity) throw new NotFoundException('Numeração de recibo não encontrada');
    return this.mapper.toResponseDto(entity);
  }

  @RequirePermission('numeracaoRecibo.create')
  @Transactional()
  @CacheEvict('numeracaoRecibo:*', true)
  async create(dto: CreateNumeracaoReciboDto): Promise<NumeracaoReciboResponseDto> {
    const context = getRequestContext();
    const entity = this.mapper.toEntity(dto);
    (entity as any).tenantId = context?.getTenantId();
    const created = await this.repository.create(entity as any);
    return this.mapper.toResponseDto(created);
  }

  @RequirePermission('numeracaoRecibo.update')
  @Transactional()
  @CacheEvict('numeracaoRecibo:*', true)
  async update(id: number, dto: UpdateNumeracaoReciboDto): Promise<NumeracaoReciboResponseDto> {
    const existing = await this.repository.findById(id);
    if (!existing) throw new NotFoundException('Numeração de recibo não encontrada');
    const entity = this.mapper.toEntity(dto);
    await this.repository.update(id, entity as any);
    const updated = await this.repository.findById(id);
    return this.mapper.toResponseDto(updated!);
  }

  @RequirePermission('numeracaoRecibo.delete')
  @Transactional()
  @CacheEvict('numeracaoRecibo:*', true)
  async delete(id: number): Promise<boolean> {
    const existing = await this.repository.findById(id);
    if (!existing) throw new NotFoundException('Numeração de recibo não encontrada');
    return this.repository.delete(id);
  }
}
