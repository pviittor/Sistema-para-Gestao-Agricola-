import { Injectable, Inject } from '../../core/di';
import { TYPES } from '../../core/di/types';
import { BaseRepository } from '../../core/repository/BaseRepository';
import { IBenfeitoriaRepository } from './IBenfeitoriaRepository';
import { ICacheService } from '../../core/cache/ICacheService';
import { ITenantService } from '../../core/tenant/ITenantService';
import { PaginatedResult } from '../../core/repository/types';
import Benfeitoria from '../../models/Benfeitoria';
import Fazenda from '../../models/Fazenda';
import UnidadeMedida from '../../models/UnidadeMedida';
import Safra from '../../models/Safra';
import Usuario from '../../models/Usuario';

/**
 * Repositório para entidade Benfeitoria
 */
@Injectable()
export class BenfeitoriaRepository extends BaseRepository<Benfeitoria> implements IBenfeitoriaRepository {
  constructor(
    @Inject(TYPES.ICacheService) cacheService: ICacheService,
    @Inject(TYPES.ITenantService) tenantService: ITenantService
  ) {
    super(Benfeitoria, cacheService, tenantService);
  }

  /**
   * Busca uma benfeitoria por ID com todas as associações
   */
  async findById(id: number | string): Promise<Benfeitoria | null> {
    const tenantFilter = this.getTenantFilter();
    if (!tenantFilter) {
      return null;
    }

    const cacheKey = `benfeitoria:findById:${id}:${JSON.stringify(tenantFilter)}`;
    const cached = await this.cacheService.get<Benfeitoria>(cacheKey);
    if (cached !== null) {
      return cached;
    }

    const where: any = { id_benf: id };
    if (tenantFilter.tenantId) {
      where.tenantId = tenantFilter.tenantId;
    }

    const result = await this.model.findOne({
      where,
      include: [
        {
          model: Fazenda,
          as: 'fazenda',
          required: false,
        },
        {
          model: UnidadeMedida,
          as: 'unidadeMedida',
          required: false,
        },
        {
          model: Safra,
          as: 'safra',
          required: false,
        },
        {
          model: Usuario,
          as: 'usuarioCriador',
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
   * Busca todas as benfeitorias paginadas com associações
   */
  async findAllPaginated(page: number = 1, limit: number = 10): Promise<PaginatedResult<Benfeitoria>> {
    const offset = (page - 1) * limit;
    const tenantFilter = this.getTenantFilter();
    const cacheKey = `benfeitoria:list:${page}:${limit}:${JSON.stringify(tenantFilter)}`;

    const cached = await this.cacheService.get<PaginatedResult<Benfeitoria>>(cacheKey);
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
      order: [['id_benf', 'DESC']],
      include: [
        {
          model: Fazenda,
          as: 'fazenda',
          required: false,
        },
        {
          model: UnidadeMedida,
          as: 'unidadeMedida',
          required: false,
        },
        {
          model: Safra,
          as: 'safra',
          required: false,
        },
      ],
    });

    const result: PaginatedResult<Benfeitoria> = {
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
   * Sobrescreve create para invalidar caches relevantes
   */
  async create(entity: Partial<Benfeitoria>): Promise<Benfeitoria> {
    const result = await super.create(entity);

    await this.cacheService.deleteByPattern('benfeitoria:list:*');

    return result;
  }

  /**
   * Sobrescreve update para usar id_benf ao invés de id
   */
  async update(id: number | string, entity: Partial<Benfeitoria>): Promise<Benfeitoria> {
    const tenantFilter = this.getTenantFilter();
    if (!tenantFilter) {
      throw new Error('Tenant não identificado. Não é possível atualizar entidade sem tenantId.');
    }

    const where: any = { id_benf: id };
    if (tenantFilter.tenantId) {
      where.tenantId = tenantFilter.tenantId;
    }

    const instance = await this.model.findOne({ where });

    if (!instance) {
      throw new Error('Benfeitoria não encontrada');
    }

    const entityWithoutAudit = { ...entity };
    if ('tenantId' in entityWithoutAudit) {
      delete (entityWithoutAudit as any).tenantId;
    }
    if ('id_benf' in entityWithoutAudit) {
      delete (entityWithoutAudit as any).id_benf;
    }

    await instance.update(entityWithoutAudit);

    await this.cacheService.deleteByPattern('benfeitoria:findById:*');
    await this.cacheService.deleteByPattern('benfeitoria:list:*');

    return instance;
  }

  /**
   * Sobrescreve delete para usar id_benf ao invés de id
   */
  async delete(id: number | string): Promise<boolean> {
    const tenantFilter = this.getTenantFilter();
    if (!tenantFilter) {
      throw new Error('Tenant não identificado. Não é possível deletar entidade sem tenantId.');
    }

    const where: any = { id_benf: id };
    if (tenantFilter.tenantId) {
      where.tenantId = tenantFilter.tenantId;
    }

    const instance = await this.model.findOne({ where });

    if (!instance) {
      return false;
    }

    await instance.destroy();

    await this.cacheService.deleteByPattern('benfeitoria:findById:*');
    await this.cacheService.deleteByPattern('benfeitoria:list:*');

    return true;
  }
}
