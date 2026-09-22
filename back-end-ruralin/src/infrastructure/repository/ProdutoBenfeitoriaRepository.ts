import { Injectable, Inject } from '../../core/di';
import { TYPES } from '../../core/di/types';
import { BaseRepository } from '../../core/repository/BaseRepository';
import { IProdutoBenfeitoriaRepository } from './IProdutoBenfeitoriaRepository';
import { ICacheService } from '../../core/cache/ICacheService';
import { ITenantService } from '../../core/tenant/ITenantService';
import { PaginatedResult } from '../../core/repository/types';
import ProdutoBenfeitoria from '../../models/ProdutoBenfeitoria';
import Benfeitoria from '../../models/Benfeitoria';
import Produto from '../../models/Produto';
import Safra from '../../models/Safra';
import Usuario from '../../models/Usuario';

/**
 * Repositório para entidade ProdutoBenfeitoria
 */
@Injectable()
export class ProdutoBenfeitoriaRepository extends BaseRepository<ProdutoBenfeitoria> implements IProdutoBenfeitoriaRepository {
  constructor(
    @Inject(TYPES.ICacheService) cacheService: ICacheService,
    @Inject(TYPES.ITenantService) tenantService: ITenantService
  ) {
    super(ProdutoBenfeitoria, cacheService, tenantService);
  }

  /**
   * Busca um produto benfeitoria por ID com todas as associações
   */
  async findById(id: number | string): Promise<ProdutoBenfeitoria | null> {
    const tenantFilter = this.getTenantFilter();
    if (!tenantFilter) {
      return null;
    }

    const cacheKey = `produtoBenfeitoria:findById:${id}:${JSON.stringify(tenantFilter)}`;
    const cached = await this.cacheService.get<ProdutoBenfeitoria>(cacheKey);
    if (cached !== null) {
      return cached;
    }

    const where: any = { id_prodbenf: id };
    if (tenantFilter.tenantId) {
      where.tenantId = tenantFilter.tenantId;
    }

    const result = await this.model.findOne({
      where,
      include: [
        {
          model: Benfeitoria,
          as: 'benfeitoria',
          required: false,
        },
        {
          model: Produto,
          as: 'produto',
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
   * Busca todos os produtos benfeitoria paginados com associações
   */
  async findAllPaginated(page: number = 1, limit: number = 10): Promise<PaginatedResult<ProdutoBenfeitoria>> {
    const offset = (page - 1) * limit;
    const tenantFilter = this.getTenantFilter();
    const cacheKey = `produtoBenfeitoria:list:${page}:${limit}:${JSON.stringify(tenantFilter)}`;

    const cached = await this.cacheService.get<PaginatedResult<ProdutoBenfeitoria>>(cacheKey);
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
      order: [['data', 'DESC'], ['id_prodbenf', 'DESC']],
      include: [
        {
          model: Benfeitoria,
          as: 'benfeitoria',
          required: false,
        },
        {
          model: Produto,
          as: 'produto',
          required: false,
        },
        {
          model: Safra,
          as: 'safra',
          required: false,
        },
      ],
    });

    const result: PaginatedResult<ProdutoBenfeitoria> = {
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
  async create(entity: Partial<ProdutoBenfeitoria>): Promise<ProdutoBenfeitoria> {
    const result = await super.create(entity);

    await this.cacheService.deleteByPattern('produtoBenfeitoria:list:*');

    return result;
  }

  /**
   * Sobrescreve update para usar id_prodbenf ao invés de id
   */
  async update(id: number | string, entity: Partial<ProdutoBenfeitoria>): Promise<ProdutoBenfeitoria> {
    const tenantFilter = this.getTenantFilter();
    if (!tenantFilter) {
      throw new Error('Tenant não identificado. Não é possível atualizar entidade sem tenantId.');
    }

    const where: any = { id_prodbenf: id };
    if (tenantFilter.tenantId) {
      where.tenantId = tenantFilter.tenantId;
    }

    const instance = await this.model.findOne({ where });

    if (!instance) {
      throw new Error('Produto benfeitoria não encontrado');
    }

    const entityWithoutAudit = { ...entity };
    if ('tenantId' in entityWithoutAudit) {
      delete (entityWithoutAudit as any).tenantId;
    }
    if ('id_prodbenf' in entityWithoutAudit) {
      delete (entityWithoutAudit as any).id_prodbenf;
    }

    await instance.update(entityWithoutAudit);

    await this.cacheService.deleteByPattern('produtoBenfeitoria:findById:*');
    await this.cacheService.deleteByPattern('produtoBenfeitoria:list:*');

    return instance;
  }

  /**
   * Sobrescreve delete para usar id_prodbenf ao invés de id
   */
  async delete(id: number | string): Promise<boolean> {
    const tenantFilter = this.getTenantFilter();
    if (!tenantFilter) {
      throw new Error('Tenant não identificado. Não é possível deletar entidade sem tenantId.');
    }

    const where: any = { id_prodbenf: id };
    if (tenantFilter.tenantId) {
      where.tenantId = tenantFilter.tenantId;
    }

    const instance = await this.model.findOne({ where });

    if (!instance) {
      return false;
    }

    await instance.destroy();

    await this.cacheService.deleteByPattern('produtoBenfeitoria:findById:*');
    await this.cacheService.deleteByPattern('produtoBenfeitoria:list:*');

    return true;
  }
}
