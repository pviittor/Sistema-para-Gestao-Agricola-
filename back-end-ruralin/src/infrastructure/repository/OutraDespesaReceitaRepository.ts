import { Op } from 'sequelize';
import { Injectable, Inject } from '../../core/di';
import { TYPES } from '../../core/di/types';
import { BaseRepository } from '../../core/repository/BaseRepository';
import { IOutraDespesaReceitaRepository } from './IOutraDespesaReceitaRepository';
import { ICacheService } from '../../core/cache/ICacheService';
import { ITenantService } from '../../core/tenant/ITenantService';
import { PaginatedResult } from '../../core/repository/types';
import OutraDespesaReceita from '../../models/OutraDespesaReceita';
import PlanoContaGerencial from '../../models/PlanoContaGerencial';
import ConfiguradorCiclo from '../../models/ConfiguradorCiclo';
import Cultura from '../../models/Cultura';
import Usuario from '../../models/Usuario';

/**
 * Repositório para entidade OutraDespesaReceita
 */
@Injectable()
export class OutraDespesaReceitaRepository extends BaseRepository<OutraDespesaReceita> implements IOutraDespesaReceitaRepository {
  constructor(
    @Inject(TYPES.ICacheService) cacheService: ICacheService,
    @Inject(TYPES.ITenantService) tenantService: ITenantService
  ) {
    super(OutraDespesaReceita, cacheService, tenantService);
  }

  /**
   * Busca uma outra despesa/receita por ID com todas as associações
   */
  async findById(id: number | string): Promise<OutraDespesaReceita | null> {
    const tenantFilter = this.getTenantFilter();
    if (!tenantFilter) {
      return null;
    }

    const cacheKey = `outraDespesaReceita:findById:${id}:${JSON.stringify(tenantFilter)}`;
    const cached = await this.cacheService.get<OutraDespesaReceita>(cacheKey);
    if (cached !== null) {
      return cached;
    }

    const where: any = { id };
    if (tenantFilter.tenantId) {
      where.tenantId = tenantFilter.tenantId;
    }

    const result = await this.model.findOne({
      where,
      include: [
        {
          model: PlanoContaGerencial,
          as: 'planoGerencial',
          required: false,
        },
        {
          model: ConfiguradorCiclo,
          as: 'configuradorCiclo',
          required: false,
          include: [
            {
              model: Cultura,
              as: 'cultura',
              required: false,
            },
          ],
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
   * Busca todas as outras despesas/receitas paginadas com associações
   */
  async findAllPaginated(page: number = 1, limit: number = 10): Promise<PaginatedResult<OutraDespesaReceita>> {
    const offset = (page - 1) * limit;
    const tenantFilter = this.getTenantFilter();
    const cacheKey = `outraDespesaReceita:list:${page}:${limit}:${JSON.stringify(tenantFilter)}`;

    const cached = await this.cacheService.get<PaginatedResult<OutraDespesaReceita>>(cacheKey);
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
      order: [['dataMovimento', 'DESC'], ['id', 'DESC']],
      include: [
        {
          model: PlanoContaGerencial,
          as: 'planoGerencial',
          required: false,
        },
        {
          model: ConfiguradorCiclo,
          as: 'configuradorCiclo',
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

    const result: PaginatedResult<OutraDespesaReceita> = {
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
   * Busca outras despesas/receitas por filtros dinâmicos
   */
  async findByFilters(
    tenantId: number,
    planoGerencialId?: number,
    dataInicio?: string,
    dataFim?: string,
    configuradorCicloId?: number,
    cultura?: string
  ): Promise<OutraDespesaReceita[]> {
    const cacheKey = `outraDespesaReceita:findByFilters:${tenantId}:${planoGerencialId || ''}:${dataInicio || ''}:${dataFim || ''}:${configuradorCicloId || ''}:${cultura || ''}`;
    const cached = await this.cacheService.get<OutraDespesaReceita[]>(cacheKey);
    if (cached !== null) {
      return cached;
    }

    const where: any = { tenantId };

    if (planoGerencialId) {
      where.planoGerencialId = planoGerencialId;
    }

    if (dataInicio && dataFim) {
      where.dataMovimento = {
        [Op.between]: [dataInicio, dataFim],
      };
    } else if (dataInicio) {
      where.dataMovimento = {
        [Op.gte]: dataInicio,
      };
    } else if (dataFim) {
      where.dataMovimento = {
        [Op.lte]: dataFim,
      };
    }

    if (configuradorCicloId) {
      where.configuradorCicloId = configuradorCicloId;
    }

    // Se filtro por cultura, buscar configuradores de ciclo vinculados à cultura
    if (cultura) {
      const configuradorCicloIds = await this.findConfiguradorCicloIdsByCultura(tenantId, cultura);
      if (configuradorCicloIds.length === 0) {
        return [];
      }
      // Combinar com configuradorCicloId já definido, se houver
      if (where.configuradorCicloId) {
        // Se já tem filtro por configuradorCicloId, verificar se está na lista
        if (!configuradorCicloIds.includes(where.configuradorCicloId)) {
          return [];
        }
      } else {
        where.configuradorCicloId = {
          [Op.in]: configuradorCicloIds,
        };
      }
    }

    const result = await this.model.findAll({
      where,
      order: [['dataMovimento', 'DESC'], ['id', 'DESC']],
      include: [
        {
          model: PlanoContaGerencial,
          as: 'planoGerencial',
          required: false,
        },
        {
          model: ConfiguradorCiclo,
          as: 'configuradorCiclo',
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
   * Busca outras despesas/receitas vinculadas a uma cultura específica
   * (via ConfiguradorCiclo)
   */
  async findByCultura(tenantId: number, cultura: string): Promise<OutraDespesaReceita[]> {
    const cacheKey = `outraDespesaReceita:findByCultura:${tenantId}:${cultura}`;
    const cached = await this.cacheService.get<OutraDespesaReceita[]>(cacheKey);
    if (cached !== null) {
      return cached;
    }

    const configuradorCicloIds = await this.findConfiguradorCicloIdsByCultura(tenantId, cultura);
    if (configuradorCicloIds.length === 0) {
      return [];
    }

    const result = await this.model.findAll({
      where: {
        tenantId,
        configuradorCicloId: {
          [Op.in]: configuradorCicloIds,
        },
      },
      order: [['dataMovimento', 'DESC'], ['id', 'DESC']],
      include: [
        {
          model: PlanoContaGerencial,
          as: 'planoGerencial',
          required: false,
        },
        {
          model: ConfiguradorCiclo,
          as: 'configuradorCiclo',
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
   * Busca IDs de ConfiguradorCiclo vinculados a uma cultura pelo nome ou ID
   *
   * @param tenantId - ID do tenant
   * @param cultura - Nome ou ID da cultura
   * @returns Array de IDs de ConfiguradorCiclo
   */
  private async findConfiguradorCicloIdsByCultura(tenantId: number, cultura: string): Promise<number[]> {
    // Verificar se cultura é um ID numérico ou nome
    const culturaId = Number(cultura);
    const culturaWhere: any = { tenantId };

    if (!isNaN(culturaId) && culturaId > 0) {
      culturaWhere.id = culturaId;
    } else {
      culturaWhere.descricao_clt = {
        [Op.like]: `%${cultura}%`,
      };
    }

    // Buscar culturas que atendem ao filtro
    const culturas = await Cultura.findAll({
      where: culturaWhere,
      attributes: ['id'],
    });

    if (culturas.length === 0) {
      return [];
    }

    const culturaIds = culturas.map((c: any) => c.id);

    // Buscar configuradores de ciclo vinculados às culturas encontradas
    const configuradores = await ConfiguradorCiclo.findAll({
      where: {
        tenantId,
        idCultura: {
          [Op.in]: culturaIds,
        },
      },
      attributes: ['id_cfg'],
    });

    return configuradores.map((cfg: any) => cfg.id_cfg);
  }

  /**
   * Sobrescreve create para invalidar caches relevantes
   */
  async create(entity: Partial<OutraDespesaReceita>): Promise<OutraDespesaReceita> {
    const result = await super.create(entity);

    await this.cacheService.deleteByPattern('outraDespesaReceita:list:*');
    await this.cacheService.deleteByPattern('outraDespesaReceita:findByFilters:*');
    await this.cacheService.deleteByPattern('outraDespesaReceita:findByCultura:*');

    return result;
  }

  /**
   * Sobrescreve update para invalidar caches relevantes
   */
  async update(id: number | string, entity: Partial<OutraDespesaReceita>): Promise<OutraDespesaReceita> {
    const result = await super.update(id, entity);

    await this.cacheService.deleteByPattern('outraDespesaReceita:findById:*');
    await this.cacheService.deleteByPattern('outraDespesaReceita:list:*');
    await this.cacheService.deleteByPattern('outraDespesaReceita:findByFilters:*');
    await this.cacheService.deleteByPattern('outraDespesaReceita:findByCultura:*');

    return result;
  }

  /**
   * Sobrescreve delete para invalidar caches relevantes
   */
  async delete(id: number | string): Promise<boolean> {
    const result = await super.delete(id);

    await this.cacheService.deleteByPattern('outraDespesaReceita:findById:*');
    await this.cacheService.deleteByPattern('outraDespesaReceita:list:*');
    await this.cacheService.deleteByPattern('outraDespesaReceita:findByFilters:*');
    await this.cacheService.deleteByPattern('outraDespesaReceita:findByCultura:*');

    return result;
  }
}
