import { Injectable, Inject } from '../../core/di';
import { TYPES } from '../../core/di/types';
import { BaseRepository } from '../../core/repository/BaseRepository';
import { IRateioPlanoContaTituloReceberRepository } from './IRateioPlanoContaTituloReceberRepository';
import { ICacheService } from '../../core/cache/ICacheService';
import { ITenantService } from '../../core/tenant/ITenantService';
import RateioPlanoContaTituloReceber from '../../models/RateioPlanoContaTituloReceber';
import TituloReceber from '../../models/TituloReceber';
import PlanoContaGerencial from '../../models/PlanoContaGerencial';

/**
 * Repositório para entidade RateioPlanoContaTituloReceber
 * 
 * Estende BaseRepository para fornecer métodos CRUD padrão e adiciona
 * métodos específicos para busca de rateios de planos de contas por título a receber.
 */
@Injectable()
export class RateioPlanoContaTituloReceberRepository extends BaseRepository<RateioPlanoContaTituloReceber> implements IRateioPlanoContaTituloReceberRepository {
  /**
   * Construtor do repositório
   * 
   * Inicializa o BaseRepository com o modelo RateioPlanoContaTituloReceber, cacheService e tenantService.
   */
  constructor(
    @Inject(TYPES.ICacheService) cacheService: ICacheService,
    @Inject(TYPES.ITenantService) tenantService: ITenantService
  ) {
    super(RateioPlanoContaTituloReceber, cacheService, tenantService);
  }

  /**
   * Busca rateios por título a receber
   */
  async findByTituloReceber(idTituloReceber: number): Promise<RateioPlanoContaTituloReceber[]> {
    const tenantFilter = this.getTenantFilter();
    const cacheKey = `rateioPlanoContaTituloReceber:findByTituloReceber:${idTituloReceber}:${JSON.stringify(tenantFilter)}`;
    
    const cached = await this.cacheService.get<RateioPlanoContaTituloReceber[]>(cacheKey);
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
      order: [['idPlanoContaGerencial', 'ASC']],
      include: [
        {
          model: TituloReceber,
          as: 'tituloReceber',
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
  async findByPlanoContaGerencial(idPlanoContaGerencial: number): Promise<RateioPlanoContaTituloReceber[]> {
    const tenantFilter = this.getTenantFilter();
    const cacheKey = `rateioPlanoContaTituloReceber:findByPlanoContaGerencial:${idPlanoContaGerencial}:${JSON.stringify(tenantFilter)}`;
    
    const cached = await this.cacheService.get<RateioPlanoContaTituloReceber[]>(cacheKey);
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
      order: [['idTituloReceber', 'ASC']],
      include: [
        {
          model: TituloReceber,
          as: 'tituloReceber',
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
