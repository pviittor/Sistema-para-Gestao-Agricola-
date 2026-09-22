/**
 * TenantRepository - Repositório para entidade Tenant
 * 
 * Implementa ITenantRepository estendendo BaseRepository e adiciona
 * métodos específicos para busca de tenants por slug, consultoria e status.
 */

import { Injectable, Inject } from '../../core/di';
import { TYPES } from '../../core/di/types';
import { BaseRepository } from '../../core/repository/BaseRepository';
import { ITenantRepository } from './ITenantRepository';
import { ICacheService } from '../../core/cache/ICacheService';
import { ITenantService } from '../../core/tenant/ITenantService';
import Tenant from '../../models/Tenant';

/**
 * Repositório para entidade Tenant
 * 
 * Estende BaseRepository para fornecer métodos CRUD padrão e adiciona
 * métodos específicos para busca por slug, consultoria e status.
 */
@Injectable()
export class TenantRepository extends BaseRepository<Tenant> implements ITenantRepository {
  /**
   * Construtor do repositório
   * 
   * Inicializa o BaseRepository com o modelo Tenant, cacheService e tenantService.
   */
  constructor(
    @Inject(TYPES.ICacheService) cacheService: ICacheService,
    @Inject(TYPES.ITenantService) tenantService: ITenantService
  ) {
    super(Tenant, cacheService, tenantService);
  }

  /**
   * Busca tenant por slug
   * 
   * @param slug - Slug do tenant
   * @returns Promise que resolve com o tenant encontrado ou null
   */
  async findBySlug(slug: string): Promise<Tenant | null> {
    // Tentar buscar no cache primeiro
    const cacheKey = `tenant:slug:${slug}`;
    const cached = await this.cacheService.get<Tenant>(cacheKey);
    if (cached) {
      return cached;
    }

    // Buscar no banco (sem filtro de tenant, pois slug é único globalmente)
    const tenant = await this.model.findOne({
      where: {
        slug: slug.toLowerCase(),
      },
    });

    // Cachear resultado se encontrado
    if (tenant) {
      await this.cacheService.set(cacheKey, tenant, 3600); // 1 hora
    }

    return tenant;
  }

  /**
   * Busca tenants por consultoria
   * 
   * @param consultoriaId - ID da consultoria
   * @returns Promise que resolve com lista de tenants da consultoria
   */
  async findByConsultoria(consultoriaId: number): Promise<Tenant[]> {
    const cacheKey = `tenants:consultoria:${consultoriaId}`;
    const cached = await this.cacheService.get<Tenant[]>(cacheKey);
    if (cached) {
      return cached;
    }

    // Buscar sem filtro de tenant (CONSULTOR acessa múltiplos tenants)
    const tenants = await this.model.findAll({
      where: {
        consultoriaId,
      },
      order: [['nome', 'ASC']],
    });

    await this.cacheService.set(cacheKey, tenants, 1800); // 30 minutos

    return tenants;
  }

  /**
   * Busca tenants ativos
   * 
   * @returns Promise que resolve com lista de tenants ativos
   */
  async findAtivos(): Promise<Tenant[]> {
    const cacheKey = 'tenants:ativos';
    const cached = await this.cacheService.get<Tenant[]>(cacheKey);
    if (cached) {
      return cached;
    }

    const tenants = await this.model.findAll({
      where: {
        ativo: true,
      },
      order: [['nome', 'ASC']],
    });

    await this.cacheService.set(cacheKey, tenants, 1800); // 30 minutos

    return tenants;
  }

  /**
   * Override do método create para invalidar cache de lista
   */
  async create(entity: Partial<Tenant>): Promise<Tenant> {
    const result = await super.create(entity);
    await this.invalidateFindAllCache();
    await this.cacheService.delete(`tenants:consultoria:${entity.consultoriaId}`);
    await this.cacheService.delete('tenants:ativos');
    return result;
  }

  /**
   * Override do método update para invalidar cache
   */
  async update(id: number, entity: Partial<Tenant>): Promise<Tenant> {
    const result = await super.update(id, entity);
    const tenant = await this.findById(id);
    if (tenant) {
      await this.cacheService.delete(`tenant:slug:${tenant.slug}`);
      await this.cacheService.delete(`tenants:consultoria:${tenant.consultoriaId}`);
    }
    await this.cacheService.delete('tenants:ativos');
    return result;
  }

  /**
   * Override do método delete para invalidar cache
   */
  async delete(id: number): Promise<boolean> {
    const tenant = await this.findById(id);
    const result = await super.delete(id);
    if (tenant) {
      await this.cacheService.delete(`tenant:slug:${tenant.slug}`);
      await this.cacheService.delete(`tenants:consultoria:${tenant.consultoriaId}`);
    }
    await this.cacheService.delete('tenants:ativos');
    return result;
  }
}
