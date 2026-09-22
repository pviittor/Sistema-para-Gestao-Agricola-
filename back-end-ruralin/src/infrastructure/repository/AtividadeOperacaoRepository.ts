import { Injectable, Inject } from '../../core/di';
import { TYPES } from '../../core/di/types';
import { BaseRepository } from '../../core/repository/BaseRepository';
import { IAtividadeOperacaoRepository } from './IAtividadeOperacaoRepository';
import { ICacheService } from '../../core/cache/ICacheService';
import { ITenantService } from '../../core/tenant/ITenantService';
import { PaginatedResult } from '../../core/repository/types';
import AtividadeOperacao from '../../models/AtividadeOperacao';
import AtividadeAgricola from '../../models/AtividadeAgricola';
import Usuario from '../../models/Usuario';

/**
 * Repositório para entidade AtividadeOperacao
 */
@Injectable()
export class AtividadeOperacaoRepository extends BaseRepository<AtividadeOperacao> implements IAtividadeOperacaoRepository {
  constructor(
    @Inject(TYPES.ICacheService) cacheService: ICacheService,
    @Inject(TYPES.ITenantService) tenantService: ITenantService
  ) {
    super(AtividadeOperacao, cacheService, tenantService);
  }

  /**
   * Busca uma operação por ID com todas as associações
   */
  async findById(id: number | string): Promise<AtividadeOperacao | null> {
    const tenantFilter = this.getTenantFilter();
    if (!tenantFilter) {
      return null;
    }

    const cacheKey = `atividadeOperacao:findById:${id}:${JSON.stringify(tenantFilter)}`;
    const cached = await this.cacheService.get<AtividadeOperacao>(cacheKey);
    if (cached !== null) {
      return cached;
    }

    const where: any = { id_op: id };
    if (tenantFilter.tenantId) {
      where.tenantId = tenantFilter.tenantId;
    }

    const result = await this.model.findOne({
      where,
      include: [
        {
          model: AtividadeAgricola,
          as: 'atividadeAgricola',
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
   * Busca todas as operações paginadas com associações
   */
  async findAllPaginated(page: number = 1, limit: number = 10): Promise<PaginatedResult<AtividadeOperacao>> {
    const offset = (page - 1) * limit;
    const tenantFilter = this.getTenantFilter();
    const cacheKey = `atividadeOperacao:list:${page}:${limit}:${JSON.stringify(tenantFilter)}`;

    const cached = await this.cacheService.get<PaginatedResult<AtividadeOperacao>>(cacheKey);
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
      order: [['id_op', 'ASC']],
      include: [
        {
          model: AtividadeAgricola,
          as: 'atividadeAgricola',
          required: false,
        },
      ],
    });

    const result: PaginatedResult<AtividadeOperacao> = {
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
  async create(entity: Partial<AtividadeOperacao>): Promise<AtividadeOperacao> {
    const result = await super.create(entity);

    await this.cacheService.deleteByPattern('atividadeOperacao:list:*');

    return result;
  }

  /**
   * Sobrescreve update para usar id_op ao invés de id
   */
  async update(id: number | string, entity: Partial<AtividadeOperacao>): Promise<AtividadeOperacao> {
    const tenantFilter = this.getTenantFilter();
    if (!tenantFilter) {
      throw new Error('Tenant não identificado. Não é possível atualizar entidade sem tenantId.');
    }

    const where: any = { id_op: id };
    if (tenantFilter.tenantId) {
      where.tenantId = tenantFilter.tenantId;
    }

    const instance = await this.model.findOne({ where });

    if (!instance) {
      throw new Error('Operação não encontrada');
    }

    const entityWithoutAudit = { ...entity };
    if ('tenantId' in entityWithoutAudit) {
      delete (entityWithoutAudit as any).tenantId;
    }
    if ('id_op' in entityWithoutAudit) {
      delete (entityWithoutAudit as any).id_op;
    }

    await instance.update(entityWithoutAudit);

    await this.cacheService.deleteByPattern('atividadeOperacao:findById:*');
    await this.cacheService.deleteByPattern('atividadeOperacao:list:*');

    return instance;
  }

  /**
   * Sobrescreve delete para usar id_op ao invés de id
   */
  async delete(id: number | string): Promise<boolean> {
    const tenantFilter = this.getTenantFilter();
    if (!tenantFilter) {
      throw new Error('Tenant não identificado. Não é possível deletar entidade sem tenantId.');
    }

    const where: any = { id_op: id };
    if (tenantFilter.tenantId) {
      where.tenantId = tenantFilter.tenantId;
    }

    const instance = await this.model.findOne({ where });

    if (!instance) {
      return false;
    }

    await instance.destroy();

    await this.cacheService.deleteByPattern('atividadeOperacao:findById:*');
    await this.cacheService.deleteByPattern('atividadeOperacao:list:*');

    return true;
  }
}
