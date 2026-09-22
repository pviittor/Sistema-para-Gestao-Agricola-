import { Injectable, Inject } from '../../core/di';
import { TYPES } from '../../core/di/types';
import { BaseRepository } from '../../core/repository/BaseRepository';
import { IMoedaCotacaoRepository } from './IMoedaCotacaoRepository';
import { ICacheService } from '../../core/cache/ICacheService';
import { ITenantService } from '../../core/tenant/ITenantService';
import MoedaCotacao from '../../models/MoedaCotacao';
import { Op } from 'sequelize';

/**
 * Repositório para entidade MoedaCotacao
 */
@Injectable()
export class MoedaCotacaoRepository extends BaseRepository<MoedaCotacao> implements IMoedaCotacaoRepository {
  constructor(
    @Inject(TYPES.ICacheService) cacheService: ICacheService,
    @Inject(TYPES.ITenantService) tenantService: ITenantService
  ) {
    super(MoedaCotacao, cacheService, tenantService);
  }

  /**
   * Sobrescreve findById para usar id_cotacao ao invés de id
   */
  async findById(id: number | string): Promise<MoedaCotacao | null> {
    const tenantFilter = this.getTenantFilter();
    if (!tenantFilter) {
      return null;
    }

    const cacheKey = this.getFindByIdCacheKey(id);
    const cached = await this.cacheService.get<MoedaCotacao>(cacheKey);
    if (cached !== null) {
      if (this.isEntityFromCurrentTenant(cached)) {
        return cached;
      }
      await this.cacheService.delete(cacheKey);
    }

    const result = await this.model.findOne({
      where: {
        id_cotacao: id,
        ...tenantFilter,
      } as any,
    });

    if (result) {
      await this.cacheService.set(cacheKey, result, this.DEFAULT_CACHE_TTL);
    }

    return result;
  }

  /**
   * Busca todas as cotações de uma moeda específica, ordenadas por data
   */
  async findByMoeda(idMoeda: number): Promise<MoedaCotacao[]> {
    const tenantFilter = this.getTenantFilter();
    if (!tenantFilter) {
      return [];
    }

    const cacheKey = `moedaCotacao:findByMoeda:${idMoeda}:${tenantFilter.tenantId}`;
    const cached = await this.cacheService.get<MoedaCotacao[]>(cacheKey);
    if (cached !== null) {
      return cached;
    }

    const result = await this.model.findAll({
      where: {
        idMoeda,
        ...tenantFilter,
      } as any,
      order: [['data_cotacao', 'DESC']],
    });

    await this.cacheService.set(cacheKey, result, this.DEFAULT_CACHE_TTL);
    return result;
  }

  /**
   * Busca cotações em uma data específica
   */
  async findByData(data: string | Date): Promise<MoedaCotacao[]> {
    const tenantFilter = this.getTenantFilter();
    if (!tenantFilter) {
      return [];
    }

    const dataStr = typeof data === 'string' ? data : data.toISOString().split('T')[0];
    const cacheKey = `moedaCotacao:findByData:${dataStr}:${tenantFilter.tenantId}`;
    const cached = await this.cacheService.get<MoedaCotacao[]>(cacheKey);
    if (cached !== null) {
      return cached;
    }

    const result = await this.model.findAll({
      where: {
        data_cotacao: dataStr,
        ...tenantFilter,
      } as any,
      order: [['idMoeda', 'ASC']],
    });

    await this.cacheService.set(cacheKey, result, this.DEFAULT_CACHE_TTL);
    return result;
  }

  /**
   * Sobrescreve update para usar id_cotacao ao invés de id
   */
  async update(id: number | string, entity: Partial<MoedaCotacao>): Promise<MoedaCotacao> {
    const tenantFilter = this.getTenantFilter();
    if (!tenantFilter) {
      throw new Error('Tenant não identificado. Não é possível atualizar entidade sem tenantId.');
    }

    const instance = await this.model.findOne({
      where: {
        id_cotacao: id,
        ...tenantFilter,
      } as any,
    });

    if (!instance) {
      throw new Error('Cotação de moeda não encontrada');
    }

    const entityWithoutTenant = { ...entity };
    if ('tenantId' in entityWithoutTenant) {
      delete (entityWithoutTenant as any).tenantId;
    }
    if ('id_cotacao' in entityWithoutTenant) {
      delete (entityWithoutTenant as any).id_cotacao;
    }
    
    await instance.update(entityWithoutTenant);

    await this.invalidateFindByIdCache(id);
    await this.invalidateFindAllCache();

    return instance;
  }

  /**
   * Sobrescreve delete para usar id_cotacao ao invés de id
   */
  async delete(id: number | string): Promise<boolean> {
    const tenantFilter = this.getTenantFilter();
    if (!tenantFilter) {
      throw new Error('Tenant não identificado. Não é possível deletar entidade sem tenantId.');
    }

    const instance = await this.model.findOne({
      where: {
        id_cotacao: id,
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
