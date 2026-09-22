import { Injectable, Inject } from '../../core/di';
import { TYPES } from '../../core/di/types';
import { BaseRepository } from '../../core/repository/BaseRepository';
import { IRateioCentroCustoTituloReceberRepository } from './IRateioCentroCustoTituloReceberRepository';
import { ICacheService } from '../../core/cache/ICacheService';
import { ITenantService } from '../../core/tenant/ITenantService';
import RateioCentroCustoTituloReceber from '../../models/RateioCentroCustoTituloReceber';
import TituloReceber from '../../models/TituloReceber';
import CentroCusto from '../../models/CentroCusto';

/**
 * Repositório para entidade RateioCentroCustoTituloReceber
 * 
 * Estende BaseRepository para fornecer métodos CRUD padrão e adiciona
 * métodos específicos para busca de rateios de centros de custo por título a receber.
 */
@Injectable()
export class RateioCentroCustoTituloReceberRepository extends BaseRepository<RateioCentroCustoTituloReceber> implements IRateioCentroCustoTituloReceberRepository {
  /**
   * Construtor do repositório
   * 
   * Inicializa o BaseRepository com o modelo RateioCentroCustoTituloReceber, cacheService e tenantService.
   */
  constructor(
    @Inject(TYPES.ICacheService) cacheService: ICacheService,
    @Inject(TYPES.ITenantService) tenantService: ITenantService
  ) {
    super(RateioCentroCustoTituloReceber, cacheService, tenantService);
  }

  /**
   * Busca rateios por título a receber
   */
  async findByTituloReceber(idTituloReceber: number): Promise<RateioCentroCustoTituloReceber[]> {
    const tenantFilter = this.getTenantFilter();
    const cacheKey = `rateioCentroCustoTituloReceber:findByTituloReceber:${idTituloReceber}:${JSON.stringify(tenantFilter)}`;
    
    const cached = await this.cacheService.get<RateioCentroCustoTituloReceber[]>(cacheKey);
    if (cached !== null) {
      return cached;
    }

    const where: any = { idTituloReceber };
    if (tenantFilter) {
      if (tenantFilter.tenantId) {
        where.tenantId = tenantFilter.tenantId;
      }
    }

    const result = await this.model.findAll({
      where,
      order: [['idCentroCusto', 'ASC']],
      include: [
        {
          model: TituloReceber,
          as: 'tituloReceber',
          required: false,
        },
        {
          model: CentroCusto,
          as: 'centroCusto',
          required: false,
        },
      ],
    });

    await this.cacheService.set(cacheKey, result, this.DEFAULT_CACHE_TTL);
    return result;
  }

  /**
   * Busca rateios por centro de custo
   */
  async findByCentroCusto(idCentroCusto: number): Promise<RateioCentroCustoTituloReceber[]> {
    const tenantFilter = this.getTenantFilter();
    const cacheKey = `rateioCentroCustoTituloReceber:findByCentroCusto:${idCentroCusto}:${JSON.stringify(tenantFilter)}`;
    
    const cached = await this.cacheService.get<RateioCentroCustoTituloReceber[]>(cacheKey);
    if (cached !== null) {
      return cached;
    }

    const where: any = { idCentroCusto };
    if (tenantFilter) {
      if (tenantFilter.tenantId) {
        where.tenantId = tenantFilter.tenantId;
      }
    }

    const result = await this.model.findAll({
      where,
      order: [['idTituloReceber', 'ASC']],
      include: [
        {
          model: TituloReceber,
          as: 'tituloReceber',
          required: false,
        },
        {
          model: CentroCusto,
          as: 'centroCusto',
          required: false,
        },
      ],
    });

    await this.cacheService.set(cacheKey, result, this.DEFAULT_CACHE_TTL);
    return result;
  }
}
