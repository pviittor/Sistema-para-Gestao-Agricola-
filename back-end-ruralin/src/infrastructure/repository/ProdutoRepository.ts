import { Injectable, Inject } from '../../core/di';
import { TYPES } from '../../core/di/types';
import { BaseRepository } from '../../core/repository/BaseRepository';
import { IProdutoRepository } from './IProdutoRepository';
import { ICacheService } from '../../core/cache/ICacheService';
import { ITenantService } from '../../core/tenant/ITenantService';
import Produto from '../../models/Produto';

/**
 * Repositório para entidade Produto
 */
@Injectable()
export class ProdutoRepository extends BaseRepository<Produto> implements IProdutoRepository {
  constructor(
    @Inject(TYPES.ICacheService) cacheService: ICacheService,
    @Inject(TYPES.ITenantService) tenantService: ITenantService
  ) {
    super(Produto, cacheService, tenantService);
  }

  /**
   * Sobrescreve findById para usar id_prod ao invés de id
   */
  async findById(id: number | string): Promise<Produto | null> {
    const tenantFilter = this.getTenantFilter();
    if (!tenantFilter) {
      return null;
    }

    const cacheKey = this.getFindByIdCacheKey(id);
    const cached = await this.cacheService.get<Produto>(cacheKey);
    if (cached !== null) {
      if (this.isEntityFromCurrentTenant(cached)) {
        return cached;
      }
      await this.cacheService.delete(cacheKey);
    }

    const result = await this.model.findOne({
      where: {
        id_prod: id,
        ...tenantFilter,
      } as any,
    });

    if (result) {
      await this.cacheService.set(cacheKey, result, this.DEFAULT_CACHE_TTL);
    }

    return result;
  }

  /**
   * Busca todos os produtos de um grupo específico
   */
  async findByGrupo(idGrupo: number): Promise<Produto[]> {
    const tenantFilter = this.getTenantFilter();
    if (!tenantFilter) {
      return [];
    }

    const cacheKey = `produto:findByGrupo:${idGrupo}:${tenantFilter.tenantId}`;
    const cached = await this.cacheService.get<Produto[]>(cacheKey);
    if (cached !== null) {
      return cached;
    }

    const result = await this.model.findAll({
      where: {
        idGrupo,
        ...tenantFilter,
      } as any,
      order: [['descricao_prod', 'ASC']],
    });

    await this.cacheService.set(cacheKey, result, this.DEFAULT_CACHE_TTL);
    return result;
  }

  /**
   * Busca todos os produtos de um subgrupo específico
   */
  async findBySubGrupo(idSubGrupo: number): Promise<Produto[]> {
    const tenantFilter = this.getTenantFilter();
    if (!tenantFilter) {
      return [];
    }

    const cacheKey = `produto:findBySubGrupo:${idSubGrupo}:${tenantFilter.tenantId}`;
    const cached = await this.cacheService.get<Produto[]>(cacheKey);
    if (cached !== null) {
      return cached;
    }

    const result = await this.model.findAll({
      where: {
        idSubGrupo,
        ...tenantFilter,
      } as any,
      order: [['descricao_prod', 'ASC']],
    });

    await this.cacheService.set(cacheKey, result, this.DEFAULT_CACHE_TTL);
    return result;
  }

  /**
   * Sobrescreve update para usar id_prod ao invés de id
   */
  async update(id: number | string, entity: Partial<Produto>): Promise<Produto> {
    const tenantFilter = this.getTenantFilter();
    if (!tenantFilter) {
      throw new Error('Tenant não identificado. Não é possível atualizar entidade sem tenantId.');
    }

    const instance = await this.model.findOne({
      where: {
        id_prod: id,
        ...tenantFilter,
      } as any,
    });

    if (!instance) {
      throw new Error('Produto não encontrado');
    }

    const entityWithoutAudit = { ...entity };
    if ('tenantId' in entityWithoutAudit) {
      delete (entityWithoutAudit as any).tenantId;
    }
    if ('id_prod' in entityWithoutAudit) {
      delete (entityWithoutAudit as any).id_prod;
    }
    if ('usercreation' in entityWithoutAudit) {
      delete (entityWithoutAudit as any).usercreation;
    }
    if ('datecreation' in entityWithoutAudit) {
      delete (entityWithoutAudit as any).datecreation;
    }
    
    await instance.update(entityWithoutAudit);

    await this.invalidateFindByIdCache(id);
    await this.invalidateFindAllCache();

    return instance;
  }

  /**
   * Sobrescreve delete para usar id_prod ao invés de id
   */
  async delete(id: number | string): Promise<boolean> {
    const tenantFilter = this.getTenantFilter();
    if (!tenantFilter) {
      throw new Error('Tenant não identificado. Não é possível deletar entidade sem tenantId.');
    }

    const instance = await this.model.findOne({
      where: {
        id_prod: id,
        ...tenantFilter,
      } as any,
    });

    if (!instance) {
      return false;
    }

    await instance.destroy();

    await this.invalidateFindByIdCache(id);
    await this.invalidateFindAllCache();

    return true;
  }
}
