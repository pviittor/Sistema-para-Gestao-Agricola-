import { Injectable, Inject } from '../../core/di';
import { TYPES } from '../../core/di/types';
import { BaseRepository } from '../../core/repository/BaseRepository';
import { IApontamentoServicoRepository } from './IApontamentoServicoRepository';
import { ICacheService } from '../../core/cache/ICacheService';
import { ITenantService } from '../../core/tenant/ITenantService';
import { PaginatedResult } from '../../core/repository/types';
import ApontamentoServico from '../../models/ApontamentoServico';
import Apontamento from '../../models/Apontamento';
import ServicoAgricola from '../../models/ServicoAgricola';
import Pessoa from '../../models/Pessoa';
import Moeda from '../../models/Moeda';
import TituloPagar from '../../models/TituloPagar';
import Usuario from '../../models/Usuario';

/**
 * Repositório para entidade ApontamentoServico
 */
@Injectable()
export class ApontamentoServicoRepository extends BaseRepository<ApontamentoServico> implements IApontamentoServicoRepository {
  constructor(
    @Inject(TYPES.ICacheService) cacheService: ICacheService,
    @Inject(TYPES.ITenantService) tenantService: ITenantService
  ) {
    super(ApontamentoServico, cacheService, tenantService);
  }

  /**
   * Busca um apontamento de serviço por ID com todas as associações
   */
  async findById(id: number | string): Promise<ApontamentoServico | null> {
    const tenantFilter = this.getTenantFilter();
    if (!tenantFilter) {
      return null;
    }

    const cacheKey = `apontamentoServico:findById:${id}:${JSON.stringify(tenantFilter)}`;
    const cached = await this.cacheService.get<ApontamentoServico>(cacheKey);
    if (cached !== null) {
      return cached;
    }

    const where: any = { id_aptsrv: id };
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
   * Busca todos os apontamentos de serviço paginados com associações
   */
  async findAllPaginated(page: number = 1, limit: number = 10): Promise<PaginatedResult<ApontamentoServico>> {
    const offset = (page - 1) * limit;
    const tenantFilter = this.getTenantFilter();
    const cacheKey = `apontamentoServico:list:${page}:${limit}:${JSON.stringify(tenantFilter)}`;

    const cached = await this.cacheService.get<PaginatedResult<ApontamentoServico>>(cacheKey);
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
      order: [['data', 'DESC'], ['id_aptsrv', 'DESC']],
      include: [
        {
          model: Apontamento,
          as: 'apontamento',
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

    const result: PaginatedResult<ApontamentoServico> = {
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
  async create(entity: Partial<ApontamentoServico>): Promise<ApontamentoServico> {
    const result = await super.create(entity);

    await this.cacheService.deleteByPattern('apontamentoServico:list:*');

    return result;
  }

  /**
   * Sobrescreve update para usar id_aptsrv ao invés de id
   */
  async update(id: number | string, entity: Partial<ApontamentoServico>): Promise<ApontamentoServico> {
    const tenantFilter = this.getTenantFilter();
    if (!tenantFilter) {
      throw new Error('Tenant não identificado. Não é possível atualizar entidade sem tenantId.');
    }

    const where: any = { id_aptsrv: id };
    if (tenantFilter.tenantId) {
      where.tenantId = tenantFilter.tenantId;
    }

    const instance = await this.model.findOne({ where });

    if (!instance) {
      throw new Error('Apontamento de serviço não encontrado');
    }

    const entityWithoutAudit = { ...entity };
    if ('tenantId' in entityWithoutAudit) {
      delete (entityWithoutAudit as any).tenantId;
    }
    if ('id_aptsrv' in entityWithoutAudit) {
      delete (entityWithoutAudit as any).id_aptsrv;
    }

    await instance.update(entityWithoutAudit);

    await this.cacheService.deleteByPattern('apontamentoServico:findById:*');
    await this.cacheService.deleteByPattern('apontamentoServico:list:*');

    return instance;
  }

  /**
   * Sobrescreve delete para usar id_aptsrv ao invés de id
   */
  async delete(id: number | string): Promise<boolean> {
    const tenantFilter = this.getTenantFilter();
    if (!tenantFilter) {
      throw new Error('Tenant não identificado. Não é possível deletar entidade sem tenantId.');
    }

    const where: any = { id_aptsrv: id };
    if (tenantFilter.tenantId) {
      where.tenantId = tenantFilter.tenantId;
    }

    const instance = await this.model.findOne({ where });

    if (!instance) {
      return false;
    }

    await instance.destroy();

    await this.cacheService.deleteByPattern('apontamentoServico:findById:*');
    await this.cacheService.deleteByPattern('apontamentoServico:list:*');

    return true;
  }
}
