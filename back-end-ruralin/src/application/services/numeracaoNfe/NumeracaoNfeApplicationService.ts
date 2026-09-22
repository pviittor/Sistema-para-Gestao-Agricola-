import { Injectable, Inject } from '../../../core/di';
import { TYPES } from '../../../core/di/types';
import { RequirePermission } from '../../../core/authorization/RequirePermission';
import { Transactional } from '../../../core/unitofwork/Transactional';
import { Cacheable } from '../../../core/cache/Cacheable';
import { CacheEvict } from '../../../core/cache/CacheEvict';
import { NotFoundException } from '../../../core/exceptions/NotFoundException';
import { INumeracaoNfeRepository } from '../../../infrastructure/repository/INumeracaoNfeRepository';
import { INumeracaoNfeApplicationService } from './INumeracaoNfeApplicationService';
import { NumeracaoNfeMapper } from '../../mappers/NumeracaoNfeMapper';
import { CreateNumeracaoNfeDto, UpdateNumeracaoNfeDto, NumeracaoNfeResponseDto } from '../../dto/numeracaoNfe';
import { PaginatedResult } from '../../../core/repository/types';
import { getRequestContext } from '../../../core/authorization/helpers';

/**
 * Application Service para NumeracaoNfe
 */
@Injectable()
export class NumeracaoNfeApplicationService implements INumeracaoNfeApplicationService {
  constructor(
    @Inject(TYPES.INumeracaoNfeRepository) private readonly repository: INumeracaoNfeRepository,
    private readonly mapper: NumeracaoNfeMapper
  ) {}

  @RequirePermission('numeracao_nfe.read')
  @Cacheable('numeracao_nfe:list:{0}:{1}', 300)
  async list(page = 1, limit = 100): Promise<PaginatedResult<NumeracaoNfeResponseDto>> {
    const result = await this.repository.findAllPaginated(page, limit);
    return {
      ...result,
      data: result.data.map((e: any) => this.mapper.toResponseDto(e)),
    };
  }

  @RequirePermission('numeracao_nfe.read')
  async findById(id: number): Promise<NumeracaoNfeResponseDto> {
    const entity = await this.repository.findById(id);
    if (!entity) throw new NotFoundException('Numeração não encontrada');
    return this.mapper.toResponseDto(entity);
  }

  @RequirePermission('numeracao_nfe.create')
  @Transactional()
  @CacheEvict('numeracao_nfe:*', true)
  async create(dto: CreateNumeracaoNfeDto): Promise<NumeracaoNfeResponseDto> {
    const context = getRequestContext();
    const entity = this.mapper.toEntity(dto);
    (entity as any).tenantId = context?.getTenantId();
    const created = await this.repository.create(entity as any);
    return this.mapper.toResponseDto(created);
  }

  @RequirePermission('numeracao_nfe.update')
  @Transactional()
  @CacheEvict('numeracao_nfe:*', true)
  async update(id: number, dto: UpdateNumeracaoNfeDto): Promise<NumeracaoNfeResponseDto> {
    const existing = await this.repository.findById(id);
    if (!existing) throw new NotFoundException('Numeração não encontrada');
    const entity = this.mapper.toEntity(dto);
    await this.repository.update(id, entity as any);
    const updated = await this.repository.findById(id);
    return this.mapper.toResponseDto(updated!);
  }

  @RequirePermission('numeracao_nfe.delete')
  @Transactional()
  @CacheEvict('numeracao_nfe:*', true)
  async delete(id: number): Promise<boolean> {
    const existing = await this.repository.findById(id);
    if (!existing) throw new NotFoundException('Numeração não encontrada');
    return this.repository.delete(id);
  }

  @RequirePermission('numeracao_nfe.read')
  async consultarProximoNumero(serie: string, modelo: string): Promise<number> {
    const numeracao = await this.repository.findBySerieModelo(serie, modelo);
    return numeracao ? numeracao.ultimo_numero + 1 : 1;
  }

  @Transactional()
  async proximoNumero(serie: string, modelo: string): Promise<number> {
    const context = getRequestContext();
    const tenantId = context?.getTenantId();
    if (!tenantId) throw new Error('Tenant não identificado');
    return this.repository.proximoNumero(serie, modelo, tenantId);
  }
}
