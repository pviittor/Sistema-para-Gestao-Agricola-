import { Injectable, Inject } from '../../core/di';
import { TYPES } from '../../core/di/types';
import { BaseRepository } from '../../core/repository/BaseRepository';
import { ITituloPagarRepository } from './ITituloPagarRepository';
import { ICacheService } from '../../core/cache/ICacheService';
import { ITenantService } from '../../core/tenant/ITenantService';
import TituloPagar from '../../models/TituloPagar';
import { StatusTituloPagar } from '../../models/TituloPagar';
import { Op } from 'sequelize';
import type { Includeable } from 'sequelize';
import Pessoa from '../../models/Pessoa';
import Fazenda from '../../models/Fazenda';
import Safra from '../../models/Safra';
import Moeda from '../../models/Moeda';
import ParcelaTituloPagar from '../../models/ParcelaTituloPagar';
import RateioPlanoContaTituloPagar from '../../models/RateioPlanoContaTituloPagar';
import RateioCentroCustoTituloPagar from '../../models/RateioCentroCustoTituloPagar';

/**
 * Repositório para entidade TituloPagar
 * 
 * Estende BaseRepository para fornecer métodos CRUD padrão e adiciona
 * métodos específicos para busca de títulos a pagar.
 */
@Injectable()
export class TituloPagarRepository extends BaseRepository<TituloPagar> implements ITituloPagarRepository {
  /**
   * Construtor do repositório
   * 
   * Inicializa o BaseRepository com o modelo TituloPagar, cacheService e tenantService.
   */
  constructor(
    @Inject(TYPES.ICacheService) cacheService: ICacheService,
    @Inject(TYPES.ITenantService) tenantService: ITenantService
  ) {
    super(TituloPagar, cacheService, tenantService);
  }

  /**
   * Includes padrão para queries de TituloPagar
   */
  private getDefaultIncludes(): Includeable[] {
    return [
      { model: Pessoa, as: 'fornecedor', required: false },
      { model: Pessoa, as: 'portador', required: false },
      { model: Pessoa, as: 'produtor', required: false },
      { model: Fazenda, as: 'fazenda', required: false },
      { model: Safra, as: 'safra', required: false },
      { model: Moeda, as: 'moeda', required: false },
      { model: ParcelaTituloPagar, as: 'parcelas', required: false },
      { model: RateioPlanoContaTituloPagar, as: 'rateiosPlanoConta', required: false },
      { model: RateioCentroCustoTituloPagar, as: 'rateiosCentroCusto', required: false },
    ];
  }

  /**
   * Override findById para incluir associações e parcelas
   */
  async findById(id: number | string): Promise<TituloPagar | null> {
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
   * Busca títulos a pagar por safra
   */
  async findBySafra(idSafra: number): Promise<TituloPagar[]> {
    const tenantFilter = this.getTenantFilter();
    const cacheKey = `tituloPagar:findBySafra:${idSafra}:${JSON.stringify(tenantFilter)}`;
    
    const cached = await this.cacheService.get<TituloPagar[]>(cacheKey);
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
          as: 'fornecedor',
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
   * Busca títulos a pagar por fazenda
   */
  async findByFazenda(idFazenda: number): Promise<TituloPagar[]> {
    const tenantFilter = this.getTenantFilter();
    const cacheKey = `tituloPagar:findByFazenda:${idFazenda}:${JSON.stringify(tenantFilter)}`;
    
    const cached = await this.cacheService.get<TituloPagar[]>(cacheKey);
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
          as: 'fornecedor',
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
   * Busca títulos a pagar por fornecedor
   */
  async findByFornecedor(idFornecedor: number): Promise<TituloPagar[]> {
    const tenantFilter = this.getTenantFilter();
    const cacheKey = `tituloPagar:findByFornecedor:${idFornecedor}:${JSON.stringify(tenantFilter)}`;
    
    const cached = await this.cacheService.get<TituloPagar[]>(cacheKey);
    if (cached !== null) {
      return cached;
    }

    const where: any = { idFornecedor };
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
          as: 'fornecedor',
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
   * Busca títulos a pagar por status
   */
  async findByStatus(status: StatusTituloPagar): Promise<TituloPagar[]> {
    const tenantFilter = this.getTenantFilter();
    const cacheKey = `tituloPagar:findByStatus:${status}:${JSON.stringify(tenantFilter)}`;
    
    const cached = await this.cacheService.get<TituloPagar[]>(cacheKey);
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
          as: 'fornecedor',
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
   * Busca título a pagar por número do título
   * Usado para validar unicidade do número do título por tenant
   */
  async findByNumeroTitulo(numeroTitulo: string): Promise<TituloPagar | null> {
    const tenantFilter = this.getTenantFilter();
    if (!tenantFilter || !tenantFilter.tenantId) {
      throw new Error('Tenant ID é obrigatório para buscar por número do título');
    }

    const cacheKey = `tituloPagar:findByNumeroTitulo:${numeroTitulo}:${tenantFilter.tenantId}`;
    
    const cached = await this.cacheService.get<TituloPagar | null>(cacheKey);
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
          as: 'fornecedor',
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
   * Busca títulos a pagar por período de lançamento
   */
  async findByDataLancamento(dataInicio: Date, dataFim: Date): Promise<TituloPagar[]> {
    const tenantFilter = this.getTenantFilter();
    const cacheKey = `tituloPagar:findByDataLancamento:${dataInicio.toISOString()}:${dataFim.toISOString()}:${JSON.stringify(tenantFilter)}`;
    
    const cached = await this.cacheService.get<TituloPagar[]>(cacheKey);
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
          as: 'fornecedor',
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
