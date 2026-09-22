import { Injectable, Inject } from '../../core/di';
import { TYPES } from '../../core/di/types';
import { BaseRepository } from '../../core/repository/BaseRepository';
import { IOrdemServicoTalhaoRepository } from './IOrdemServicoTalhaoRepository';
import { ICacheService } from '../../core/cache/ICacheService';
import { ITenantService } from '../../core/tenant/ITenantService';
import OrdemServicoTalhao from '../../models/OrdemServicoTalhao';
import Talhao from '../../models/Talhao';

/**
 * Repositório para entidade OrdemServicoTalhao
 *
 * Repositório filho (child) do padrão master-detail.
 * Estende BaseRepository e adiciona métodos específicos de busca por ordem de serviço.
 */
@Injectable()
export class OrdemServicoTalhaoRepository
  extends BaseRepository<OrdemServicoTalhao>
  implements IOrdemServicoTalhaoRepository
{
  constructor(
    @Inject(TYPES.ICacheService) cacheService: ICacheService,
    @Inject(TYPES.ITenantService) tenantService: ITenantService
  ) {
    super(OrdemServicoTalhao, cacheService, tenantService);
  }

  /**
   * Busca talhões vinculados a uma ordem de serviço, incluindo os dados do Talhao
   */
  async findByOrdemServico(osId: number): Promise<OrdemServicoTalhao[]> {
    const tenantFilter = this.getTenantFilter();
    const cacheKey = `ordemServicoTalhao:findByOrdemServico:${osId}:${JSON.stringify(tenantFilter)}`;

    const cached = await this.cacheService.get<OrdemServicoTalhao[]>(cacheKey);
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
        { model: Talhao, as: 'talhao', required: false },
      ],
    });

    await this.cacheService.set(cacheKey, result, this.DEFAULT_CACHE_TTL);
    return result;
  }

  /**
   * Remove todos os talhões de uma ordem de serviço
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
