import { Injectable, Inject } from '../../core/di';
import { TYPES } from '../../core/di/types';
import { BaseRepository } from '../../core/repository/BaseRepository';
import { ICentroCustoRepository } from './ICentroCustoRepository';
import { ICacheService } from '../../core/cache/ICacheService';
import { ITenantService } from '../../core/tenant/ITenantService';
import CentroCusto from '../../models/CentroCusto';
import { PaginatedResult } from '../../core/repository/types';
import { FindOptions } from 'sequelize';

/**
 * Repositório para entidade CentroCusto
 */
@Injectable()
export class CentroCustoRepository extends BaseRepository<CentroCusto> implements ICentroCustoRepository {
  constructor(
    @Inject(TYPES.ICacheService) cacheService: ICacheService,
    @Inject(TYPES.ITenantService) tenantService: ITenantService
  ) {
    super(CentroCusto, cacheService, tenantService);
  }

  /**
   * Busca todas as entidades paginadas
   */
  async findAllPaginated(page: number = 1, limit: number = 10): Promise<PaginatedResult<CentroCusto>> {
    const offset = (page - 1) * limit;
    const tenantFilter = this.getTenantFilter();
    const cacheKey = `centroCusto:list:${page}:${limit}:${JSON.stringify(tenantFilter)}`;

    const cached = await this.cacheService.get<PaginatedResult<CentroCusto>>(cacheKey);
    if (cached !== null) {
      return cached;
    }

    const where: any = {};
    if (tenantFilter) {
      if (tenantFilter.tenantId) {
        where.tenantId = tenantFilter.tenantId;
      }
    }

    const { count, rows } = await this.model.findAndCountAll({
      where,
      limit,
      offset,
      order: [['codigo', 'ASC']],
      include: [
        {
          model: CentroCusto,
          as: 'centroCustoPai',
          required: false,
        },
      ],
    });

    const result: PaginatedResult<CentroCusto> = {
      data: rows,
      page,
      limit,
      total: count,
      totalPages: Math.ceil(count / limit),
    };

    await this.cacheService.set(cacheKey, result, this.DEFAULT_CACHE_TTL);
    return result;
  }

  /**
   * Busca todas as entidades
   */
  async findAll(): Promise<CentroCusto[]> {
    const tenantFilter = this.getTenantFilter();
    const cacheKey = `centroCusto:list:all:${JSON.stringify(tenantFilter)}`;

    const cached = await this.cacheService.get<CentroCusto[]>(cacheKey);
    if (cached !== null) {
      return cached;
    }

    const where: any = {};
    if (tenantFilter) {
      if (tenantFilter.tenantId) {
        where.tenantId = tenantFilter.tenantId;
      }
    }

    const result = await this.model.findAll({
      where,
      order: [['codigo', 'ASC']],
      include: [
        {
          model: CentroCusto,
          as: 'centroCustoPai',
          required: false,
        },
      ],
    });

    await this.cacheService.set(cacheKey, result, this.DEFAULT_CACHE_TTL);
    return result;
  }

  /**
   * Busca uma entidade por ID
   */
  async findById(id: number | string): Promise<CentroCusto | null> {
    const tenantFilter = this.getTenantFilter();
    const cacheKey = `centroCusto:findById:${id}:${JSON.stringify(tenantFilter)}`;

    const cached = await this.cacheService.get<CentroCusto>(cacheKey);
    if (cached !== null) {
      return cached;
    }

    const where: any = { id };
    if (tenantFilter) {
      if (tenantFilter.tenantId) {
        where.tenantId = tenantFilter.tenantId;
      }
    }

    const result = await this.model.findOne({
      where,
      include: [
        {
          model: CentroCusto,
          as: 'centroCustoPai',
          required: false,
        },
        {
          model: CentroCusto,
          as: 'centrosCustoFilhos',
          required: false,
        },
      ],
    });

    if (result) {
      await this.cacheService.set(cacheKey, result, this.DEFAULT_CACHE_TTL);
    }

    return result;
  }

  /**
   * Busca uma entidade
   */
  async findOne(options?: FindOptions): Promise<CentroCusto | null> {
    const tenantFilter = this.getTenantFilter();
    const where: any = { ...(options?.where as any) };
    
    if (tenantFilter) {
      if (tenantFilter.tenantId) {
        where.tenantId = tenantFilter.tenantId;
      }
    }

    return await this.model.findOne({
      ...options,
      where,
    });
  }

  /**
   * Cria uma entidade
   */
  async create(data: Partial<CentroCusto>): Promise<CentroCusto> {
    const result = await this.model.create(data as any);
    await this.cacheService.delete('centroCusto:list:*');
    await this.cacheService.delete('centroCusto:findByPai:*');
    return result;
  }

  /**
   * Atualiza uma entidade
   */
  async update(id: number | string, data: Partial<CentroCusto>): Promise<CentroCusto> {
    const entity = await this.findById(id);
    if (!entity) {
      throw new Error('Centro de custo não encontrado');
    }

    await entity.update(data as any);
    await this.cacheService.delete('centroCusto:list:*');
    await this.cacheService.delete(`centroCusto:findById:${id}`);
    await this.cacheService.delete('centroCusto:findByPai:*');
    return entity;
  }

  /**
   * Deleta uma entidade
   */
  async delete(id: number | string): Promise<boolean> {
    const entity = await this.findById(id);
    if (!entity) {
      return false;
    }

    await entity.destroy();
    await this.cacheService.delete('centroCusto:list:*');
    await this.cacheService.delete(`centroCusto:findById:${id}`);
    await this.cacheService.delete('centroCusto:findByPai:*');
    return true;
  }

  /**
   * Busca uma entidade por ID sem aplicar filtro de tenant
   */
  async findByIdWithoutTenant(id: number | string): Promise<CentroCusto | null> {
    return await super.findByIdWithoutTenant(id);
  }

  /**
   * Busca centros de custo filhos de um pai específico
   */
  async findByPai(centroCustoPaiId: number): Promise<CentroCusto[]> {
    const tenantFilter = this.getTenantFilter();
    const cacheKey = `centroCusto:findByPai:${centroCustoPaiId}:${JSON.stringify(tenantFilter)}`;
    
    const cached = await this.cacheService.get<CentroCusto[]>(cacheKey);
    if (cached !== null) {
      return cached;
    }

    const where: any = { centroCustoPaiId };
    if (tenantFilter) {
      if (tenantFilter.tenantId) {
        where.tenantId = tenantFilter.tenantId;
      }
    }

    const result = await this.model.findAll({
      where,
      order: [['codigo', 'ASC']],
      include: [
        {
          model: CentroCusto,
          as: 'centroCustoPai',
          required: false,
        },
      ],
    });

    await this.cacheService.set(cacheKey, result, this.DEFAULT_CACHE_TTL);
    return result;
  }
}
