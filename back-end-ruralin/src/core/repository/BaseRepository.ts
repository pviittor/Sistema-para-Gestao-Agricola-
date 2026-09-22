/**
 * BaseRepository - Classe abstrata base para repositórios
 * 
 * Esta classe fornece implementação padrão dos métodos da interface IRepository
 * usando Sequelize. Repositórios específicos devem estender esta classe e passar
 * o modelo Sequelize correspondente.
 * 
 * @template T - Tipo da entidade (deve estender Model do Sequelize)
 * 
 * @example
 * ```typescript
 * import { BaseRepository } from '../../core/repository/BaseRepository';
 * import Usuario from '../../models/Usuario';
 * 
 * export class UsuarioRepository extends BaseRepository<Usuario> {
 *   constructor() {
 *     super(Usuario);
 *   }
 * 
 *   // Métodos customizados específicos do Usuario
 *   async findByEmail(email: string): Promise<Usuario | null> {
 *     return await this.findOne({ where: { email } });
 *   }
 * }
 * ```
 */

import { Model, ModelStatic } from 'sequelize';
import { Injectable, Inject } from '../di';
import { TYPES } from '../di/types';
import { IRepository } from './IRepository';
import { FindOptions, PaginatedResult } from './types';
import { NotFoundException, ForbiddenException } from '../exceptions';
import { ICacheService } from '../cache/ICacheService';
import { ITenantService } from '../tenant/ITenantService';
import { getRequestContext } from '../authorization/helpers';

/**
 * Classe abstrata base para repositórios
 * 
 * Implementa todos os métodos da interface IRepository usando Sequelize.
 * Repositórios específicos devem estender esta classe e podem adicionar
 * métodos customizados conforme necessário.
 * 
 * @template T - Tipo da entidade (deve estender Model do Sequelize)
 */
@Injectable()
export abstract class BaseRepository<T extends Model> implements IRepository<T> {
  /**
   * Modelo Sequelize gerenciado por este repositório
   */
  protected model: ModelStatic<T>;

  /**
   * Serviço de cache para otimização de queries
   */
  protected cacheService: ICacheService;

  /**
   * Serviço de tenant para gerenciamento de multi-tenancy
   */
  protected tenantService: ITenantService;

  /**
   * TTL padrão para cache de queries (em segundos)
   * Padrão: 1 hora (3600 segundos)
   */
  protected readonly DEFAULT_CACHE_TTL: number = 3600;

  /**
   * Construtor da classe base
   * 
   * @param model - Modelo Sequelize a ser gerenciado
   * @param cacheService - Serviço de cache (injetado via DI)
   * @param tenantService - Serviço de tenant (injetado via DI)
   */
  constructor(
    model: ModelStatic<T>,
    @Inject(TYPES.ICacheService) cacheService: ICacheService,
    @Inject(TYPES.ITenantService) tenantService: ITenantService
  ) {
    this.model = model;
    this.cacheService = cacheService;
    this.tenantService = tenantService;
  }

  /**
   * Busca uma entidade por ID
   * 
   * Verifica cache antes de executar query. Se encontrado no cache, retorna imediatamente.
   * Caso contrário, executa query e cacheia resultado.
   * 
   * IMPORTANTE: Filtra automaticamente por tenantId para garantir isolamento de dados.
   * 
   * @param id - ID da entidade (número ou string)
   * @returns Promise que resolve com a entidade encontrada ou null se não existir
   */
  async findById(id: number | string): Promise<T | null> {
    const tenantFilter = this.getTenantFilter();
    if (!tenantFilter) {
      return null; // Sem tenantId, não retorna nada
    }

    const cacheKey = this.getFindByIdCacheKey(id);

    // Verificar cache
    const cached = await this.cacheService.get<T>(cacheKey);
    if (cached !== null) {
      // Validar que o cache pertence ao tenant atual
      if (this.isEntityFromCurrentTenant(cached)) {
        return cached;
      }
      // Cache inválido (de outro tenant), remover
      await this.cacheService.delete(cacheKey);
    }

    // Query no banco com filtro de tenant
    const result = await this.model.findOne({
      where: {
        id,
        ...tenantFilter,
      } as any,
    });

    // Cachear resultado (apenas se encontrado)
    if (result) {
      await this.cacheService.set(cacheKey, result, this.DEFAULT_CACHE_TTL);
    }

    return result;
  }

  /**
   * Busca todas as entidades, opcionalmente com filtros
   * 
   * IMPORTANTE: Filtra automaticamente por tenantId para garantir isolamento de dados.
   * 
   * @param options - Opções de busca (filtros, ordenação, relacionamentos)
   * @returns Promise que resolve com array de entidades
   */
  async findAll(options?: FindOptions): Promise<T[]> {
    const tenantFilter = this.getTenantFilter();
    if (!tenantFilter) {
      return []; // Sem tenantId, retorna array vazio
    }

    return await this.model.findAll({
      where: {
        ...options?.where,
        ...tenantFilter,
      } as any,
      include: options?.include,
      order: options?.order,
      attributes: options?.attributes,
    });
  }

  /**
   * Busca uma única entidade que atenda aos critérios
   * 
   * IMPORTANTE: Filtra automaticamente por tenantId para garantir isolamento de dados.
   * Se não houver tenantId definido, retorna null (comportamento seguro).
   * 
   * Para métodos que não precisam de tenant, use findOneWithoutTenant().
   * 
   * @param options - Opções de busca (filtros, relacionamentos)
   * @returns Promise que resolve com a entidade encontrada ou null
   */
  async findOne(options: FindOptions): Promise<T | null> {
    const tenantFilter = this.getTenantFilter();
    if (!tenantFilter) {
      return null; // Sem tenantId, não retorna nada (comportamento seguro)
    }

    return await this.model.findOne({
      where: {
        ...options.where,
        ...tenantFilter,
      } as any,
      include: options.include,
      order: options.order,
      attributes: options.attributes,
    });
  }

  /**
   * Busca uma entidade por ID sem aplicar filtro de tenant
   * 
   * Use este método apenas quando necessário acessar dados sem filtro de tenant
   * (ex: validações cross-tenant, operações administrativas).
   * 
   * ATENÇÃO: Este método não aplica isolamento de tenant. Use com cuidado.
   * 
   * @param id - ID da entidade (número ou string)
   * @returns Promise que resolve com a entidade encontrada ou null
   */
  async findByIdWithoutTenant(id: number | string): Promise<T | null> {
    const cacheKey = this.getFindByIdCacheKey(id, false); // Sem tenant no cache key
    
    // Verificar cache
    const cached = await this.cacheService.get<T>(cacheKey);
    if (cached !== null) {
      return cached;
    }

    // Query no banco sem filtro de tenant
    const entity = await this.model.findByPk(id);

    // Cachear resultado (mesmo se null, mas não cacheia null)
    if (entity) {
      await this.cacheService.set(cacheKey, entity, this.DEFAULT_CACHE_TTL);
    }

    return entity;
  }

  /**
   * Busca todas as entidades sem aplicar filtro de tenant
   * 
   * Use este método apenas quando necessário acessar dados sem filtro de tenant
   * (ex: operações administrativas, relatórios globais).
   * 
   * ATENÇÃO: Este método não aplica isolamento de tenant. Use com cuidado.
   * 
   * @param options - Opções de busca (filtros, ordenação, relacionamentos)
   * @returns Promise que resolve com array de entidades
   */
  async findAllWithoutTenant(options?: FindOptions): Promise<T[]> {
    return await this.model.findAll({
      where: options?.where as any,
      include: options?.include,
      order: options?.order,
      attributes: options?.attributes,
    });
  }

  /**
   * Busca uma única entidade sem aplicar filtro de tenant
   * 
   * Use este método apenas quando necessário acessar dados sem filtro de tenant
   * (ex: login, busca de usuário por email antes de autenticação).
   * 
   * ATENÇÃO: Este método não aplica isolamento de tenant. Use com cuidado.
   * 
   * @param options - Opções de busca (filtros, relacionamentos)
   * @returns Promise que resolve com a entidade encontrada ou null
   */
  async findOneWithoutTenant(options: FindOptions): Promise<T | null> {
    return await this.model.findOne({
      where: options.where as any,
      include: options.include,
      order: options.order,
      attributes: options.attributes,
    });
  }

  /**
   * Busca múltiplas entidades sem aplicar filtro de tenant
   * 
   * Use este método apenas quando necessário acessar dados sem filtro de tenant
   * (ex: operações administrativas, relatórios globais).
   * 
   * ATENÇÃO: Este método não aplica isolamento de tenant. Use com cuidado.
   * 
   * @param options - Opções de busca (filtros, ordenação, relacionamentos)
   * @returns Promise que resolve com array de entidades
   */
  async findManyWithoutTenant(options: FindOptions): Promise<T[]> {
    return await this.findAllWithoutTenant(options);
  }

  /**
   * Busca entidades com paginação sem aplicar filtro de tenant
   * 
   * Use este método apenas quando necessário acessar dados sem filtro de tenant
   * (ex: operações administrativas, relatórios globais).
   * 
   * ATENÇÃO: Este método não aplica isolamento de tenant. Use com cuidado.
   * 
   * @param page - Número da página (1-indexed)
   * @param limit - Limite de registros por página
   * @param options - Opções de busca adicionais (filtros, ordenação, relacionamentos)
   * @returns Promise que resolve com resultado paginado
   */
  async findAllPaginatedWithoutTenant(
    page: number,
    limit: number,
    options?: FindOptions
  ): Promise<PaginatedResult<T>> {
    const cacheKey = this.getFindAllPaginatedCacheKey(page, limit, options, false); // Sem tenant no cache key

    // Verificar cache
    const cached = await this.cacheService.get<PaginatedResult<T>>(cacheKey);
    if (cached !== null) {
      return cached;
    }

    // Query no banco sem filtro de tenant
    const offset = (page - 1) * limit;
    
    const { rows, count } = await this.model.findAndCountAll({
      where: options?.where as any,
      include: options?.include,
      order: options?.order,
      attributes: options?.attributes,
      limit,
      offset,
    });

    const result: PaginatedResult<T> = {
      data: rows,
      total: count,
      page,
      limit,
      totalPages: Math.ceil(count / limit),
    };

    // Cachear resultado
    await this.cacheService.set(cacheKey, result, this.DEFAULT_CACHE_TTL);

    return result;
  }

  /**
   * Busca múltiplas entidades que atendam aos critérios
   * 
   * @param options - Opções de busca (filtros, ordenação, relacionamentos)
   * @returns Promise que resolve com array de entidades
   */
  async findMany(options: FindOptions): Promise<T[]> {
    return await this.findAll(options);
  }

  /**
   * Busca entidades com paginação
   * 
   * Verifica cache antes de executar query. Se encontrado no cache, retorna imediatamente.
   * Caso contrário, executa query e cacheia resultado.
   * 
   * IMPORTANTE: Filtra automaticamente por tenantId para garantir isolamento de dados.
   * 
   * @param page - Número da página (1-indexed)
   * @param limit - Limite de registros por página
   * @param options - Opções de busca adicionais (filtros, ordenação, relacionamentos)
   * @returns Promise que resolve com resultado paginado
   */
  async findAllPaginated(
    page: number,
    limit: number,
    options?: FindOptions
  ): Promise<PaginatedResult<T>> {
    const tenantFilter = this.getTenantFilter();
    if (!tenantFilter) {
      // Sem tenantId, retorna resultado vazio
      return {
        data: [],
        total: 0,
        page,
        limit,
        totalPages: 0,
      };
    }

    const cacheKey = this.getFindAllPaginatedCacheKey(page, limit, options);

    // Verificar cache
    const cached = await this.cacheService.get<PaginatedResult<T>>(cacheKey);
    if (cached !== null) {
      return cached;
    }

    // Query no banco com filtro de tenant
    const offset = (page - 1) * limit;
    
    const { rows, count } = await this.model.findAndCountAll({
      where: {
        ...options?.where,
        ...tenantFilter,
      } as any,
      include: options?.include,
      order: options?.order,
      attributes: options?.attributes,
      limit,
      offset,
    });

    const result: PaginatedResult<T> = {
      data: rows,
      total: count,
      page,
      limit,
      totalPages: Math.ceil(count / limit),
    };

    // Cachear resultado
    await this.cacheService.set(cacheKey, result, this.DEFAULT_CACHE_TTL);

    return result;
  }

  /**
   * Cria uma nova entidade
   * 
   * IMPORTANTE: Adiciona automaticamente tenantId aos dados antes de criar.
   * 
   * Após criar, invalida cache de findAll para garantir consistência.
   * 
   * @param entity - Dados parciais da entidade a ser criada
   * @returns Promise que resolve com a entidade criada
   */
  async create(entity: Partial<T>): Promise<T> {
    const tenantFilter = this.getTenantFilter();
    if (!tenantFilter) {
      throw new ForbiddenException(
        'Tenant não identificado. Não é possível criar entidade sem tenantId.',
        'TENANT_NOT_IDENTIFIED'
      );
    }

    // Adicionar tenantId aos dados antes de criar
    const entityWithTenant = {
      ...entity,
      ...tenantFilter,
    } as any;

    const result = await this.model.create(entityWithTenant);
    
    // Invalidar cache de listagem (findAllPaginated)
    await this.invalidateFindAllCache();
    
    return result;
  }

  /**
   * Atualiza uma entidade existente
   * 
   * IMPORTANTE: Valida que a entidade pertence ao tenant atual antes de atualizar.
   * 
   * Após atualizar, invalida cache do registro específico e cache de findAll
   * para garantir consistência.
   * 
   * @param id - ID da entidade a ser atualizada
   * @param entity - Dados parciais a serem atualizados
   * @returns Promise que resolve com a entidade atualizada
   * @throws NotFoundException se a entidade não for encontrada
   * @throws ForbiddenException se a entidade não pertence ao tenant atual
   */
  async update(id: number | string, entity: Partial<T>): Promise<T> {
    const tenantFilter = this.getTenantFilter();
    if (!tenantFilter) {
      throw new ForbiddenException(
        'Tenant não identificado. Não é possível atualizar entidade sem tenantId.',
        'TENANT_NOT_IDENTIFIED'
      );
    }

    // Buscar com filtro de tenant para garantir que pertence ao tenant atual
    const instance = await this.model.findOne({
      where: {
        id,
        ...tenantFilter,
      } as any,
    });
    
    if (!instance) {
      // Obter nome do modelo para mensagem de erro
      const modelName = (this.model as any).name || 'Entidade';
      // Pode ser NotFoundException ou ForbiddenException (se existe mas é de outro tenant)
      // Por segurança, retornar NotFoundException
      throw new NotFoundException(modelName, id);
    }
    
    // Garantir que tenantId não seja alterado (se fornecido no entity)
    const entityWithoutTenant = { ...entity };
    if ('tenantId' in entityWithoutTenant) {
      delete (entityWithoutTenant as any).tenantId;
    }
    
    await instance.update(entityWithoutTenant);
    
    // Invalidar cache do registro específico
    await this.invalidateFindByIdCache(id);
    
    // Invalidar cache de listagem
    await this.invalidateFindAllCache();
    
    return instance;
  }

  /**
   * Remove uma entidade
   * 
   * IMPORTANTE: Valida que a entidade pertence ao tenant atual antes de deletar.
   * 
   * Após deletar, invalida cache do registro específico e cache de findAll
   * para garantir consistência.
   * 
   * @param id - ID da entidade a ser removida
   * @returns Promise que resolve com true se a entidade foi removida, false se não existir
   */
  async delete(id: number | string): Promise<boolean> {
    const tenantFilter = this.getTenantFilter();
    if (!tenantFilter) {
      throw new ForbiddenException(
        'Tenant não identificado. Não é possível deletar entidade sem tenantId.',
        'TENANT_NOT_IDENTIFIED'
      );
    }

    // Buscar com filtro de tenant para garantir que pertence ao tenant atual
    const instance = await this.model.findOne({
      where: {
        id,
        ...tenantFilter,
      } as any,
    });
    
    if (!instance) {
      return false;
    }
    
    await instance.destroy();
    
    // Invalidar cache do registro específico
    await this.invalidateFindByIdCache(id);
    
    // Invalidar cache de listagem
    await this.invalidateFindAllCache();
    
    return true;
  }

  /**
   * Obtém o filtro de tenant/consultoria atual baseado no tipo de usuário
   * 
   * Tenta obter filtro na seguinte ordem:
   * 1. RequestContext do AsyncLocalStorage (definido pelo middleware)
   * 2. TenantService (fallback para compatibilidade)
   * 
   * IMPORTANTE: O filtro varia conforme o tipo de usuário:
   * - GOD: sem filtro (retorna null) - acesso total
   * - CONSULTOR: filtro por consultoriaId (se aplicável ao modelo)
   * - ROOT/CLIENT: filtro por tenantId
   * 
   * @returns Objeto com filtro (tenantId ou consultoriaId) ou null se não houver filtro necessário
   */
  protected getTenantFilter(): { tenantId?: number; consultoriaId?: number } | null {
    // 1. Tentar obter do RequestContext via AsyncLocalStorage (mais confiável)
    const context = getRequestContext();
    if (context) {
      // Verificar se há consultoriaId (para CONSULTOR)
      const consultoriaId = context.getConsultoriaId();
      if (consultoriaId && typeof consultoriaId === 'number' && consultoriaId > 0) {
        // Retornar filtro por consultoriaId (será aplicado apenas se o modelo tiver esse campo)
        return { consultoriaId };
      }

      // Verificar se há tenantId (para ROOT/CLIENT)
      const tenantId = context.getTenantId();
      if (tenantId && typeof tenantId === 'number' && tenantId > 0) {
        return { tenantId };
      }
    }

    // 2. Tentar obter do TenantService (fallback)
    const tenantId = this.tenantService.getCurrentTenantId();
    if (tenantId && tenantId > 0) {
      return { tenantId };
    }

    return null;
  }

  /**
   * Verifica se uma entidade pertence ao tenant atual
   * 
   * @param entity - Entidade a ser verificada
   * @returns true se pertence ao tenant atual, false caso contrário
   */
  protected isEntityFromCurrentTenant(entity: T): boolean {
    const tenantFilter = this.getTenantFilter();
    if (!tenantFilter) {
      return false;
    }
    return (entity as any).tenantId === tenantFilter.tenantId;
  }

  /**
   * Gera chave de cache para findById
   * 
   * IMPORTANTE: Por padrão, inclui tenantId na chave para garantir isolamento de cache por tenant.
   * 
   * @param id - ID da entidade
   * @param includeTenant - Se true, inclui tenantId na chave (padrão: true)
   * @returns Chave de cache
   */
  protected getFindByIdCacheKey(id: number | string, includeTenant: boolean = true): string {
    const entityName = this.getEntityName();
    if (includeTenant) {
      const tenantFilter = this.getTenantFilter();
      const tenantId = tenantFilter?.tenantId || 'no-tenant';
      return `${entityName}:tenant:${tenantId}:findById:${id}`;
    }
    return `${entityName}:findById:${id}`;
  }

  /**
   * Gera chave de cache para findAllPaginated
   * 
   * IMPORTANTE: Por padrão, inclui tenantId na chave para garantir isolamento de cache por tenant.
   * 
   * @param page - Número da página
   * @param limit - Limite de registros
   * @param options - Opções de busca
   * @param includeTenant - Se true, inclui tenantId na chave (padrão: true)
   * @returns Chave de cache
   */
  protected getFindAllPaginatedCacheKey(
    page: number,
    limit: number,
    options?: FindOptions,
    includeTenant: boolean = true
  ): string {
    const entityName = this.getEntityName();
    
    // Serializar options para criar key única
    const optionsKey = options
      ? JSON.stringify(options, Object.keys(options).sort())
      : 'default';
    
    if (includeTenant) {
      const tenantFilter = this.getTenantFilter();
      const tenantId = tenantFilter?.tenantId || 'no-tenant';
      return `${entityName}:tenant:${tenantId}:findAllPaginated:${page}:${limit}:${optionsKey}`;
    }
    return `${entityName}:findAllPaginated:${page}:${limit}:${optionsKey}`;
  }

  /**
   * Obtém o nome da entidade para uso em chaves de cache
   * 
   * @returns Nome da entidade (normalizado)
   */
  protected getEntityName(): string {
    const modelName = (this.model as any).name || 'Entity';
    // Normalizar: remover sufixos comuns e converter para lowercase
    return modelName.replace(/Model$/, '').toLowerCase();
  }

  /**
   * Invalida cache de findById para um ID específico
   * 
   * @param id - ID da entidade
   */
  protected async invalidateFindByIdCache(id: number | string): Promise<void> {
    const cacheKey = this.getFindByIdCacheKey(id);
    await this.cacheService.delete(cacheKey);
  }

  /**
   * Invalida todos os caches de findAllPaginated
   * 
   * IMPORTANTE: Inclui tenantId no padrão para garantir isolamento de cache por tenant.
   * 
   * Usa padrão para remover todas as chaves de listagem do tenant atual.
   */
  protected async invalidateFindAllCache(): Promise<void> {
    const entityName = this.getEntityName();
    const tenantFilter = this.getTenantFilter();
    const tenantId = tenantFilter?.tenantId || '*';
    const pattern = `${entityName}:tenant:${tenantId}:findAllPaginated:*`;
    await this.cacheService.deleteByPattern(pattern);
  }
}
