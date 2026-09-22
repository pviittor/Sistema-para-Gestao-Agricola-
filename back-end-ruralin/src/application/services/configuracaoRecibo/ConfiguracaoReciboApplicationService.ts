import { Injectable, Inject } from '../../../core/di';
import { TYPES } from '../../../core/di/types';
import { RequirePermission } from '../../../core/authorization/RequirePermission';
import { Transactional } from '../../../core/unitofwork/Transactional';
import { Cacheable } from '../../../core/cache/Cacheable';
import { CacheEvict } from '../../../core/cache/CacheEvict';
import { NotFoundException } from '../../../core/exceptions/NotFoundException';
import { BusinessException } from '../../../core/exceptions/BusinessException';
import { IConfiguracaoReciboRepository } from '../../../infrastructure/repository/IConfiguracaoReciboRepository';
import { IConfiguracaoReciboApplicationService } from './IConfiguracaoReciboApplicationService';
import { ConfiguracaoReciboMapper } from '../../mappers/ConfiguracaoReciboMapper';
import { CreateConfiguracaoReciboDto, UpdateConfiguracaoReciboDto, ConfiguracaoReciboResponseDto } from '../../dto/configuracaoRecibo';
import { PaginatedResult } from '../../../core/repository/types';
import { getRequestContext } from '../../../core/authorization/helpers';

@Injectable()
export class ConfiguracaoReciboApplicationService implements IConfiguracaoReciboApplicationService {
  constructor(
    @Inject(TYPES.IConfiguracaoReciboRepository) private readonly repository: IConfiguracaoReciboRepository,
    private readonly mapper: ConfiguracaoReciboMapper
  ) {}

  @RequirePermission('configuracaoRecibo.read')
  @Cacheable('configuracaoRecibo:list:{0}:{1}', 300)
  async list(page = 1, limit = 100): Promise<PaginatedResult<ConfiguracaoReciboResponseDto>> {
    const result = await this.repository.findAllPaginated(page, limit);
    return { ...result, data: result.data.map((e: any) => this.mapper.toResponseDto(e)) };
  }

  @RequirePermission('configuracaoRecibo.read')
  async findById(id: number): Promise<ConfiguracaoReciboResponseDto> {
    const entity = await this.repository.findById(id);
    if (!entity) throw new NotFoundException('Configuração de recibo não encontrada');
    return this.mapper.toResponseDto(entity);
  }

  @RequirePermission('configuracaoRecibo.read')
  @Cacheable('configuracaoRecibo:findByTenant:*', 7200)
  async getConfigTenant(): Promise<ConfiguracaoReciboResponseDto | null> {
    const entity = await this.repository.findByTenant();
    if (!entity) return null;
    return this.mapper.toResponseDto(entity);
  }

  @RequirePermission('configuracaoRecibo.create')
  @Transactional()
  @CacheEvict('configuracaoRecibo:*', true)
  async create(dto: CreateConfiguracaoReciboDto): Promise<ConfiguracaoReciboResponseDto> {
    const context = getRequestContext();

    // Verificar se já existe configuração para este tenant
    const existente = await this.repository.findByTenant();
    if (existente) {
      throw new BusinessException('Já existe uma configuração para este tenant. Use o método de atualização.');
    }

    // Validar tamanho do logo
    if (dto.logoBase64 && dto.logoBase64.length > 270000) {
      throw new BusinessException('Logo deve ter no máximo 200KB');
    }

    const entity = this.mapper.toEntity(dto);
    (entity as any).tenantId = context?.getTenantId();
    const created = await this.repository.create(entity as any);
    return this.mapper.toResponseDto(created);
  }

  @RequirePermission('configuracaoRecibo.update')
  @Transactional()
  @CacheEvict('configuracaoRecibo:*', true)
  async update(id: number, dto: UpdateConfiguracaoReciboDto): Promise<ConfiguracaoReciboResponseDto> {
    const existing = await this.repository.findById(id);
    if (!existing) throw new NotFoundException('Configuração de recibo não encontrada');

    // Validar tamanho do logo
    if (dto.logoBase64 && dto.logoBase64.length > 270000) {
      throw new BusinessException('Logo deve ter no máximo 200KB');
    }

    const entity = this.mapper.toEntity(dto);
    await this.repository.update(id, entity as any);
    const updated = await this.repository.findById(id);
    return this.mapper.toResponseDto(updated!);
  }

  @RequirePermission('configuracaoRecibo.delete')
  @Transactional()
  @CacheEvict('configuracaoRecibo:*', true)
  async delete(id: number): Promise<boolean> {
    const existing = await this.repository.findById(id);
    if (!existing) throw new NotFoundException('Configuração de recibo não encontrada');
    return this.repository.delete(id);
  }
}
