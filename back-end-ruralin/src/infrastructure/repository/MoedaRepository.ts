import { Injectable, Inject } from '../../core/di';
import { TYPES } from '../../core/di/types';
import { BaseRepository } from '../../core/repository/BaseRepository';
import { IMoedaRepository } from './IMoedaRepository';
import { ICacheService } from '../../core/cache/ICacheService';
import { ITenantService } from '../../core/tenant/ITenantService';
import Moeda from '../../models/Moeda';

/**
 * Repositório para entidade Moeda
 */
@Injectable()
export class MoedaRepository extends BaseRepository<Moeda> implements IMoedaRepository {
  constructor(
    @Inject(TYPES.ICacheService) cacheService: ICacheService,
    @Inject(TYPES.ITenantService) tenantService: ITenantService
  ) {
    super(Moeda, cacheService, tenantService);
  }

  /**
   * Sobrescreve findById para usar id_moeda ao invés de id
   */
  async findById(id: number | string): Promise<Moeda | null> {
    const tenantFilter = this.getTenantFilter();
    if (!tenantFilter) {
      return null;
    }

    const cacheKey = this.getFindByIdCacheKey(id);
    const cached = await this.cacheService.get<Moeda>(cacheKey);
    if (cached !== null) {
      if (this.isEntityFromCurrentTenant(cached)) {
        return cached;
      }
      await this.cacheService.delete(cacheKey);
    }

    const result = await this.model.findOne({
      where: {
        id_moeda: id,
        ...tenantFilter,
      } as any,
    });

    if (result) {
      await this.cacheService.set(cacheKey, result, this.DEFAULT_CACHE_TTL);
    }

    return result;
  }

  /**
   * Sobrescreve update para usar id_moeda ao invés de id
   */
  async update(id: number | string, entity: Partial<Moeda>): Promise<Moeda> {
    const tenantFilter = this.getTenantFilter();
    if (!tenantFilter) {
      throw new Error('Tenant não identificado. Não é possível atualizar entidade sem tenantId.');
    }

    const instance = await this.model.findOne({
      where: {
        id_moeda: id,
        ...tenantFilter,
      } as any,
    });

    if (!instance) {
      throw new Error('Moeda não encontrada');
    }

    const entityWithoutAudit = { ...entity };
    if ('tenantId' in entityWithoutAudit) {
      delete (entityWithoutAudit as any).tenantId;
    }
    if ('id_moeda' in entityWithoutAudit) {
      delete (entityWithoutAudit as any).id_moeda;
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
   * Sobrescreve delete para usar id_moeda ao invés de id
   */
  async delete(id: number | string): Promise<boolean> {
    const tenantFilter = this.getTenantFilter();
    if (!tenantFilter) {
      throw new Error('Tenant não identificado. Não é possível deletar entidade sem tenantId.');
    }

    const instance = await this.model.findOne({
      where: {
        id_moeda: id,
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
