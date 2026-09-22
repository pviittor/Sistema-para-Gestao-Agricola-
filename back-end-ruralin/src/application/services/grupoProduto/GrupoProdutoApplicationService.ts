import { Injectable, Inject } from '../../../core/di';
import { TYPES } from '../../../core/di/types';
import { IGrupoProdutoApplicationService } from './IGrupoProdutoApplicationService';
import { IGrupoProdutoRepository } from '../../../infrastructure/repository/IGrupoProdutoRepository';
import { CreateGrupoProdutoDto } from '../../dto/grupoProduto/CreateGrupoProdutoDto';
import { UpdateGrupoProdutoDto } from '../../dto/grupoProduto/UpdateGrupoProdutoDto';
import { GrupoProdutoResponseDto } from '../../dto/grupoProduto/GrupoProdutoResponseDto';
import { GrupoProdutoMapper } from '../../mappers/GrupoProdutoMapper';
import { Auditable } from '../../../core/audit';
import { Cacheable, CacheEvict } from '../../../core/cache';
import { RequirePermission } from '../../../core/authorization';
import { Transactional } from '../../../core/unitofwork/Transactional';
import { PaginatedResult } from '../../../core/repository/types';
import { NotFoundException } from '../../../core/exceptions/NotFoundException';

/**
 * Application Service para GrupoProduto
 * 
 * Implementa a lógica de negócio para operações com grupos de produto.
 */
@Injectable()
export class GrupoProdutoApplicationService implements IGrupoProdutoApplicationService {
  constructor(
    @Inject(TYPES.IGrupoProdutoRepository) private grupoProdutoRepository: IGrupoProdutoRepository,
    private mapper: GrupoProdutoMapper
  ) {}

  /**
   * Lista todas as grupos de produto com paginação
   */
  @RequirePermission('grupoProduto.read')
  @Cacheable('grupoProduto:list:{0}:{1}', 3600)
  async list(page: number = 1, limit: number = 10): Promise<PaginatedResult<GrupoProdutoResponseDto>> {
    const result = await this.grupoProdutoRepository.findAllPaginated(page, limit);
    return {
      ...result,
      data: result.data.map(item => this.mapper.toDto(item)),
    };
  }

  /**
   * Busca um grupo de produto por ID
   */
  @RequirePermission('grupoProduto.read')
  @Cacheable('grupoProduto:getById', 3600)
  async getById(id: number | string): Promise<GrupoProdutoResponseDto | null> {
    const grupoProduto = await this.grupoProdutoRepository.findById(id);
    return grupoProduto ? this.mapper.toDto(grupoProduto) : null;
  }

  /**
   * Cria um novo grupo de produto
   */
  @RequirePermission('grupoProduto.create')
  @Auditable('GrupoProduto')
  @CacheEvict('grupoProduto:list')
  @Transactional()
  async create(dto: CreateGrupoProdutoDto): Promise<GrupoProdutoResponseDto> {
    const entityData = await this.mapper.toEntity(dto);
    const grupoProduto = await this.grupoProdutoRepository.create(entityData);
    return this.mapper.toDto(grupoProduto);
  }

  /**
   * Atualiza um grupo de produto existente
   */
  @RequirePermission('grupoProduto.update')
  @Auditable('GrupoProduto')
  @CacheEvict('grupoProduto:list:*', true)
  @CacheEvict('grupoProduto:getById:*', true)
  @Transactional()
  async update(id: number | string, dto: UpdateGrupoProdutoDto): Promise<GrupoProdutoResponseDto> {
    const grupoProduto = await this.grupoProdutoRepository.findById(id);
    if (!grupoProduto) {
      throw new NotFoundException('Grupo de produto não encontrado');
    }
    
    const entityData = await this.mapper.toEntity(dto);
    const updated = await this.grupoProdutoRepository.update(id, entityData);
    return this.mapper.toDto(updated);
  }

  /**
   * Remove um grupo de produto
   */
  @RequirePermission('grupoProduto.delete')
  @Auditable('GrupoProduto')
  @CacheEvict('grupoProduto:list:*', true)
  @CacheEvict('grupoProduto:getById:*', true)
  @Transactional()
  async delete(id: number | string): Promise<boolean> {
    const grupoProduto = await this.grupoProdutoRepository.findById(id);
    if (!grupoProduto) {
      return false;
    }
    
    await this.grupoProdutoRepository.delete(id);
    return true;
  }
}
