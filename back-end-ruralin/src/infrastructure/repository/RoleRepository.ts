/**
 * RoleRepository - Repositório para entidade Role
 * 
 * Implementa IRoleRepository estendendo BaseRepository e adiciona
 * métodos específicos para busca de roles por nome.
 * 
 * @example
 * ```typescript
 * import { RoleRepository } from './RoleRepository';
 * 
 * const repository = new RoleRepository();
 * const role = await repository.findByNome('ADMIN');
 * ```
 */

import { Injectable, Inject } from '../../core/di';
import { TYPES } from '../../core/di/types';
import { BaseRepository } from '../../core/repository/BaseRepository';
import { IRoleRepository } from './IRoleRepository';
import { ICacheService } from '../../core/cache/ICacheService';
import { ITenantService } from '../../core/tenant/ITenantService';
import { NotFoundException } from '../../core/exceptions';
import { FindOptions, PaginatedResult } from '../../core/repository/types';
import Role from '../../models/Role';

/**
 * Repositório para entidade Role
 * 
 * Estende BaseRepository para fornecer métodos CRUD padrão e adiciona
 * métodos específicos para busca por nome.
 */
@Injectable()
export class RoleRepository extends BaseRepository<Role> implements IRoleRepository {
  /**
   * Construtor do repositório
   * 
   * Inicializa o BaseRepository com o modelo Role, cacheService e tenantService.
   */
  constructor(
    @Inject(TYPES.ICacheService) cacheService: ICacheService,
    @Inject(TYPES.ITenantService) tenantService: ITenantService
  ) {
    super(Role, cacheService, tenantService);
  }

  /**
   * Busca uma role por ID
   * 
   * Roles são entidades globais que não possuem tenantId, portanto
   * este método sobrescreve findById para usar findByIdWithoutTenant.
   * 
   * @param id - ID da role
   * @returns Promise que resolve com a role encontrada ou null
   */
  async findById(id: number | string): Promise<Role | null> {
    // Roles não têm tenantId, usar findByIdWithoutTenant
    return await this.findByIdWithoutTenant(id);
  }

  /**
   * Busca uma role por nome
   * 
   * Roles são entidades globais que não possuem tenantId, portanto
   * este método usa findOneWithoutTenant para buscar sem filtro de tenant.
   * 
   * @param nome - Nome da role
   * @returns Promise que resolve com a role encontrada ou null
   */
  async findByNome(nome: string): Promise<Role | null> {
    // Roles não têm tenantId, usar findOneWithoutTenant
    return await this.findOneWithoutTenant({ where: { nome } });
  }

  /**
   * Busca roles com paginação
   * 
   * Roles são entidades globais que não possuem tenantId, portanto
   * este método sobrescreve findAllPaginated para usar findAllPaginatedWithoutTenant.
   * 
   * @param page - Número da página (1-indexed)
   * @param limit - Limite de registros por página
   * @param options - Opções de busca adicionais
   * @returns Promise que resolve com resultado paginado
   */
  async findAllPaginated(
    page: number = 1,
    limit: number = 10,
    options?: FindOptions
  ): Promise<PaginatedResult<Role>> {
    // Roles não têm tenantId, usar findAllPaginatedWithoutTenant
    return await this.findAllPaginatedWithoutTenant(page, limit, options);
  }

  /**
   * Cria uma nova role
   * 
   * Roles são entidades globais que não possuem tenantId, portanto
   * este método sobrescreve create para não adicionar tenantId.
   * 
   * @param entity - Dados parciais da role a ser criada
   * @returns Promise que resolve com a role criada
   */
  async create(entity: Partial<Role>): Promise<Role> {
    // Roles não têm tenantId, criar diretamente sem filtro
    const result = await this.model.create(entity as any);
    
    // Invalidar cache de listagem (usando chave sem tenant)
    const entityName = this.getEntityName();
    const pattern = `${entityName}:findAllPaginated:*`;
    await this.cacheService.deleteByPattern(pattern);
    
    return result;
  }

  /**
   * Atualiza uma role existente
   * 
   * Roles são entidades globais que não possuem tenantId, portanto
   * este método sobrescreve update para não validar tenant.
   * 
   * @param id - ID da role
   * @param entity - Dados parciais a serem atualizados
   * @returns Promise que resolve com a role atualizada
   * @throws NotFoundException se a role não for encontrada
   */
  async update(id: number | string, entity: Partial<Role>): Promise<Role> {
    // Buscar sem filtro de tenant
    const instance = await this.model.findByPk(id);
    
    if (!instance) {
      throw new NotFoundException('Role', id);
    }
    
    await instance.update(entity as any);
    
    // Invalidar cache do registro específico (sem tenant)
    const cacheKey = this.getFindByIdCacheKey(id, false);
    await this.cacheService.delete(cacheKey);
    
    // Invalidar cache de listagem (usando chave sem tenant)
    const entityName = this.getEntityName();
    const pattern = `${entityName}:findAllPaginated:*`;
    await this.cacheService.deleteByPattern(pattern);
    
    return instance;
  }

  /**
   * Remove uma role
   * 
   * Roles são entidades globais que não possuem tenantId, portanto
   * este método sobrescreve delete para não validar tenant.
   * 
   * @param id - ID da role
   * @returns Promise que resolve com true se removida, false se não existir
   */
  async delete(id: number | string): Promise<boolean> {
    // Buscar sem filtro de tenant
    const instance = await this.model.findByPk(id);
    
    if (!instance) {
      return false;
    }
    
    await instance.destroy();
    
    // Invalidar cache do registro específico (sem tenant)
    const cacheKey = this.getFindByIdCacheKey(id, false);
    await this.cacheService.delete(cacheKey);
    
    // Invalidar cache de listagem (usando chave sem tenant)
    const entityName = this.getEntityName();
    const pattern = `${entityName}:findAllPaginated:*`;
    await this.cacheService.deleteByPattern(pattern);
    
    return true;
  }
}
