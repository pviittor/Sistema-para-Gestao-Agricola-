import { Injectable, Inject } from '../../core/di';
import { TYPES } from '../../core/di/types';
import { BaseRepository } from '../../core/repository/BaseRepository';
import { IRateioPlanoContaTituloPagarRepository } from './IRateioPlanoContaTituloPagarRepository';
import { ICacheService } from '../../core/cache/ICacheService';
import { ITenantService } from '../../core/tenant/ITenantService';
import RateioPlanoContaTituloPagar from '../../models/RateioPlanoContaTituloPagar';
import TituloPagar from '../../models/TituloPagar';
import PlanoContaGerencial from '../../models/PlanoContaGerencial';

/**
 * Repositório para entidade RateioPlanoContaTituloPagar
 * 
 * Estende BaseRepository para fornecer métodos CRUD padrão e adiciona
 * métodos específicos para busca de rateios de planos de contas por título a pagar.
 */
@Injectable()
export class RateioPlanoContaTituloPagarRepository extends BaseRepository<RateioPlanoContaTituloPagar> implements IRateioPlanoContaTituloPagarRepository {
  /**
   * Construtor do repositório
   * 
   * Inicializa o BaseRepository com o modelo RateioPlanoContaTituloPagar, cacheService e tenantService.
   */
  constructor(
    @Inject(TYPES.ICacheService) cacheService: ICacheService,
    @Inject(TYPES.ITenantService) tenantService: ITenantService
  ) {
    super(RateioPlanoContaTituloPagar, cacheService, tenantService);
  }

  /**
   * Busca rateios por título a pagar
   */
  async findByTituloPagar(idTituloPagar: number): Promise<RateioPlanoContaTituloPagar[]> {
    const tenantFilter = this.getTenantFilter();
    const cacheKey = `rateioPlanoContaTituloPagar:findByTituloPagar:${idTituloPagar}:${JSON.stringify(tenantFilter)}`;
    
    const cached = await this.cacheService.get<RateioPlanoContaTituloPagar[]>(cacheKey);
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
      order: [['idPlanoContaGerencial', 'ASC']],
      include: [
        {
          model: TituloPagar,
          as: 'tituloPagar',
          required: false,
        },
        {
          model: PlanoContaGerencial,
          as: 'planoContaGerencial',
          required: false,
        },
      ],
    });

    await this.cacheService.set(cacheKey, result, this.DEFAULT_CACHE_TTL);
    return result;
  }

  /**
   * Busca rateios por plano de contas gerencial
   */
  async findByPlanoContaGerencial(idPlanoContaGerencial: number): Promise<RateioPlanoContaTituloPagar[]> {
    const tenantFilter = this.getTenantFilter();
    const cacheKey = `rateioPlanoContaTituloPagar:findByPlanoContaGerencial:${idPlanoContaGerencial}:${JSON.stringify(tenantFilter)}`;
    
    const cached = await this.cacheService.get<RateioPlanoContaTituloPagar[]>(cacheKey);
    if (cached !== null) {
      return cached;
    }

    const where: any = { idPlanoContaGerencial };
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
          model: PlanoContaGerencial,
          as: 'planoContaGerencial',
          required: false,
        },
      ],
    });

    await this.cacheService.set(cacheKey, result, this.DEFAULT_CACHE_TTL);
    return result;
  }
}
