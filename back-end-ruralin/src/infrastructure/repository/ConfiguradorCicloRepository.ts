import { Injectable, Inject } from '../../core/di';
import { TYPES } from '../../core/di/types';
import { BaseRepository } from '../../core/repository/BaseRepository';
import { IConfiguradorCicloRepository } from './IConfiguradorCicloRepository';
import { ICacheService } from '../../core/cache/ICacheService';
import { ITenantService } from '../../core/tenant/ITenantService';
import { PaginatedResult } from '../../core/repository/types';
import ConfiguradorCiclo from '../../models/ConfiguradorCiclo';
import Talhao from '../../models/Talhao';
import Safra from '../../models/Safra';
import Cultura from '../../models/Cultura';
import Produto from '../../models/Produto';
import Fazenda from '../../models/Fazenda';
import Usuario from '../../models/Usuario';

/**
 * Repositório para entidade ConfiguradorCiclo
 */
@Injectable()
export class ConfiguradorCicloRepository extends BaseRepository<ConfiguradorCiclo> implements IConfiguradorCicloRepository {
  constructor(
    @Inject(TYPES.ICacheService) cacheService: ICacheService,
    @Inject(TYPES.ITenantService) tenantService: ITenantService
  ) {
    super(ConfiguradorCiclo, cacheService, tenantService);
  }

  /**
   * Busca configuradores de ciclo por fazenda e safra
   */
  async findByFazendaAndSafra(fazendaId: number, safraId: number): Promise<ConfiguradorCiclo[]> {
    const tenantFilter = this.getTenantFilter();
    if (!tenantFilter) {
      return [];
    }

    const where: any = { idCiclo: safraId };
    if (tenantFilter.tenantId) {
      where.tenantId = tenantFilter.tenantId;
    }

    return this.model.findAll({
      where,
      include: [
        {
          model: Talhao,
          as: 'talhao',
          required: true,
          where: { idFazenda: fazendaId },
          include: [
            {
              model: Fazenda,
              as: 'fazenda',
              required: false,
            },
          ],
        },
        {
          model: Safra,
          as: 'ciclo',
          required: false,
        },
        {
          model: Cultura,
          as: 'cultura',
          required: false,
        },
        {
          model: Produto,
          as: 'variedadeCiclo',
          required: false,
        },
      ],
      order: [['id_cfg', 'ASC']],
    });
  }

  /**
   * Busca um configurador de ciclo por ID com todas as associações
   */
  async findById(id: number | string): Promise<ConfiguradorCiclo | null> {
    const tenantFilter = this.getTenantFilter();
    if (!tenantFilter) {
      return null;
    }

    const cacheKey = `configuradorCiclo:findById:${id}:${JSON.stringify(tenantFilter)}`;
    const cached = await this.cacheService.get<ConfiguradorCiclo>(cacheKey);
    if (cached !== null) {
      return cached;
    }

    const where: any = { id_cfg: id };
    if (tenantFilter.tenantId) {
      where.tenantId = tenantFilter.tenantId;
    }

    const result = await this.model.findOne({
      where,
      include: [
        {
          model: Talhao,
          as: 'talhao',
          required: false,
        },
        {
          model: Safra,
          as: 'ciclo',
          required: false,
        },
        {
          model: Cultura,
          as: 'cultura',
          required: false,
        },
        {
          model: Produto,
          as: 'variedadeCiclo',
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
   * Busca todos os configuradores paginados com associações
   */
  async findAllPaginated(page: number = 1, limit: number = 10): Promise<PaginatedResult<ConfiguradorCiclo>> {
    const offset = (page - 1) * limit;
    const tenantFilter = this.getTenantFilter();
    const cacheKey = `configuradorCiclo:list:${page}:${limit}:${JSON.stringify(tenantFilter)}`;

    const cached = await this.cacheService.get<PaginatedResult<ConfiguradorCiclo>>(cacheKey);
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
      order: [['id_cfg', 'ASC']],
      include: [
        {
          model: Talhao,
          as: 'talhao',
          required: false,
        },
        {
          model: Safra,
          as: 'ciclo',
          required: false,
        },
        {
          model: Cultura,
          as: 'cultura',
          required: false,
        },
      ],
    });

    const result: PaginatedResult<ConfiguradorCiclo> = {
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
  async create(entity: Partial<ConfiguradorCiclo>): Promise<ConfiguradorCiclo> {
    const result = await super.create(entity);

    await this.cacheService.deleteByPattern('configuradorCiclo:list:*');

    return result;
  }

  /**
   * Sobrescreve update para usar id_cfg ao invés de id
   */
  async update(id: number | string, entity: Partial<ConfiguradorCiclo>): Promise<ConfiguradorCiclo> {
    const tenantFilter = this.getTenantFilter();
    if (!tenantFilter) {
      throw new Error('Tenant não identificado. Não é possível atualizar entidade sem tenantId.');
    }

    const where: any = { id_cfg: id };
    if (tenantFilter.tenantId) {
      where.tenantId = tenantFilter.tenantId;
    }

    const instance = await this.model.findOne({ where });

    if (!instance) {
      throw new Error('Configurador de ciclo não encontrado');
    }

    const entityWithoutAudit = { ...entity };
    if ('tenantId' in entityWithoutAudit) {
      delete (entityWithoutAudit as any).tenantId;
    }
    if ('id_cfg' in entityWithoutAudit) {
      delete (entityWithoutAudit as any).id_cfg;
    }

    await instance.update(entityWithoutAudit);

    await this.cacheService.deleteByPattern('configuradorCiclo:findById:*');
    await this.cacheService.deleteByPattern('configuradorCiclo:list:*');

    return instance;
  }

  /**
   * Sobrescreve delete para usar id_cfg ao invés de id
   */
  async delete(id: number | string): Promise<boolean> {
    const tenantFilter = this.getTenantFilter();
    if (!tenantFilter) {
      throw new Error('Tenant não identificado. Não é possível deletar entidade sem tenantId.');
    }

    const where: any = { id_cfg: id };
    if (tenantFilter.tenantId) {
      where.tenantId = tenantFilter.tenantId;
    }

    const instance = await this.model.findOne({ where });

    if (!instance) {
      return false;
    }

    await instance.destroy();

    await this.cacheService.deleteByPattern('configuradorCiclo:findById:*');
    await this.cacheService.deleteByPattern('configuradorCiclo:list:*');

    return true;
  }
}
