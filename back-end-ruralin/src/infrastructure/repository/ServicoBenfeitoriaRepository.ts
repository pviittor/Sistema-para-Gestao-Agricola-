import { Injectable, Inject } from '../../core/di';
import { TYPES } from '../../core/di/types';
import { BaseRepository } from '../../core/repository/BaseRepository';
import { IServicoBenfeitoriaRepository } from './IServicoBenfeitoriaRepository';
import { ICacheService } from '../../core/cache/ICacheService';
import { ITenantService } from '../../core/tenant/ITenantService';
import { PaginatedResult } from '../../core/repository/types';
import ServicoBenfeitoria from '../../models/ServicoBenfeitoria';
import Benfeitoria from '../../models/Benfeitoria';
import ServicoAgricola from '../../models/ServicoAgricola';
import Pessoa from '../../models/Pessoa';
import Moeda from '../../models/Moeda';
import TituloPagar from '../../models/TituloPagar';
import Safra from '../../models/Safra';
import Usuario from '../../models/Usuario';

/**
 * Repositorio para entidade ServicoBenfeitoria
 */
@Injectable()
export class ServicoBenfeitoriaRepository extends BaseRepository<ServicoBenfeitoria> implements IServicoBenfeitoriaRepository {
  constructor(
    @Inject(TYPES.ICacheService) cacheService: ICacheService,
    @Inject(TYPES.ITenantService) tenantService: ITenantService
  ) {
    super(ServicoBenfeitoria, cacheService, tenantService);
  }

  /**
   * Busca um servico de benfeitoria por ID com todas as associacoes
   */
  async findById(id: number | string): Promise<ServicoBenfeitoria | null> {
    const tenantFilter = this.getTenantFilter();
    if (!tenantFilter) {
      return null;
    }

    const cacheKey = `servicoBenfeitoria:findById:${id}:${JSON.stringify(tenantFilter)}`;
    const cached = await this.cacheService.get<ServicoBenfeitoria>(cacheKey);
    if (cached !== null) {
      return cached;
    }

    const where: any = { id_srvbenf: id };
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
          model: ServicoAgricola,
          as: 'servico',
          required: false,
        },
        {
          model: Pessoa,
          as: 'responsavel',
          required: false,
        },
        {
          model: Moeda,
          as: 'moeda',
          required: false,
        },
        {
          model: TituloPagar,
          as: 'tituloPagar',
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
   * Busca todos os servicos de benfeitoria paginados com associacoes
   */
  async findAllPaginated(page: number = 1, limit: number = 10): Promise<PaginatedResult<ServicoBenfeitoria>> {
    const offset = (page - 1) * limit;
    const tenantFilter = this.getTenantFilter();
    const cacheKey = `servicoBenfeitoria:list:${page}:${limit}:${JSON.stringify(tenantFilter)}`;

    const cached = await this.cacheService.get<PaginatedResult<ServicoBenfeitoria>>(cacheKey);
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
      order: [['data', 'DESC'], ['id_srvbenf', 'DESC']],
      include: [
        {
          model: Benfeitoria,
          as: 'benfeitoria',
          required: false,
        },
        {
          model: ServicoAgricola,
          as: 'servico',
          required: false,
        },
        {
          model: Pessoa,
          as: 'responsavel',
          required: false,
        },
      ],
    });

    const result: PaginatedResult<ServicoBenfeitoria> = {
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
  async create(entity: Partial<ServicoBenfeitoria>): Promise<ServicoBenfeitoria> {
    const result = await super.create(entity);

    await this.cacheService.deleteByPattern('servicoBenfeitoria:list:*');

    return result;
  }

  /**
   * Sobrescreve update para usar id_srvbenf ao inves de id
   */
  async update(id: number | string, entity: Partial<ServicoBenfeitoria>): Promise<ServicoBenfeitoria> {
    const tenantFilter = this.getTenantFilter();
    if (!tenantFilter) {
      throw new Error('Tenant nao identificado. Nao e possivel atualizar entidade sem tenantId.');
    }

    const where: any = { id_srvbenf: id };
    if (tenantFilter.tenantId) {
      where.tenantId = tenantFilter.tenantId;
    }

    const instance = await this.model.findOne({ where });

    if (!instance) {
      throw new Error('Servico de benfeitoria nao encontrado');
    }

    const entityWithoutAudit = { ...entity };
    if ('tenantId' in entityWithoutAudit) {
      delete (entityWithoutAudit as any).tenantId;
    }
    if ('id_srvbenf' in entityWithoutAudit) {
      delete (entityWithoutAudit as any).id_srvbenf;
    }

    await instance.update(entityWithoutAudit);

    await this.cacheService.deleteByPattern('servicoBenfeitoria:findById:*');
    await this.cacheService.deleteByPattern('servicoBenfeitoria:list:*');

    return instance;
  }

  /**
   * Sobrescreve delete para usar id_srvbenf ao inves de id
   */
  async delete(id: number | string): Promise<boolean> {
    const tenantFilter = this.getTenantFilter();
    if (!tenantFilter) {
      throw new Error('Tenant nao identificado. Nao e possivel deletar entidade sem tenantId.');
    }

    const where: any = { id_srvbenf: id };
    if (tenantFilter.tenantId) {
      where.tenantId = tenantFilter.tenantId;
    }

    const instance = await this.model.findOne({ where });

    if (!instance) {
      return false;
    }

    await instance.destroy();

    await this.cacheService.deleteByPattern('servicoBenfeitoria:findById:*');
    await this.cacheService.deleteByPattern('servicoBenfeitoria:list:*');

    return true;
  }
}
