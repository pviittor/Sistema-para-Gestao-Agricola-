import { Op } from 'sequelize';
import { Injectable, Inject } from '../../core/di';
import { TYPES } from '../../core/di/types';
import { BaseRepository } from '../../core/repository/BaseRepository';
import { IRecorrenciaFinanceiraRepository, RecorrenciaFinanceiraFiltros, RecorrenciaFinanceiraKpis } from './IRecorrenciaFinanceiraRepository';
import { ICacheService } from '../../core/cache/ICacheService';
import { ITenantService } from '../../core/tenant/ITenantService';
import { PaginatedResult } from '../../core/repository/types';
import RecorrenciaFinanceira from '../../models/RecorrenciaFinanceira';
import Pessoa from '../../models/Pessoa';
import Conta from '../../models/Conta';
import PlanoContaGerencial from '../../models/PlanoContaGerencial';
import CentroCusto from '../../models/CentroCusto';
import Fazenda from '../../models/Fazenda';
import Safra from '../../models/Safra';
import Talhao from '../../models/Talhao';
import Moeda from '../../models/Moeda';
import Usuario from '../../models/Usuario';

/**
 * Repositório para entidade RecorrenciaFinanceira
 */
@Injectable()
export class RecorrenciaFinanceiraRepository extends BaseRepository<RecorrenciaFinanceira> implements IRecorrenciaFinanceiraRepository {
  constructor(
    @Inject(TYPES.ICacheService) cacheService: ICacheService,
    @Inject(TYPES.ITenantService) tenantService: ITenantService
  ) {
    super(RecorrenciaFinanceira, cacheService, tenantService);
  }

  /**
   * Includes padrão para associações da recorrência financeira
   */
  private getDefaultIncludes() {
    return [
      {
        model: Pessoa,
        as: 'fornecedorCliente',
        required: false,
      },
      {
        model: Pessoa,
        as: 'portador',
        required: false,
      },
      {
        model: Pessoa,
        as: 'produtor',
        required: false,
      },
      {
        model: Conta,
        as: 'conta',
        required: false,
      },
      {
        model: PlanoContaGerencial,
        as: 'planoContaGerencial',
        required: false,
      },
      {
        model: CentroCusto,
        as: 'centroCusto',
        required: false,
      },
      {
        model: Fazenda,
        as: 'fazenda',
        required: false,
      },
      {
        model: Safra,
        as: 'safra',
        required: false,
      },
      {
        model: Talhao,
        as: 'talhao',
        required: false,
      },
      {
        model: Moeda,
        as: 'moeda',
        required: false,
      },
      {
        model: Usuario,
        as: 'usuario',
        required: false,
      },
      {
        model: Usuario,
        as: 'usuarioCriador',
        required: false,
      },
    ];
  }

  /**
   * Busca uma recorrência financeira por ID com todas as associações
   */
  async findById(id: number | string): Promise<RecorrenciaFinanceira | null> {
    const tenantFilter = this.getTenantFilter();
    if (!tenantFilter) {
      return null;
    }

    const cacheKey = `recorrenciaFinanceira:findById:${id}:${JSON.stringify(tenantFilter)}`;
    const cached = await this.cacheService.get<RecorrenciaFinanceira>(cacheKey);
    if (cached !== null) {
      return cached;
    }

    const where: any = { id };
    if (tenantFilter.tenantId) {
      where.tenantId = tenantFilter.tenantId;
    }

    const result = await this.model.findOne({
      where,
      include: this.getDefaultIncludes(),
    });

    if (result) {
      await this.cacheService.set(cacheKey, result, this.DEFAULT_CACHE_TTL);
    }

    return result;
  }

  /**
   * Busca todas as recorrências financeiras paginadas com associações
   */
  async findAllPaginated(page: number = 1, limit: number = 10): Promise<PaginatedResult<RecorrenciaFinanceira>> {
    const offset = (page - 1) * limit;
    const tenantFilter = this.getTenantFilter();
    const cacheKey = `recorrenciaFinanceira:list:${page}:${limit}:${JSON.stringify(tenantFilter)}`;

    const cached = await this.cacheService.get<PaginatedResult<RecorrenciaFinanceira>>(cacheKey);
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
      order: [['dataInicio', 'DESC'], ['id', 'DESC']],
      include: this.getDefaultIncludes(),
    });

    const result: PaginatedResult<RecorrenciaFinanceira> = {
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
   * Busca recorrências ativas (ativa=true, dataInicio <= hoje, dataFim IS NULL ou >= hoje)
   */
  async findAtivas(tenantId?: number): Promise<RecorrenciaFinanceira[]> {
    const tenantFilter = this.getTenantFilter();
    const effectiveTenantId = tenantId || tenantFilter?.tenantId;

    const cacheKey = `recorrenciaFinanceira:findAtivas:${effectiveTenantId || 'all'}`;
    const cached = await this.cacheService.get<RecorrenciaFinanceira[]>(cacheKey);
    if (cached !== null) {
      return cached;
    }

    const today = new Date().toISOString().split('T')[0];

    const where: any = {
      ativa: true,
      dataInicio: {
        [Op.lte]: today,
      },
      [Op.or]: [
        { dataFim: null },
        { dataFim: { [Op.gte]: today } },
      ],
    };

    if (effectiveTenantId) {
      where.tenantId = effectiveTenantId;
    }

    const result = await this.model.findAll({
      where,
      order: [['dataInicio', 'ASC'], ['id', 'ASC']],
      include: this.getDefaultIncludes(),
    });

    await this.cacheService.set(cacheKey, result, this.DEFAULT_CACHE_TTL);
    return result;
  }

  /**
   * Busca recorrências por tipo (PAGAR ou RECEBER)
   */
  async findByTipo(tipo: string, tenantId: number): Promise<RecorrenciaFinanceira[]> {
    const cacheKey = `recorrenciaFinanceira:findByTipo:${tipo}:${tenantId}`;
    const cached = await this.cacheService.get<RecorrenciaFinanceira[]>(cacheKey);
    if (cached !== null) {
      return cached;
    }

    const where: any = {
      tipo,
      tenantId,
    };

    const result = await this.model.findAll({
      where,
      order: [['dataInicio', 'DESC'], ['id', 'DESC']],
      include: this.getDefaultIncludes(),
    });

    await this.cacheService.set(cacheKey, result, this.DEFAULT_CACHE_TTL);
    return result;
  }

  /**
   * Busca recorrências financeiras paginadas com filtros
   */
  async findAllPaginatedFiltered(page: number = 1, limit: number = 10, filtros?: RecorrenciaFinanceiraFiltros): Promise<PaginatedResult<RecorrenciaFinanceira>> {
    const offset = (page - 1) * limit;
    const tenantFilter = this.getTenantFilter();

    const where: any = {};
    if (tenantFilter) {
      if (tenantFilter.tenantId) {
        where.tenantId = tenantFilter.tenantId;
      }
    }

    // Aplicar filtros
    if (filtros) {
      if (filtros.tipo) {
        where.tipo = filtros.tipo;
      }
      if (filtros.ativa !== undefined) {
        where.ativa = filtros.ativa;
      }
      if (filtros.periodicidade) {
        where.periodicidade = filtros.periodicidade;
      }
      if (filtros.idFornecedorCliente) {
        where.idFornecedorCliente = filtros.idFornecedorCliente;
      }
      if (filtros.idPortador) {
        where.idPortador = filtros.idPortador;
      }
      if (filtros.idProdutor) {
        where.idProdutor = filtros.idProdutor;
      }
      if (filtros.search) {
        where.descricao = { [Op.like]: `%${filtros.search}%` };
      }
    }

    const { count, rows } = await this.model.findAndCountAll({
      where,
      limit,
      offset,
      order: [['dataInicio', 'DESC'], ['id', 'DESC']],
      include: this.getDefaultIncludes(),
    });

    const result: PaginatedResult<RecorrenciaFinanceira> = {
      data: rows,
      page,
      limit,
      total: count,
      totalPages: Math.ceil(count / limit),
    };

    return result;
  }

  /**
   * Retorna KPIs das recorrências financeiras do tenant atual
   */
  async getKpis(): Promise<RecorrenciaFinanceiraKpis> {
    const tenantFilter = this.getTenantFilter();
    const where: any = {};
    if (tenantFilter?.tenantId) where.tenantId = tenantFilter.tenantId;

    const all = await this.model.findAll({ where, raw: true });

    let totalAtivasPagar = 0, totalAtivasReceber = 0;
    let valorTotalPagar = 0, valorTotalReceber = 0;
    let totalInativas = 0, proximasGeracoes = 0;

    for (const rec of all) {
      if (!(rec as any).ativa) { totalInativas++; continue; }
      if ((rec as any).tipo === 'PAGAR') {
        totalAtivasPagar++;
        valorTotalPagar += Number((rec as any).valor) || 0;
      } else {
        totalAtivasReceber++;
        valorTotalReceber += Number((rec as any).valor) || 0;
      }
      // Conta como próxima geração se não atingiu o limite
      if (!(rec as any).numeroMaximoGeracoes || (rec as any).geracoesRealizadas < (rec as any).numeroMaximoGeracoes) {
        proximasGeracoes++;
      }
    }

    return { totalAtivasPagar, totalAtivasReceber, valorTotalPagar, valorTotalReceber, totalInativas, proximasGeracoes };
  }

  /**
   * Sobrescreve create para invalidar caches relevantes
   */
  async create(entity: Partial<RecorrenciaFinanceira>): Promise<RecorrenciaFinanceira> {
    const result = await super.create(entity);

    await this.cacheService.deleteByPattern('recorrenciaFinanceira:list:*');
    await this.cacheService.deleteByPattern('recorrenciaFinanceira:findAtivas:*');
    await this.cacheService.deleteByPattern('recorrenciaFinanceira:findByTipo:*');

    return result;
  }

  /**
   * Sobrescreve update para invalidar caches relevantes
   */
  async update(id: number | string, entity: Partial<RecorrenciaFinanceira>): Promise<RecorrenciaFinanceira> {
    const result = await super.update(id, entity);

    await this.cacheService.deleteByPattern('recorrenciaFinanceira:findById:*');
    await this.cacheService.deleteByPattern('recorrenciaFinanceira:list:*');
    await this.cacheService.deleteByPattern('recorrenciaFinanceira:findAtivas:*');
    await this.cacheService.deleteByPattern('recorrenciaFinanceira:findByTipo:*');

    return result;
  }

  /**
   * Sobrescreve delete para invalidar caches relevantes
   */
  async delete(id: number | string): Promise<boolean> {
    const result = await super.delete(id);

    await this.cacheService.deleteByPattern('recorrenciaFinanceira:findById:*');
    await this.cacheService.deleteByPattern('recorrenciaFinanceira:list:*');
    await this.cacheService.deleteByPattern('recorrenciaFinanceira:findAtivas:*');
    await this.cacheService.deleteByPattern('recorrenciaFinanceira:findByTipo:*');

    return result;
  }
}
