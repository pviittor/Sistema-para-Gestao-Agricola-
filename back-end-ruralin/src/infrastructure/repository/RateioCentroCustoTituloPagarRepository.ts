import { Injectable, Inject } from '../../core/di';
import { TYPES } from '../../core/di/types';
import { BaseRepository } from '../../core/repository/BaseRepository';
import { IRateioCentroCustoTituloPagarRepository } from './IRateioCentroCustoTituloPagarRepository';
import { ICacheService } from '../../core/cache/ICacheService';
import { ITenantService } from '../../core/tenant/ITenantService';
import RateioCentroCustoTituloPagar from '../../models/RateioCentroCustoTituloPagar';
import TituloPagar from '../../models/TituloPagar';
import CentroCusto from '../../models/CentroCusto';

/**
 * Repositório para entidade RateioCentroCustoTituloPagar
 * 
 * Estende BaseRepository para fornecer métodos CRUD padrão e adiciona
 * métodos específicos para busca de rateios de centros de custo por título a pagar.
 */
@Injectable()
export class RateioCentroCustoTituloPagarRepository extends BaseRepository<RateioCentroCustoTituloPagar> implements IRateioCentroCustoTituloPagarRepository {
  /**
   * Construtor do repositório
   * 
   * Inicializa o BaseRepository com o modelo RateioCentroCustoTituloPagar, cacheService e tenantService.
   */
  constructor(
    @Inject(TYPES.ICacheService) cacheService: ICacheService,
    @Inject(TYPES.ITenantService) tenantService: ITenantService
  ) {
    super(RateioCentroCustoTituloPagar, cacheService, tenantService);
  }

  /**
   * Busca rateios por título a pagar
   */
  async findByTituloPagar(idTituloPagar: number): Promise<RateioCentroCustoTituloPagar[]> {
    const tenantFilter = this.getTenantFilter();
    const cacheKey = `rateioCentroCustoTituloPagar:findByTituloPagar:${idTituloPagar}:${JSON.stringify(tenantFilter)}`;
    
    const cached = await this.cacheService.get<RateioCentroCustoTituloPagar[]>(cacheKey);
    if (cached !== null) {
      return cached;
    }

    const where: any = { idTituloPagar };
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
          model: TituloPagar,
          as: 'tituloPagar',
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
  async findByCentroCusto(idCentroCusto: number): Promise<RateioCentroCustoTituloPagar[]> {
    const tenantFilter = this.getTenantFilter();
    const cacheKey = `rateioCentroCustoTituloPagar:findByCentroCusto:${idCentroCusto}:${JSON.stringify(tenantFilter)}`;
    
    const cached = await this.cacheService.get<RateioCentroCustoTituloPagar[]>(cacheKey);
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
      order: [['idTituloPagar', 'ASC']],
      include: [
        {
          model: TituloPagar,
          as: 'tituloPagar',
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
