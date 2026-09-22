import { Injectable, Inject } from '../../core/di';
import { TYPES } from '../../core/di/types';
import { BaseRepository } from '../../core/repository/BaseRepository';
import { IUnidadeMedidaRepository } from './IUnidadeMedidaRepository';
import { ICacheService } from '../../core/cache/ICacheService';
import { ITenantService } from '../../core/tenant/ITenantService';
import UnidadeMedida from '../../models/UnidadeMedida';

/**
 * Repositório para entidade UnidadeMedida
 * 
 * Estende BaseRepository para fornecer métodos CRUD padrão e adiciona
 * métodos específicos para busca de unidades de medida.
 */
@Injectable()
export class UnidadeMedidaRepository extends BaseRepository<UnidadeMedida> implements IUnidadeMedidaRepository {
  /**
   * Construtor do repositório
   * 
   * Inicializa o BaseRepository com o modelo UnidadeMedida, cacheService e tenantService.
   */
  constructor(
    @Inject(TYPES.ICacheService) cacheService: ICacheService,
    @Inject(TYPES.ITenantService) tenantService: ITenantService
  ) {
    super(UnidadeMedida, cacheService, tenantService);
  }

  /**
   * Sobrescreve findById para usar id_unidade ao invés de id
   * 
   * @param id - ID da unidade de medida
   * @returns Promise que resolve com a unidade de medida encontrada ou null
   */
  async findById(id: number | string): Promise<UnidadeMedida | null> {
    const tenantFilter = this.getTenantFilter();
    if (!tenantFilter) {
      return null;
    }

    const cacheKey = this.getFindByIdCacheKey(id);

    // Verificar cache
    const cached = await this.cacheService.get<UnidadeMedida>(cacheKey);
    if (cached !== null) {
      if (this.isEntityFromCurrentTenant(cached)) {
        return cached;
      }
      await this.cacheService.delete(cacheKey);
    }

    // Query no banco usando id_unidade
    const result = await this.model.findOne({
      where: {
        id_unidade: id,
        ...tenantFilter,
      } as any,
    });

    // Cachear resultado
    if (result) {
      await this.cacheService.set(cacheKey, result, this.DEFAULT_CACHE_TTL);
    }

    return result;
  }

  /**
   * Sobrescreve update para usar id_unidade ao invés de id
   * 
   * @param id - ID da unidade de medida
   * @param entity - Dados parciais a serem atualizados
   * @returns Promise que resolve com a unidade de medida atualizada
   */
  async update(id: number | string, entity: Partial<UnidadeMedida>): Promise<UnidadeMedida> {
    const tenantFilter = this.getTenantFilter();
    if (!tenantFilter) {
      throw new Error('Tenant não identificado. Não é possível atualizar entidade sem tenantId.');
    }

    // Buscar instância usando id_unidade
    const instance = await this.model.findOne({
      where: {
        id_unidade: id,
        ...tenantFilter,
      } as any,
    });

    if (!instance) {
      throw new Error('Unidade de medida não encontrada');
    }

    // Garantir que tenantId e campos de auditoria não sejam alterados
    const entityWithoutAudit = { ...entity };
    if ('tenantId' in entityWithoutAudit) {
      delete (entityWithoutAudit as any).tenantId;
    }
    if ('id_unidade' in entityWithoutAudit) {
      delete (entityWithoutAudit as any).id_unidade;
    }
    if ('usercreation' in entityWithoutAudit) {
      delete (entityWithoutAudit as any).usercreation;
    }
    if ('datecreation' in entityWithoutAudit) {
      delete (entityWithoutAudit as any).datecreation;
    }
    
    await instance.update(entityWithoutAudit);

    // Invalidar cache
    await this.invalidateFindByIdCache(id);
    await this.invalidateFindAllCache();

    return instance;
  }

  /**
   * Sobrescreve delete para usar id_unidade ao invés de id
   * 
   * @param id - ID da unidade de medida
   * @returns Promise que resolve com true se deletado, false se não encontrado
   */
  async delete(id: number | string): Promise<boolean> {
    const tenantFilter = this.getTenantFilter();
    if (!tenantFilter) {
      throw new Error('Tenant não identificado. Não é possível deletar entidade sem tenantId.');
    }

    // Buscar instância usando id_unidade
    const instance = await this.model.findOne({
      where: {
        id_unidade: id,
        ...tenantFilter,
      } as any,
    });

    if (!instance) {
      return false;
    }

    await instance.destroy();

    // Invalidar cache
    await this.invalidateFindByIdCache(id);
    await this.invalidateFindAllCache();

    return true;
  }
}
