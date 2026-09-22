import { Injectable, Inject } from '../../../core/di';
import { TYPES } from '../../../core/di/types';
import { ICulturaApplicationService } from './ICulturaApplicationService';
import { ICulturaRepository } from '../../../infrastructure/repository/ICulturaRepository';
import { IProdutoRepository } from '../../../infrastructure/repository/IProdutoRepository';
import { CreateCulturaDto } from '../../dto/cultura/CreateCulturaDto';
import { UpdateCulturaDto } from '../../dto/cultura/UpdateCulturaDto';
import { CulturaResponseDto } from '../../dto/cultura/CulturaResponseDto';
import { CulturaMapper } from '../../mappers/CulturaMapper';
import { Auditable } from '../../../core/audit';
import { Cacheable, CacheEvict } from '../../../core/cache';
import { RequirePermission } from '../../../core/authorization';
import { Transactional } from '../../../core/unitofwork/Transactional';
import { PaginatedResult } from '../../../core/repository/types';
import { NotFoundException, ForbiddenException } from '../../../core/exceptions';
import { getRequestContext } from '../../../core/authorization/helpers';

/**
 * Application Service para Cultura
 */
@Injectable()
export class CulturaApplicationService implements ICulturaApplicationService {
  constructor(
    @Inject(TYPES.ICulturaRepository) private culturaRepository: ICulturaRepository,
    @Inject(TYPES.IProdutoRepository) private produtoRepository: IProdutoRepository,
    private mapper: CulturaMapper
  ) {}

  @RequirePermission('cultura.read')
  @Cacheable('cultura:list:{0}:{1}', 3600)
  async list(page: number = 1, limit: number = 10): Promise<PaginatedResult<CulturaResponseDto>> {
    const result = await this.culturaRepository.findAllPaginated(page, limit);
    return {
      ...result,
      data: result.data.map(item => this.mapper.toDto(item)),
    };
  }

  @RequirePermission('cultura.read')
  @Cacheable('cultura:getById', 3600)
  async getById(id: number | string): Promise<CulturaResponseDto | null> {
    const cultura = await this.culturaRepository.findById(id);
    return cultura ? this.mapper.toDto(cultura) : null;
  }

  @RequirePermission('cultura.read')
  @Cacheable('cultura:findByProduto:{0}', 3600)
  async findByProduto(idProduto: number): Promise<CulturaResponseDto[]> {
    const culturas = await this.culturaRepository.findByProduto(idProduto);
    return culturas.map(item => this.mapper.toDto(item));
  }

  @RequirePermission('cultura.create')
  @Auditable('Cultura')
  @CacheEvict('cultura:list:*', true)
  @CacheEvict('cultura:findByProduto:*', true)
  @Transactional()
  async create(dto: CreateCulturaDto): Promise<CulturaResponseDto> {
    const context = getRequestContext();
    if (!context || !context.getUserId() || !context.getTenantId()) {
      throw new ForbiddenException(
        'Usuário não autenticado ou tenant não identificado.',
        'USER_NOT_AUTHENTICATED'
      );
    }
    const userId = context.getUserId()!;
    const tenantId = context.getTenantId()!;

    // Validar cross-tenant: Produto deve pertencer ao mesmo tenant
    const produto = await this.produtoRepository.findById(dto.idProduto);
    if (!produto) {
      throw new NotFoundException('Produto não encontrado ou não pertence ao tenant atual');
    }

    const entityData = await this.mapper.toEntity(dto);
    
    const entityWithAudit = {
      ...entityData,
      usercreation: userId,
      datecreation: new Date(),
    };

    const cultura = await this.culturaRepository.create(entityWithAudit);
    return this.mapper.toDto(cultura);
  }

  @RequirePermission('cultura.update')
  @Auditable('Cultura')
  @CacheEvict('cultura:list:*', true)
  @CacheEvict('cultura:getById:*', true)
  @CacheEvict('cultura:findByProduto:*', true)
  @Transactional()
  async update(id: number | string, dto: UpdateCulturaDto): Promise<CulturaResponseDto> {
    const cultura = await this.culturaRepository.findById(id);
    if (!cultura) {
      throw new NotFoundException('Cultura não encontrada');
    }

    const context = getRequestContext();
    if (!context || !context.getTenantId()) {
      throw new ForbiddenException('Tenant não identificado');
    }

    // Validar cross-tenant apenas se idProduto estiver sendo atualizado
    if (dto.idProduto !== undefined) {
      const produto = await this.produtoRepository.findById(dto.idProduto);
      if (!produto) {
        throw new NotFoundException('Produto não encontrado ou não pertence ao tenant atual');
      }
    }

    const entityData = await this.mapper.toEntity(dto);
    const updated = await this.culturaRepository.update(id, entityData);
    return this.mapper.toDto(updated);
  }

  @RequirePermission('cultura.delete')
  @Auditable('Cultura')
  @CacheEvict('cultura:list:*', true)
  @CacheEvict('cultura:getById:*', true)
  @CacheEvict('cultura:findByProduto:*', true)
  @Transactional()
  async delete(id: number | string): Promise<boolean> {
    const cultura = await this.culturaRepository.findById(id);
    if (!cultura) {
      return false;
    }
    
    await this.culturaRepository.delete(id);
    return true;
  }
}
