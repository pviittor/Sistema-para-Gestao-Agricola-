import { Injectable, Inject } from '../../core/di';
import { TYPES } from '../../core/di/types';
import { BaseRepository } from '../../core/repository/BaseRepository';
import { IPrincipioAtivoRepository } from './IPrincipioAtivoRepository';
import { ICacheService } from '../../core/cache/ICacheService';
import { ITenantService } from '../../core/tenant/ITenantService';
import PrincipioAtivo from '../../models/PrincipioAtivo';

/**
 * Repositório para entidade PrincipioAtivo
 * 
 * Estende BaseRepository para fornecer métodos CRUD padrão e adiciona
 * métodos específicos para busca de princípios ativos.
 */
@Injectable()
export class PrincipioAtivoRepository extends BaseRepository<PrincipioAtivo> implements IPrincipioAtivoRepository {
  /**
   * Construtor do repositório
   * 
   * Inicializa o BaseRepository com o modelo PrincipioAtivo, cacheService e tenantService.
   */
  constructor(
    @Inject(TYPES.ICacheService) cacheService: ICacheService,
    @Inject(TYPES.ITenantService) tenantService: ITenantService
  ) {
    super(PrincipioAtivo, cacheService, tenantService);
  }

  /**
   * Sobrescreve findById para usar id_principio ao invés de id
   * 
   * @param id - ID do princípio ativo
   * @returns Promise que resolve com o princípio ativo encontrado ou null
   */
  async findById(id: number | string): Promise<PrincipioAtivo | null> {
    const tenantFilter = this.getTenantFilter();
    if (!tenantFilter) {
      return null;
    }

    const cacheKey = this.getFindByIdCacheKey(id);

    // Verificar cache
    const cached = await this.cacheService.get<PrincipioAtivo>(cacheKey);
    if (cached !== null) {
      if (this.isEntityFromCurrentTenant(cached)) {
        return cached;
      }
      await this.cacheService.delete(cacheKey);
    }

    // Query no banco usando id_principio
    const result = await this.model.findOne({
      where: {
        id_principio: id,
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
   * Sobrescreve update para usar id_principio ao invés de id
   * 
   * @param id - ID do princípio ativo
   * @param entity - Dados parciais a serem atualizados
   * @returns Promise que resolve com o princípio ativo atualizado
   */
  async update(id: number | string, entity: Partial<PrincipioAtivo>): Promise<PrincipioAtivo> {
    const tenantFilter = this.getTenantFilter();
    if (!tenantFilter) {
      throw new Error('Tenant não identificado. Não é possível atualizar entidade sem tenantId.');
    }

    // Buscar instância usando id_principio
    const instance = await this.model.findOne({
      where: {
        id_principio: id,
        ...tenantFilter,
      } as any,
    });

    if (!instance) {
      throw new Error('Princípio ativo não encontrado');
    }

    // Garantir que tenantId e campos de auditoria não sejam alterados
    const entityWithoutAudit = { ...entity };
    if ('tenantId' in entityWithoutAudit) {
      delete (entityWithoutAudit as any).tenantId;
    }
    if ('id_principio' in entityWithoutAudit) {
      delete (entityWithoutAudit as any).id_principio;
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
   * Sobrescreve delete para usar id_principio ao invés de id
   * 
   * @param id - ID do princípio ativo
   * @returns Promise que resolve com true se deletado, false se não encontrado
   */
  async delete(id: number | string): Promise<boolean> {
    const tenantFilter = this.getTenantFilter();
    if (!tenantFilter) {
      throw new Error('Tenant não identificado. Não é possível deletar entidade sem tenantId.');
    }

    // Buscar instância usando id_principio
    const instance = await this.model.findOne({
      where: {
        id_principio: id,
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
