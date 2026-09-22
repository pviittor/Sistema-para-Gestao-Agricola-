import { Injectable, Inject } from '../../../core/di';
import { TYPES } from '../../../core/di/types';
import { ISubGrupoProdutoApplicationService } from './ISubGrupoProdutoApplicationService';
import { ISubGrupoProdutoRepository } from '../../../infrastructure/repository/ISubGrupoProdutoRepository';
import { IGrupoProdutoRepository } from '../../../infrastructure/repository/IGrupoProdutoRepository';
import { ITenantService } from '../../../core/tenant/ITenantService';
import { CreateSubGrupoProdutoDto } from '../../dto/subGrupoProduto/CreateSubGrupoProdutoDto';
import { UpdateSubGrupoProdutoDto } from '../../dto/subGrupoProduto/UpdateSubGrupoProdutoDto';
import { SubGrupoProdutoResponseDto } from '../../dto/subGrupoProduto/SubGrupoProdutoResponseDto';
import { SubGrupoProdutoMapper } from '../../mappers/SubGrupoProdutoMapper';
import { Auditable } from '../../../core/audit';
import { Cacheable, CacheEvict } from '../../../core/cache';
import { RequirePermission } from '../../../core/authorization';
import { Transactional } from '../../../core/unitofwork/Transactional';
import { PaginatedResult } from '../../../core/repository/types';
import { NotFoundException, ForbiddenException } from '../../../core/exceptions';

/**
 * Application Service para SubGrupoProduto
 * 
 * Implementa a lógica de negócio para operações com subgrupos de produto.
 */
@Injectable()
export class SubGrupoProdutoApplicationService implements ISubGrupoProdutoApplicationService {
  constructor(
    @Inject(TYPES.ISubGrupoProdutoRepository) private subGrupoProdutoRepository: ISubGrupoProdutoRepository,
    @Inject(TYPES.IGrupoProdutoRepository) private grupoProdutoRepository: IGrupoProdutoRepository,
    @Inject(TYPES.ITenantService) private tenantService: ITenantService,
    private mapper: SubGrupoProdutoMapper
  ) {}

  /**
   * Lista todas as subgrupos de produto com paginação
   */
  @RequirePermission('subGrupoProduto.read')
  @Cacheable('subGrupoProduto:list:{0}:{1}', 3600)
  async list(page: number = 1, limit: number = 10): Promise<PaginatedResult<SubGrupoProdutoResponseDto>> {
    const result = await this.subGrupoProdutoRepository.findAllPaginated(page, limit);
    return {
      ...result,
      data: result.data.map(item => this.mapper.toDto(item)),
    };
  }

  /**
   * Busca um subgrupo de produto por ID
   */
  @RequirePermission('subGrupoProduto.read')
  @Cacheable('subGrupoProduto:getById', 3600)
  async getById(id: number | string): Promise<SubGrupoProdutoResponseDto | null> {
    const subGrupoProduto = await this.subGrupoProdutoRepository.findById(id);
    return subGrupoProduto ? this.mapper.toDto(subGrupoProduto) : null;
  }

  /**
   * Busca todos os subgrupos de um grupo de produto específico
   */
  @RequirePermission('subGrupoProduto.read')
  @Cacheable('subGrupoProduto:findByGrupo', 3600)
  async findByGrupo(idGrupo: number): Promise<SubGrupoProdutoResponseDto[]> {
    const subgrupos = await this.subGrupoProdutoRepository.findByGrupo(idGrupo);
    return subgrupos.map(item => this.mapper.toDto(item));
  }

  /**
   * Cria um novo subgrupo de produto
   */
  @RequirePermission('subGrupoProduto.create')
  @Auditable('SubGrupoProduto')
  @CacheEvict('subGrupoProduto:list:*', true)
  @CacheEvict('subGrupoProduto:findByGrupo:*', true)
  @Transactional()
  async create(dto: CreateSubGrupoProdutoDto): Promise<SubGrupoProdutoResponseDto> {
    // Validar se o grupo pertence ao mesmo tenant
    const grupo = await this.grupoProdutoRepository.findById(dto.idGrupo);
    if (!grupo) {
      throw new NotFoundException('Grupo de produto não encontrado');
    }

    // Verificar se grupo pertence ao mesmo tenant (validação cross-tenant)
    const currentTenantId = this.tenantService.getCurrentTenantId();
    if (currentTenantId && grupo.tenantId !== currentTenantId) {
      throw new ForbiddenException(
        'Grupo de produto não pertence ao tenant atual',
        'CROSS_TENANT_ACCESS_DENIED'
      );
    }

    const entityData = await this.mapper.toEntity(dto);
    const subGrupoProduto = await this.subGrupoProdutoRepository.create(entityData);
    return this.mapper.toDto(subGrupoProduto);
  }

  /**
   * Atualiza um subgrupo de produto existente
   */
  @RequirePermission('subGrupoProduto.update')
  @Auditable('SubGrupoProduto')
  @CacheEvict('subGrupoProduto:list:*', true)
  @CacheEvict('subGrupoProduto:getById:*', true)
  @CacheEvict('subGrupoProduto:findByGrupo:*', true)
  @Transactional()
  async update(id: number | string, dto: UpdateSubGrupoProdutoDto): Promise<SubGrupoProdutoResponseDto> {
    const subGrupoProduto = await this.subGrupoProdutoRepository.findById(id);
    if (!subGrupoProduto) {
      throw new NotFoundException('Subgrupo de produto não encontrado');
    }

    // Se idGrupo está sendo atualizado, validar cross-tenant
    if (dto.idGrupo !== undefined && dto.idGrupo !== subGrupoProduto.idGrupo) {
      const grupo = await this.grupoProdutoRepository.findById(dto.idGrupo);
      if (!grupo) {
        throw new NotFoundException('Grupo de produto não encontrado');
      }

      const currentTenantId = this.tenantService.getCurrentTenantId();
      if (currentTenantId && grupo.tenantId !== currentTenantId) {
        throw new ForbiddenException(
          'Grupo de produto não pertence ao tenant atual',
          'CROSS_TENANT_ACCESS_DENIED'
        );
      }
    }
    
    const entityData = await this.mapper.toEntity(dto);
    const updated = await this.subGrupoProdutoRepository.update(id, entityData);
    return this.mapper.toDto(updated);
  }

  /**
   * Remove um subgrupo de produto
   */
  @RequirePermission('subGrupoProduto.delete')
  @Auditable('SubGrupoProduto')
  @CacheEvict('subGrupoProduto:list:*', true)
  @CacheEvict('subGrupoProduto:getById:*', true)
  @CacheEvict('subGrupoProduto:findByGrupo:*', true)
  @Transactional()
  async delete(id: number | string): Promise<boolean> {
    const subGrupoProduto = await this.subGrupoProdutoRepository.findById(id);
    if (!subGrupoProduto) {
      return false;
    }
    
    await this.subGrupoProdutoRepository.delete(id);
    return true;
  }
}
