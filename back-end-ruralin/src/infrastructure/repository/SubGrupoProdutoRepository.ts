import { Injectable, Inject } from '../../core/di';
import { TYPES } from '../../core/di/types';
import { BaseRepository } from '../../core/repository/BaseRepository';
import { ISubGrupoProdutoRepository } from './ISubGrupoProdutoRepository';
import { ICacheService } from '../../core/cache/ICacheService';
import { ITenantService } from '../../core/tenant/ITenantService';
import SubGrupoProduto from '../../models/SubGrupoProduto';
import { Op } from 'sequelize';

/**
 * Repositório para entidade SubGrupoProduto
 * 
 * Estende BaseRepository para fornecer métodos CRUD padrão e adiciona
 * métodos específicos para busca de subgrupos de produto.
 */
@Injectable()
export class SubGrupoProdutoRepository extends BaseRepository<SubGrupoProduto> implements ISubGrupoProdutoRepository {
  /**
   * Construtor do repositório
   * 
   * Inicializa o BaseRepository com o modelo SubGrupoProduto, cacheService e tenantService.
   */
  constructor(
    @Inject(TYPES.ICacheService) cacheService: ICacheService,
    @Inject(TYPES.ITenantService) tenantService: ITenantService
  ) {
    super(SubGrupoProduto, cacheService, tenantService);
  }

  /**
   * Busca todos os subgrupos de um grupo de produto específico
   * 
   * @param idGrupo - ID do grupo de produto
   * @returns Promise que resolve com array de subgrupos do grupo especificado
   */
  async findByGrupo(idGrupo: number): Promise<SubGrupoProduto[]> {
    const tenantFilter = this.getTenantFilter();
    if (!tenantFilter) {
      return [];
    }

    const cacheKey = `subGrupoProduto:findByGrupo:${idGrupo}:tenant:${tenantFilter.tenantId}`;

    // Verificar cache
    const cached = await this.cacheService.get<SubGrupoProduto[]>(cacheKey);
    if (cached !== null) {
      return cached;
    }

    // Query no banco
    const subgrupos = await this.model.findAll({
      where: {
        idGrupo,
        ...tenantFilter,
      } as any,
      order: [['descricao_sub', 'ASC']],
    });

    // Cachear resultado
    if (subgrupos.length > 0) {
      await this.cacheService.set(cacheKey, subgrupos, this.DEFAULT_CACHE_TTL);
    }

    return subgrupos;
  }

  /**
   * Sobrescreve findById para usar id_sub ao invés de id
   * 
   * @param id - ID do subgrupo
   * @returns Promise que resolve com o subgrupo encontrado ou null
   */
  async findById(id: number | string): Promise<SubGrupoProduto | null> {
    const tenantFilter = this.getTenantFilter();
    if (!tenantFilter) {
      return null;
    }

    const cacheKey = this.getFindByIdCacheKey(id);

    // Verificar cache
    const cached = await this.cacheService.get<SubGrupoProduto>(cacheKey);
    if (cached !== null) {
      if (this.isEntityFromCurrentTenant(cached)) {
        return cached;
      }
      await this.cacheService.delete(cacheKey);
    }

    // Query no banco usando id_sub
    const result = await this.model.findOne({
      where: {
        id_sub: id,
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
   * Sobrescreve update para usar id_sub ao invés de id
   * 
   * @param id - ID do subgrupo
   * @param entity - Dados parciais a serem atualizados
   * @returns Promise que resolve com o subgrupo atualizado
   */
  async update(id: number | string, entity: Partial<SubGrupoProduto>): Promise<SubGrupoProduto> {
    const tenantFilter = this.getTenantFilter();
    if (!tenantFilter) {
      throw new Error('Tenant não identificado. Não é possível atualizar entidade sem tenantId.');
    }

    // Buscar instância usando id_sub
    const instance = await this.model.findOne({
      where: {
        id_sub: id,
        ...tenantFilter,
      } as any,
    });

    if (!instance) {
      throw new Error('Subgrupo de produto não encontrado');
    }

    // Garantir que tenantId não seja alterado
    const entityWithoutTenant = { ...entity };
    if ('tenantId' in entityWithoutTenant) {
      delete (entityWithoutTenant as any).tenantId;
    }
    if ('id_sub' in entityWithoutTenant) {
      delete (entityWithoutTenant as any).id_sub;
    }
    
    await instance.update(entityWithoutTenant);

    // Invalidar cache
    await this.invalidateFindByIdCache(id);
    await this.invalidateFindAllCache();

    return instance;
  }

  /**
   * Sobrescreve delete para usar id_sub ao invés de id
   * 
   * @param id - ID do subgrupo
   * @returns Promise que resolve com true se deletado, false se não encontrado
   */
  async delete(id: number | string): Promise<boolean> {
    const tenantFilter = this.getTenantFilter();
    if (!tenantFilter) {
      throw new Error('Tenant não identificado. Não é possível deletar entidade sem tenantId.');
    }

    // Buscar instância usando id_sub
    const instance = await this.model.findOne({
      where: {
        id_sub: id,
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
