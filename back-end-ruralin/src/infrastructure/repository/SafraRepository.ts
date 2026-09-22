import { Injectable, Inject } from '../../core/di';
import { TYPES } from '../../core/di/types';
import { BaseRepository } from '../../core/repository/BaseRepository';
import { ISafraRepository } from './ISafraRepository';
import { ICacheService } from '../../core/cache/ICacheService';
import { ITenantService } from '../../core/tenant/ITenantService';
import Safra, { StatusSafra } from '../../models/Safra';
import { PaginatedResult } from '../../core/repository/types';
import { FindOptions } from 'sequelize';
import Cultura from '../../models/Cultura';

/**
 * Repositório para entidade Safra
 */
@Injectable()
export class SafraRepository extends BaseRepository<Safra> implements ISafraRepository {
  constructor(
    @Inject(TYPES.ICacheService) cacheService: ICacheService,
    @Inject(TYPES.ITenantService) tenantService: ITenantService
  ) {
    super(Safra, cacheService, tenantService);
  }

  /**
   * Busca todas as entidades paginadas
   */
  async findAllPaginated(page: number = 1, limit: number = 10): Promise<PaginatedResult<Safra>> {
    const offset = (page - 1) * limit;
    const tenantFilter = this.getTenantFilter();
    const cacheKey = `safra:list:${page}:${limit}:${JSON.stringify(tenantFilter)}`;

    const cached = await this.cacheService.get<PaginatedResult<Safra>>(cacheKey);
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
      order: [['dataInicio', 'DESC']],
      include: [
        {
          model: Cultura,
          as: 'cultura',
          required: false,
        },
      ],
    });

    const result: PaginatedResult<Safra> = {
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
  async findAll(): Promise<Safra[]> {
    const tenantFilter = this.getTenantFilter();
    const cacheKey = `safra:list:all:${JSON.stringify(tenantFilter)}`;

    const cached = await this.cacheService.get<Safra[]>(cacheKey);
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
      order: [['dataInicio', 'DESC']],
      include: [
        {
          model: Cultura,
          as: 'cultura',
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
  async findById(id: number | string): Promise<Safra | null> {
    const tenantFilter = this.getTenantFilter();
    const cacheKey = `safra:findById:${id}:${JSON.stringify(tenantFilter)}`;

    const cached = await this.cacheService.get<Safra>(cacheKey);
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
          model: Cultura,
          as: 'cultura',
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
  async findOne(options?: FindOptions): Promise<Safra | null> {
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
  async create(data: Partial<Safra>): Promise<Safra> {
    const result = await this.model.create(data as any);
    await this.cacheService.delete('safra:list:*');
    await this.cacheService.delete('safra:findByCultura:*');
    await this.cacheService.delete('safra:findByStatus:*');
    return result;
  }

  /**
   * Atualiza uma entidade
   */
  async update(id: number | string, data: Partial<Safra>): Promise<Safra> {
    const entity = await this.findById(id);
    if (!entity) {
      throw new Error('Safra não encontrada');
    }

    await entity.update(data as any);
    await this.cacheService.delete('safra:list:*');
    await this.cacheService.delete(`safra:findById:${id}`);
    await this.cacheService.delete('safra:findByCultura:*');
    await this.cacheService.delete('safra:findByStatus:*');
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
    await this.cacheService.delete('safra:list:*');
    await this.cacheService.delete(`safra:findById:${id}`);
    await this.cacheService.delete('safra:findByCultura:*');
    await this.cacheService.delete('safra:findByStatus:*');
    return true;
  }

  /**
   * Busca safras por cultura
   */
  async findByCultura(culturaId: number): Promise<Safra[]> {
    const tenantFilter = this.getTenantFilter();
    const cacheKey = `safra:findByCultura:${culturaId}:${JSON.stringify(tenantFilter)}`;
    
    const cached = await this.cacheService.get<Safra[]>(cacheKey);
    if (cached !== null) {
      return cached;
    }

    const where: any = { culturaId };
    if (tenantFilter) {
      if (tenantFilter.tenantId) {
        where.tenantId = tenantFilter.tenantId;
      }
    }

    const result = await this.model.findAll({
      where,
      order: [['dataInicio', 'DESC']],
      include: [
        {
          model: Cultura,
          as: 'cultura',
          required: false,
        },
      ],
    });

    await this.cacheService.set(cacheKey, result, this.DEFAULT_CACHE_TTL);
    return result;
  }

  /**
   * Busca safras por status
   */
  async findByStatus(status: StatusSafra): Promise<Safra[]> {
    const tenantFilter = this.getTenantFilter();
    const cacheKey = `safra:findByStatus:${status}:${JSON.stringify(tenantFilter)}`;
    
    const cached = await this.cacheService.get<Safra[]>(cacheKey);
    if (cached !== null) {
      return cached;
    }

    const where: any = { status };
    if (tenantFilter) {
      if (tenantFilter.tenantId) {
        where.tenantId = tenantFilter.tenantId;
      }
    }

    const result = await this.model.findAll({
      where,
      order: [['dataInicio', 'DESC']],
      include: [
        {
          model: Cultura,
          as: 'cultura',
          required: false,
        },
      ],
    });

    await this.cacheService.set(cacheKey, result, this.DEFAULT_CACHE_TTL);
    return result;
  }
}
