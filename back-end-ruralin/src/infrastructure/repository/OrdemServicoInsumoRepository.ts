import { Injectable, Inject } from '../../core/di';
import { TYPES } from '../../core/di/types';
import { BaseRepository } from '../../core/repository/BaseRepository';
import { IOrdemServicoInsumoRepository } from './IOrdemServicoInsumoRepository';
import { ICacheService } from '../../core/cache/ICacheService';
import { ITenantService } from '../../core/tenant/ITenantService';
import OrdemServicoInsumo from '../../models/OrdemServicoInsumo';
import Produto from '../../models/Produto';
import UnidadeMedida from '../../models/UnidadeMedida';

/**
 * Repositório para entidade OrdemServicoInsumo
 *
 * Repositório filho (child) do padrão master-detail.
 * Estende BaseRepository e adiciona métodos específicos de busca por ordem de serviço.
 */
@Injectable()
export class OrdemServicoInsumoRepository
  extends BaseRepository<OrdemServicoInsumo>
  implements IOrdemServicoInsumoRepository
{
  constructor(
    @Inject(TYPES.ICacheService) cacheService: ICacheService,
    @Inject(TYPES.ITenantService) tenantService: ITenantService
  ) {
    super(OrdemServicoInsumo, cacheService, tenantService);
  }

  /**
   * Busca insumos vinculados a uma ordem de serviço, incluindo Produto e UnidadeMedida
   */
  async findByOrdemServico(osId: number): Promise<OrdemServicoInsumo[]> {
    const tenantFilter = this.getTenantFilter();
    const cacheKey = `ordemServicoInsumo:findByOrdemServico:${osId}:${JSON.stringify(tenantFilter)}`;

    const cached = await this.cacheService.get<OrdemServicoInsumo[]>(cacheKey);
    if (cached !== null) {
      return cached;
    }

    const where: any = { ordemServicoId: osId };
    if (tenantFilter) {
      if (tenantFilter.tenantId) {
        where.tenantId = tenantFilter.tenantId;
      }
    }

    const result = await this.model.findAll({
      where,
      order: [['id', 'ASC']],
      include: [
        { model: Produto, as: 'produto', required: false },
        { model: UnidadeMedida, as: 'unidadeMedida', required: false },
      ],
    });

    await this.cacheService.set(cacheKey, result, this.DEFAULT_CACHE_TTL);
    return result;
  }

  /**
   * Remove todos os insumos de uma ordem de serviço
   */
  async deleteByOrdemServico(osId: number): Promise<number> {
    const tenantFilter = this.getTenantFilter();
    const where: any = { ordemServicoId: osId };
    if (tenantFilter) {
      if (tenantFilter.tenantId) {
        where.tenantId = tenantFilter.tenantId;
      }
    }

    return this.model.destroy({ where });
  }
}
