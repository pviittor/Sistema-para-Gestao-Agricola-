import { Injectable, Inject } from '../../core/di';
import { TYPES } from '../../core/di/types';
import { BaseRepository } from '../../core/repository/BaseRepository';
import { ITalhaoRepository } from './ITalhaoRepository';
import { ICacheService } from '../../core/cache/ICacheService';
import { ITenantService } from '../../core/tenant/ITenantService';
import { PaginatedResult } from '../../core/repository/types';
import Talhao from '../../models/Talhao';
import Fazenda from '../../models/Fazenda';
import Usuario from '../../models/Usuario';
import ConfiguradorCiclo from '../../models/ConfiguradorCiclo';
import Cultura from '../../models/Cultura';

/**
 * Repositório para entidade Talhao
 */
@Injectable()
export class TalhaoRepository extends BaseRepository<Talhao> implements ITalhaoRepository {
  constructor(
    @Inject(TYPES.ICacheService) cacheService: ICacheService,
    @Inject(TYPES.ITenantService) tenantService: ITenantService
  ) {
    super(Talhao, cacheService, tenantService);
  }

  /**
   * Busca talhões por fazenda com culturas associadas
   */
  async findByFazenda(fazendaId: number): Promise<Talhao[]> {
    const tenantFilter = this.getTenantFilter();
    if (!tenantFilter) {
      return [];
    }

    const cacheKey = `talhao:findByFazenda:${fazendaId}:${JSON.stringify(tenantFilter)}`;
    const cached = await this.cacheService.get<Talhao[]>(cacheKey);
    if (cached !== null) {
      return cached;
    }

    const where: any = { idFazenda: fazendaId };
    if (tenantFilter.tenantId) {
      where.tenantId = tenantFilter.tenantId;
    }

    const result = await this.model.findAll({
      where,
      order: [['descricao', 'ASC']],
      include: [
        {
          model: Fazenda,
          as: 'fazenda',
          required: false,
        },
        {
          model: ConfiguradorCiclo,
          as: 'configuradoresCiclo',
          required: false,
          include: [
            {
              model: Cultura,
              as: 'cultura',
              required: false,
            },
          ],
        },
      ],
    });

    await this.cacheService.set(cacheKey, result, this.DEFAULT_CACHE_TTL);
    return result;
  }

  /**
   * Busca um talhão por ID com todas as associações
   */
  async findById(id: number | string): Promise<Talhao | null> {
    const tenantFilter = this.getTenantFilter();
    if (!tenantFilter) {
      return null;
    }

    const cacheKey = `talhao:findById:${id}:${JSON.stringify(tenantFilter)}`;
    const cached = await this.cacheService.get<Talhao>(cacheKey);
    if (cached !== null) {
      return cached;
    }

    const where: any = { id_talhao: id };
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
   * Busca todos os talhões paginados com associações
   */
  async findAllPaginated(page: number = 1, limit: number = 10): Promise<PaginatedResult<Talhao>> {
    const offset = (page - 1) * limit;
    const tenantFilter = this.getTenantFilter();
    const cacheKey = `talhao:list:${page}:${limit}:${JSON.stringify(tenantFilter)}`;

    const cached = await this.cacheService.get<PaginatedResult<Talhao>>(cacheKey);
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
      order: [['id_talhao', 'ASC']],
      include: [
        {
          model: Fazenda,
          as: 'fazenda',
          required: false,
        },
      ],
    });

    const result: PaginatedResult<Talhao> = {
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
  async create(entity: Partial<Talhao>): Promise<Talhao> {
    const result = await super.create(entity);

    await this.cacheService.deleteByPattern('talhao:list:*');
    await this.cacheService.deleteByPattern('talhao:findByFazenda:*');

    return result;
  }

  /**
   * Sobrescreve update para usar id_talhao ao invés de id
   */
  async update(id: number | string, entity: Partial<Talhao>): Promise<Talhao> {
    const tenantFilter = this.getTenantFilter();
    if (!tenantFilter) {
      throw new Error('Tenant não identificado. Não é possível atualizar entidade sem tenantId.');
    }

    const where: any = { id_talhao: id };
    if (tenantFilter.tenantId) {
      where.tenantId = tenantFilter.tenantId;
    }

    const instance = await this.model.findOne({ where });

    if (!instance) {
      throw new Error('Talhão não encontrado');
    }

    const entityWithoutAudit = { ...entity };
    if ('tenantId' in entityWithoutAudit) {
      delete (entityWithoutAudit as any).tenantId;
    }
    if ('id_talhao' in entityWithoutAudit) {
      delete (entityWithoutAudit as any).id_talhao;
    }

    await instance.update(entityWithoutAudit);

    await this.cacheService.deleteByPattern('talhao:findById:*');
    await this.cacheService.deleteByPattern('talhao:list:*');
    await this.cacheService.deleteByPattern('talhao:findByFazenda:*');

    return instance;
  }

  /**
   * Sobrescreve delete para usar id_talhao ao invés de id
   */
  async delete(id: number | string): Promise<boolean> {
    const tenantFilter = this.getTenantFilter();
    if (!tenantFilter) {
      throw new Error('Tenant não identificado. Não é possível deletar entidade sem tenantId.');
    }

    const where: any = { id_talhao: id };
    if (tenantFilter.tenantId) {
      where.tenantId = tenantFilter.tenantId;
    }

    const instance = await this.model.findOne({ where });

    if (!instance) {
      return false;
    }

    await instance.destroy();

    await this.cacheService.deleteByPattern('talhao:findById:*');
    await this.cacheService.deleteByPattern('talhao:list:*');
    await this.cacheService.deleteByPattern('talhao:findByFazenda:*');

    return true;
  }
}
