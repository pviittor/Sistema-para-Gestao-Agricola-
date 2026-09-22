import { Injectable, Inject } from '../../core/di';
import { TYPES } from '../../core/di/types';
import { BaseRepository } from '../../core/repository/BaseRepository';
import { IApontamentoMaquinasRepository } from './IApontamentoMaquinasRepository';
import { ICacheService } from '../../core/cache/ICacheService';
import { ITenantService } from '../../core/tenant/ITenantService';
import { PaginatedResult } from '../../core/repository/types';
import ApontamentoMaquinas from '../../models/ApontamentoMaquinas';
import Apontamento from '../../models/Apontamento';
import Maquina from '../../models/Maquina';
import Pessoa from '../../models/Pessoa';
import Abastecimento from '../../models/Abastecimento';
import Usuario from '../../models/Usuario';

/**
 * Repositorio para entidade ApontamentoMaquinas
 */
@Injectable()
export class ApontamentoMaquinasRepository extends BaseRepository<ApontamentoMaquinas> implements IApontamentoMaquinasRepository {
  constructor(
    @Inject(TYPES.ICacheService) cacheService: ICacheService,
    @Inject(TYPES.ITenantService) tenantService: ITenantService
  ) {
    super(ApontamentoMaquinas, cacheService, tenantService);
  }

  /**
   * Busca um apontamento de maquina por ID com todas as associacoes
   */
  async findById(id: number | string): Promise<ApontamentoMaquinas | null> {
    const tenantFilter = this.getTenantFilter();
    if (!tenantFilter) {
      return null;
    }

    const cacheKey = `apontamentoMaquinas:findById:${id}:${JSON.stringify(tenantFilter)}`;
    const cached = await this.cacheService.get<ApontamentoMaquinas>(cacheKey);
    if (cached !== null) {
      return cached;
    }

    const where: any = { id_aptmaq: id };
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
          model: Maquina,
          as: 'maquina',
          required: false,
        },
        {
          model: Maquina,
          as: 'implemento',
          required: false,
        },
        {
          model: Pessoa,
          as: 'operador',
          required: false,
        },
        {
          model: Abastecimento,
          as: 'abastecimento',
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
   * Busca todos os apontamentos de maquinas paginados com associacoes resumidas
   */
  async findAllPaginated(page: number = 1, limit: number = 10): Promise<PaginatedResult<ApontamentoMaquinas>> {
    const offset = (page - 1) * limit;
    const tenantFilter = this.getTenantFilter();
    const cacheKey = `apontamentoMaquinas:list:${page}:${limit}:${JSON.stringify(tenantFilter)}`;

    const cached = await this.cacheService.get<PaginatedResult<ApontamentoMaquinas>>(cacheKey);
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
      order: [['data', 'DESC'], ['id_aptmaq', 'DESC']],
      include: [
        {
          model: Apontamento,
          as: 'apontamento',
          required: false,
        },
        {
          model: Maquina,
          as: 'maquina',
          required: false,
        },
      ],
    });

    const result: PaginatedResult<ApontamentoMaquinas> = {
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
  async create(entity: Partial<ApontamentoMaquinas>): Promise<ApontamentoMaquinas> {
    const result = await super.create(entity);

    await this.cacheService.deleteByPattern('apontamentoMaquinas:list:*');

    return result;
  }

  /**
   * Sobrescreve update para usar id_aptmaq ao inves de id
   */
  async update(id: number | string, entity: Partial<ApontamentoMaquinas>): Promise<ApontamentoMaquinas> {
    const tenantFilter = this.getTenantFilter();
    if (!tenantFilter) {
      throw new Error('Tenant nao identificado. Nao e possivel atualizar entidade sem tenantId.');
    }

    const where: any = { id_aptmaq: id };
    if (tenantFilter.tenantId) {
      where.tenantId = tenantFilter.tenantId;
    }

    const instance = await this.model.findOne({ where });

    if (!instance) {
      throw new Error('Apontamento de maquina nao encontrado');
    }

    const entityWithoutAudit = { ...entity };
    if ('tenantId' in entityWithoutAudit) {
      delete (entityWithoutAudit as any).tenantId;
    }
    if ('id_aptmaq' in entityWithoutAudit) {
      delete (entityWithoutAudit as any).id_aptmaq;
    }

    await instance.update(entityWithoutAudit);

    await this.cacheService.deleteByPattern('apontamentoMaquinas:findById:*');
    await this.cacheService.deleteByPattern('apontamentoMaquinas:list:*');

    return instance;
  }

  /**
   * Sobrescreve delete para usar id_aptmaq ao inves de id
   */
  async delete(id: number | string): Promise<boolean> {
    const tenantFilter = this.getTenantFilter();
    if (!tenantFilter) {
      throw new Error('Tenant nao identificado. Nao e possivel deletar entidade sem tenantId.');
    }

    const where: any = { id_aptmaq: id };
    if (tenantFilter.tenantId) {
      where.tenantId = tenantFilter.tenantId;
    }

    const instance = await this.model.findOne({ where });

    if (!instance) {
      return false;
    }

    await instance.destroy();

    await this.cacheService.deleteByPattern('apontamentoMaquinas:findById:*');
    await this.cacheService.deleteByPattern('apontamentoMaquinas:list:*');

    return true;
  }
}
