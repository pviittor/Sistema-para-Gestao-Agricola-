import { Injectable, Inject } from '../../core/di';
import { TYPES } from '../../core/di/types';
import { BaseRepository } from '../../core/repository/BaseRepository';
import { ICulturaRepository } from './ICulturaRepository';
import { ICacheService } from '../../core/cache/ICacheService';
import { ITenantService } from '../../core/tenant/ITenantService';
import Cultura from '../../models/Cultura';

/**
 * Repositório para entidade Cultura
 */
@Injectable()
export class CulturaRepository extends BaseRepository<Cultura> implements ICulturaRepository {
  constructor(
    @Inject(TYPES.ICacheService) cacheService: ICacheService,
    @Inject(TYPES.ITenantService) tenantService: ITenantService
  ) {
    super(Cultura, cacheService, tenantService);
  }

  /**
   * Busca todas as culturas de um produto específico
   */
  async findByProduto(idProduto: number): Promise<Cultura[]> {
    const tenantFilter = this.getTenantFilter();
    if (!tenantFilter) {
      return [];
    }

    const cacheKey = `cultura:findByProduto:${idProduto}:${tenantFilter.tenantId}`;
    const cached = await this.cacheService.get<Cultura[]>(cacheKey);
    if (cached !== null) {
      return cached;
    }

    const result = await this.model.findAll({
      where: {
        idProduto,
        ...tenantFilter,
      } as any,
      order: [['descricao_clt', 'ASC']],
    });

    await this.cacheService.set(cacheKey, result, this.DEFAULT_CACHE_TTL);
    return result;
  }
}
