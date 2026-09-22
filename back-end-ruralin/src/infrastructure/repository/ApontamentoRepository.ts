import { Injectable, Inject } from '../../core/di';
import { TYPES } from '../../core/di/types';
import { BaseRepository } from '../../core/repository/BaseRepository';
import { IApontamentoRepository } from './IApontamentoRepository';
import { ICacheService } from '../../core/cache/ICacheService';
import { ITenantService } from '../../core/tenant/ITenantService';
import { PaginatedResult } from '../../core/repository/types';
import Apontamento from '../../models/Apontamento';
import ConfiguradorCiclo from '../../models/ConfiguradorCiclo';
import AtividadeAgricola from '../../models/AtividadeAgricola';
import AtividadeOperacao from '../../models/AtividadeOperacao';
import Usuario from '../../models/Usuario';

/**
 * Repositorio para entidade Apontamento
 */
@Injectable()
export class ApontamentoRepository extends BaseRepository<Apontamento> implements IApontamentoRepository {
  constructor(
    @Inject(TYPES.ICacheService) cacheService: ICacheService,
    @Inject(TYPES.ITenantService) tenantService: ITenantService
  ) {
    super(Apontamento, cacheService, tenantService);
  }

  /**
   * Busca um apontamento por ID com todas as associacoes
   */
  async findById(id: number | string): Promise<Apontamento | null> {
    const tenantFilter = this.getTenantFilter();
    if (!tenantFilter) {
      return null;
    }

    const cacheKey = `apontamento:findById:${id}:${JSON.stringify(tenantFilter)}`;
    const cached = await this.cacheService.get<Apontamento>(cacheKey);
    if (cached !== null) {
      return cached;
    }

    const where: any = { id_apt: id };
    if (tenantFilter.tenantId) {
      where.tenantId = tenantFilter.tenantId;
    }

    const result = await this.model.findOne({
      where,
      include: [
        {
          model: ConfiguradorCiclo,
          as: 'configuracao',
          required: false,
        },
        {
          model: AtividadeAgricola,
          as: 'atividade',
          required: false,
        },
        {
          model: AtividadeOperacao,
          as: 'operacao',
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
   * Busca todos os apontamentos paginados com associacoes resumidas
   */
  async findAllPaginated(page: number = 1, limit: number = 10): Promise<PaginatedResult<Apontamento>> {
    const offset = (page - 1) * limit;
    const tenantFilter = this.getTenantFilter();
    const cacheKey = `apontamento:list:${page}:${limit}:${JSON.stringify(tenantFilter)}`;

    const cached = await this.cacheService.get<PaginatedResult<Apontamento>>(cacheKey);
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
      order: [['id_apt', 'DESC']],
      include: [
        {
          model: ConfiguradorCiclo,
          as: 'configuracao',
          required: false,
        },
        {
          model: AtividadeAgricola,
          as: 'atividade',
          required: false,
        },
        {
          model: AtividadeOperacao,
          as: 'operacao',
          required: false,
        },
      ],
    });

    const result: PaginatedResult<Apontamento> = {
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
  async create(entity: Partial<Apontamento>): Promise<Apontamento> {
    const result = await super.create(entity);

    await this.cacheService.deleteByPattern('apontamento:list:*');

    return result;
  }

  /**
   * Sobrescreve update para usar id_apt ao inves de id
   */
  async update(id: number | string, entity: Partial<Apontamento>): Promise<Apontamento> {
    const tenantFilter = this.getTenantFilter();
    if (!tenantFilter) {
      throw new Error('Tenant nao identificado. Nao e possivel atualizar entidade sem tenantId.');
    }

    const where: any = { id_apt: id };
    if (tenantFilter.tenantId) {
      where.tenantId = tenantFilter.tenantId;
    }

    const instance = await this.model.findOne({ where });

    if (!instance) {
      throw new Error('Apontamento nao encontrado');
    }

    const entityWithoutAudit = { ...entity };
    if ('tenantId' in entityWithoutAudit) {
      delete (entityWithoutAudit as any).tenantId;
    }
    if ('id_apt' in entityWithoutAudit) {
      delete (entityWithoutAudit as any).id_apt;
    }

    await instance.update(entityWithoutAudit);

    await this.cacheService.deleteByPattern('apontamento:findById:*');
    await this.cacheService.deleteByPattern('apontamento:list:*');

    return instance;
  }

  /**
   * Sobrescreve delete para usar id_apt ao inves de id
   */
  async delete(id: number | string): Promise<boolean> {
    const tenantFilter = this.getTenantFilter();
    if (!tenantFilter) {
      throw new Error('Tenant nao identificado. Nao e possivel deletar entidade sem tenantId.');
    }

    const where: any = { id_apt: id };
    if (tenantFilter.tenantId) {
      where.tenantId = tenantFilter.tenantId;
    }

    const instance = await this.model.findOne({ where });

    if (!instance) {
      return false;
    }

    await instance.destroy();

    await this.cacheService.deleteByPattern('apontamento:findById:*');
    await this.cacheService.deleteByPattern('apontamento:list:*');

    return true;
  }
}
