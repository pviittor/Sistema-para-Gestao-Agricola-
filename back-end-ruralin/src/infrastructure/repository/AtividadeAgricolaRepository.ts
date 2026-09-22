import { Injectable, Inject } from '../../core/di';
import { TYPES } from '../../core/di/types';
import { BaseRepository } from '../../core/repository/BaseRepository';
import { IAtividadeAgricolaRepository } from './IAtividadeAgricolaRepository';
import { ICacheService } from '../../core/cache/ICacheService';
import { ITenantService } from '../../core/tenant/ITenantService';
import { PaginatedResult } from '../../core/repository/types';
import AtividadeAgricola from '../../models/AtividadeAgricola';
import Usuario from '../../models/Usuario';

/**
 * Repositório para entidade AtividadeAgricola
 */
@Injectable()
export class AtividadeAgricolaRepository extends BaseRepository<AtividadeAgricola> implements IAtividadeAgricolaRepository {
  constructor(
    @Inject(TYPES.ICacheService) cacheService: ICacheService,
    @Inject(TYPES.ITenantService) tenantService: ITenantService
  ) {
    super(AtividadeAgricola, cacheService, tenantService);
  }

  /**
   * Busca uma atividade agrícola por ID com todas as associações
   */
  async findById(id: number | string): Promise<AtividadeAgricola | null> {
    const tenantFilter = this.getTenantFilter();
    if (!tenantFilter) {
      return null;
    }

    const cacheKey = `atividadeAgricola:findById:${id}:${JSON.stringify(tenantFilter)}`;
    const cached = await this.cacheService.get<AtividadeAgricola>(cacheKey);
    if (cached !== null) {
      return cached;
    }

    const where: any = { id_atv: id };
    if (tenantFilter.tenantId) {
      where.tenantId = tenantFilter.tenantId;
    }

    const result = await this.model.findOne({
      where,
      include: [
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
   * Busca todas as atividades agrícolas paginadas
   */
  async findAllPaginated(page: number = 1, limit: number = 10): Promise<PaginatedResult<AtividadeAgricola>> {
    const offset = (page - 1) * limit;
    const tenantFilter = this.getTenantFilter();
    const cacheKey = `atividadeAgricola:list:${page}:${limit}:${JSON.stringify(tenantFilter)}`;

    const cached = await this.cacheService.get<PaginatedResult<AtividadeAgricola>>(cacheKey);
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
      order: [['id_atv', 'ASC']],
    });

    const result: PaginatedResult<AtividadeAgricola> = {
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
  async create(entity: Partial<AtividadeAgricola>): Promise<AtividadeAgricola> {
    const result = await super.create(entity);

    await this.cacheService.deleteByPattern('atividadeAgricola:list:*');

    return result;
  }

  /**
   * Sobrescreve update para usar id_atv ao invés de id
   */
  async update(id: number | string, entity: Partial<AtividadeAgricola>): Promise<AtividadeAgricola> {
    const tenantFilter = this.getTenantFilter();
    if (!tenantFilter) {
      throw new Error('Tenant não identificado. Não é possível atualizar entidade sem tenantId.');
    }

    const where: any = { id_atv: id };
    if (tenantFilter.tenantId) {
      where.tenantId = tenantFilter.tenantId;
    }

    const instance = await this.model.findOne({ where });

    if (!instance) {
      throw new Error('Atividade agrícola não encontrada');
    }

    const entityWithoutAudit = { ...entity };
    if ('tenantId' in entityWithoutAudit) {
      delete (entityWithoutAudit as any).tenantId;
    }
    if ('id_atv' in entityWithoutAudit) {
      delete (entityWithoutAudit as any).id_atv;
    }

    await instance.update(entityWithoutAudit);

    await this.cacheService.deleteByPattern('atividadeAgricola:findById:*');
    await this.cacheService.deleteByPattern('atividadeAgricola:list:*');

    return instance;
  }

  /**
   * Sobrescreve delete para usar id_atv ao invés de id
   */
  async delete(id: number | string): Promise<boolean> {
    const tenantFilter = this.getTenantFilter();
    if (!tenantFilter) {
      throw new Error('Tenant não identificado. Não é possível deletar entidade sem tenantId.');
    }

    const where: any = { id_atv: id };
    if (tenantFilter.tenantId) {
      where.tenantId = tenantFilter.tenantId;
    }

    const instance = await this.model.findOne({ where });

    if (!instance) {
      return false;
    }

    await instance.destroy();

    await this.cacheService.deleteByPattern('atividadeAgricola:findById:*');
    await this.cacheService.deleteByPattern('atividadeAgricola:list:*');

    return true;
  }
}
