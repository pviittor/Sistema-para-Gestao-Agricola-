import { Injectable, Inject } from '../../core/di';
import { TYPES } from '../../core/di/types';
import { BaseRepository } from '../../core/repository/BaseRepository';
import { ITituloReceberRepository } from './ITituloReceberRepository';
import { ICacheService } from '../../core/cache/ICacheService';
import { ITenantService } from '../../core/tenant/ITenantService';
import TituloReceber from '../../models/TituloReceber';
import { StatusTituloReceber } from '../../models/TituloReceber';
import { Op } from 'sequelize';
import Pessoa from '../../models/Pessoa';
import Fazenda from '../../models/Fazenda';
import Safra from '../../models/Safra';
import Moeda from '../../models/Moeda';
import type { Includeable } from 'sequelize';
import ParcelaTituloReceber from '../../models/ParcelaTituloReceber';
import RateioPlanoContaTituloReceber from '../../models/RateioPlanoContaTituloReceber';
import RateioCentroCustoTituloReceber from '../../models/RateioCentroCustoTituloReceber';

/**
 * Repositório para entidade TituloReceber
 * 
 * Estende BaseRepository para fornecer métodos CRUD padrão e adiciona
 * métodos específicos para busca de títulos a receber.
 */
@Injectable()
export class TituloReceberRepository extends BaseRepository<TituloReceber> implements ITituloReceberRepository {
  /**
   * Construtor do repositório
   * 
   * Inicializa o BaseRepository com o modelo TituloReceber, cacheService e tenantService.
   */
  constructor(
    @Inject(TYPES.ICacheService) cacheService: ICacheService,
    @Inject(TYPES.ITenantService) tenantService: ITenantService
  ) {
    super(TituloReceber, cacheService, tenantService);
  }

  /**
   * Includes padrão para queries de TituloReceber
   */
  private getDefaultIncludes(): Includeable[] {
    return [
      { model: Pessoa, as: 'cliente', required: false },
      { model: Pessoa, as: 'portador', required: false },
      { model: Pessoa, as: 'produtor', required: false },
      { model: Fazenda, as: 'fazenda', required: false },
      { model: Safra, as: 'safra', required: false },
      { model: Moeda, as: 'moeda', required: false },
      { model: ParcelaTituloReceber, as: 'parcelas', required: false },
      { model: RateioPlanoContaTituloReceber, as: 'rateiosPlanoConta', required: false },
      { model: RateioCentroCustoTituloReceber, as: 'rateiosCentroCusto', required: false },
    ];
  }

  /**
   * Override findById para incluir associações e parcelas
   */
  async findById(id: number | string): Promise<TituloReceber | null> {
    const tenantFilter = this.getTenantFilter();
    if (!tenantFilter) return null;

    const result = await this.model.findOne({
      where: { id, ...tenantFilter } as any,
      include: this.getDefaultIncludes(),
    });
    return result;
  }

  /**
   * Override findAllPaginated para incluir associações e parcelas
   */
  async findAllPaginated(page: number, limit: number): Promise<any> {
    const tenantFilter = this.getTenantFilter();
    if (!tenantFilter) {
      return { data: [], total: 0, page, limit, totalPages: 0 };
    }

    const offset = (page - 1) * limit;
    const { rows, count } = await this.model.findAndCountAll({
      where: { ...tenantFilter } as any,
      include: this.getDefaultIncludes(),
      order: [['dataLancamento', 'DESC']],
      limit,
      offset,
      distinct: true,
    });

    return {
      data: rows,
      total: count,
      page,
      limit,
      totalPages: Math.ceil(count / limit),
    };
  }

  /**
   * Busca títulos a receber por safra
   */
  async findBySafra(idSafra: number): Promise<TituloReceber[]> {
    const tenantFilter = this.getTenantFilter();
    const cacheKey = `tituloReceber:findBySafra:${idSafra}:${JSON.stringify(tenantFilter)}`;
    
    const cached = await this.cacheService.get<TituloReceber[]>(cacheKey);
    if (cached !== null) {
      return cached;
    }

    const where: any = { idSafra };
    if (tenantFilter) {
      if (tenantFilter.tenantId) {
        where.tenantId = tenantFilter.tenantId;
      }
    }

    const result = await this.model.findAll({
      where,
      order: [['dataLancamento', 'DESC']],
      include: [
        {
          model: Pessoa,
          as: 'cliente',
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
          model: Moeda,
          as: 'moeda',
          required: false,
        },
      ],
    });

    await this.cacheService.set(cacheKey, result, this.DEFAULT_CACHE_TTL);
    return result;
  }

  /**
   * Busca títulos a receber por fazenda
   */
  async findByFazenda(idFazenda: number): Promise<TituloReceber[]> {
    const tenantFilter = this.getTenantFilter();
    const cacheKey = `tituloReceber:findByFazenda:${idFazenda}:${JSON.stringify(tenantFilter)}`;
    
    const cached = await this.cacheService.get<TituloReceber[]>(cacheKey);
    if (cached !== null) {
      return cached;
    }

    const where: any = { idFazenda };
    if (tenantFilter) {
      if (tenantFilter.tenantId) {
        where.tenantId = tenantFilter.tenantId;
      }
    }

    const result = await this.model.findAll({
      where,
      order: [['dataLancamento', 'DESC']],
      include: [
        {
          model: Pessoa,
          as: 'cliente',
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
          model: Moeda,
          as: 'moeda',
          required: false,
        },
      ],
    });

    await this.cacheService.set(cacheKey, result, this.DEFAULT_CACHE_TTL);
    return result;
  }

  /**
   * Busca títulos a receber por cliente
   */
  async findByCliente(idCliente: number): Promise<TituloReceber[]> {
    const tenantFilter = this.getTenantFilter();
    const cacheKey = `tituloReceber:findByCliente:${idCliente}:${JSON.stringify(tenantFilter)}`;
    
    const cached = await this.cacheService.get<TituloReceber[]>(cacheKey);
    if (cached !== null) {
      return cached;
    }

    const where: any = { idCliente };
    if (tenantFilter) {
      if (tenantFilter.tenantId) {
        where.tenantId = tenantFilter.tenantId;
      }
    }

    const result = await this.model.findAll({
      where,
      order: [['dataLancamento', 'DESC']],
      include: [
        {
          model: Pessoa,
          as: 'cliente',
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
          model: Moeda,
          as: 'moeda',
          required: false,
        },
      ],
    });

    await this.cacheService.set(cacheKey, result, this.DEFAULT_CACHE_TTL);
    return result;
  }

  /**
   * Busca títulos a receber por status
   */
  async findByStatus(status: StatusTituloReceber): Promise<TituloReceber[]> {
    const tenantFilter = this.getTenantFilter();
    const cacheKey = `tituloReceber:findByStatus:${status}:${JSON.stringify(tenantFilter)}`;
    
    const cached = await this.cacheService.get<TituloReceber[]>(cacheKey);
    if (cached !== null) {
      return cached;
    }

    const where: any = { status };
    if (tenantFilter) {
      if (tenantFilter.tenantId) {
        where.tenantId = tenantFilter.tenantId;
      }
    }

    const result = await this.model.findAll({
      where,
      order: [['dataLancamento', 'DESC']],
      include: [
        {
          model: Pessoa,
          as: 'cliente',
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
          model: Moeda,
          as: 'moeda',
          required: false,
        },
      ],
    });

    await this.cacheService.set(cacheKey, result, this.DEFAULT_CACHE_TTL);
    return result;
  }

  /**
   * Busca título a receber por número do título
   * Usado para validar unicidade do número do título por tenant
   */
  async findByNumeroTitulo(numeroTitulo: string): Promise<TituloReceber | null> {
    const tenantFilter = this.getTenantFilter();
    if (!tenantFilter || !tenantFilter.tenantId) {
      throw new Error('Tenant ID é obrigatório para buscar por número do título');
    }

    const cacheKey = `tituloReceber:findByNumeroTitulo:${numeroTitulo}:${tenantFilter.tenantId}`;
    
    const cached = await this.cacheService.get<TituloReceber | null>(cacheKey);
    if (cached !== null) {
      return cached;
    }

    const result = await this.model.findOne({
      where: {
        numeroTitulo,
        tenantId: tenantFilter.tenantId,
      },
      include: [
        {
          model: Pessoa,
          as: 'cliente',
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
          model: Moeda,
          as: 'moeda',
          required: false,
        },
      ],
    });

    await this.cacheService.set(cacheKey, result, this.DEFAULT_CACHE_TTL);
    return result;
  }

  /**
   * Busca títulos a receber por período de lançamento
   */
  async findByDataLancamento(dataInicio: Date, dataFim: Date): Promise<TituloReceber[]> {
    const tenantFilter = this.getTenantFilter();
    const cacheKey = `tituloReceber:findByDataLancamento:${dataInicio.toISOString()}:${dataFim.toISOString()}:${JSON.stringify(tenantFilter)}`;
    
    const cached = await this.cacheService.get<TituloReceber[]>(cacheKey);
    if (cached !== null) {
      return cached;
    }

    const where: any = {
      dataLancamento: {
        [Op.between]: [dataInicio, dataFim],
      },
    };
    if (tenantFilter) {
      if (tenantFilter.tenantId) {
        where.tenantId = tenantFilter.tenantId;
      }
    }

    const result = await this.model.findAll({
      where,
      order: [['dataLancamento', 'DESC']],
      include: [
        {
          model: Pessoa,
          as: 'cliente',
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
          model: Moeda,
          as: 'moeda',
          required: false,
        },
      ],
    });

    await this.cacheService.set(cacheKey, result, this.DEFAULT_CACHE_TTL);
    return result;
  }
}
