import { Injectable, Inject } from '../../core/di';
import { TYPES } from '../../core/di/types';
import { BaseRepository } from '../../core/repository/BaseRepository';
import { IApontamentoProdutoRepository } from './IApontamentoProdutoRepository';
import { ICacheService } from '../../core/cache/ICacheService';
import { ITenantService } from '../../core/tenant/ITenantService';
import { PaginatedResult } from '../../core/repository/types';
import ApontamentoProduto from '../../models/ApontamentoProduto';
import Apontamento from '../../models/Apontamento';
import Produto from '../../models/Produto';
import Usuario from '../../models/Usuario';

/**
 * Repositório para entidade ApontamentoProduto
 */
@Injectable()
export class ApontamentoProdutoRepository extends BaseRepository<ApontamentoProduto> implements IApontamentoProdutoRepository {
  constructor(
    @Inject(TYPES.ICacheService) cacheService: ICacheService,
    @Inject(TYPES.ITenantService) tenantService: ITenantService
  ) {
    super(ApontamentoProduto, cacheService, tenantService);
  }

  /**
   * Busca um apontamento de produto por ID com todas as associações
   */
  async findById(id: number | string): Promise<ApontamentoProduto | null> {
    const tenantFilter = this.getTenantFilter();
    if (!tenantFilter) {
      return null;
    }

    const cacheKey = `apontamentoProduto:findById:${id}:${JSON.stringify(tenantFilter)}`;
    const cached = await this.cacheService.get<ApontamentoProduto>(cacheKey);
    if (cached !== null) {
      return cached;
    }

    const where: any = { id_aptprod: id };
    if (tenantFilter.tenantId) {
      where.tenantId = tenantFilter.tenantId;
    }

    const result = await this.model.findOne({
      where,
      include: [
        {
          model: Apontamento,
          as: 'apontamento',
          required: false,
        },
        {
          model: Produto,
          as: 'produto',
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
   * Busca todos os apontamentos de produto paginados com associações
   */
  async findAllPaginated(page: number = 1, limit: number = 10): Promise<PaginatedResult<ApontamentoProduto>> {
    const offset = (page - 1) * limit;
    const tenantFilter = this.getTenantFilter();
    const cacheKey = `apontamentoProduto:list:${page}:${limit}:${JSON.stringify(tenantFilter)}`;

    const cached = await this.cacheService.get<PaginatedResult<ApontamentoProduto>>(cacheKey);
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
      order: [['data', 'DESC'], ['id_aptprod', 'DESC']],
      include: [
        {
          model: Apontamento,
          as: 'apontamento',
          required: false,
        },
        {
          model: Produto,
          as: 'produto',
          required: false,
        },
      ],
    });

    const result: PaginatedResult<ApontamentoProduto> = {
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
  async create(entity: Partial<ApontamentoProduto>): Promise<ApontamentoProduto> {
    const result = await super.create(entity);

    await this.cacheService.deleteByPattern('apontamentoProduto:list:*');

    return result;
  }

  /**
   * Sobrescreve update para usar id_aptprod ao invés de id
   */
  async update(id: number | string, entity: Partial<ApontamentoProduto>): Promise<ApontamentoProduto> {
    const tenantFilter = this.getTenantFilter();
    if (!tenantFilter) {
      throw new Error('Tenant não identificado. Não é possível atualizar entidade sem tenantId.');
    }

    const where: any = { id_aptprod: id };
    if (tenantFilter.tenantId) {
      where.tenantId = tenantFilter.tenantId;
    }

    const instance = await this.model.findOne({ where });

    if (!instance) {
      throw new Error('Apontamento de produto não encontrado');
    }

    const entityWithoutAudit = { ...entity };
    if ('tenantId' in entityWithoutAudit) {
      delete (entityWithoutAudit as any).tenantId;
    }
    if ('id_aptprod' in entityWithoutAudit) {
      delete (entityWithoutAudit as any).id_aptprod;
    }

    await instance.update(entityWithoutAudit);

    await this.cacheService.deleteByPattern('apontamentoProduto:findById:*');
    await this.cacheService.deleteByPattern('apontamentoProduto:list:*');

    return instance;
  }

  /**
   * Sobrescreve delete para usar id_aptprod ao invés de id
   */
  async delete(id: number | string): Promise<boolean> {
    const tenantFilter = this.getTenantFilter();
    if (!tenantFilter) {
      throw new Error('Tenant não identificado. Não é possível deletar entidade sem tenantId.');
    }

    const where: any = { id_aptprod: id };
    if (tenantFilter.tenantId) {
      where.tenantId = tenantFilter.tenantId;
    }

    const instance = await this.model.findOne({ where });

    if (!instance) {
      return false;
    }

    await instance.destroy();

    await this.cacheService.deleteByPattern('apontamentoProduto:findById:*');
    await this.cacheService.deleteByPattern('apontamentoProduto:list:*');

    return true;
  }
}
