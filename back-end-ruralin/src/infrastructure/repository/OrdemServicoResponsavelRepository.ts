import { Injectable, Inject } from '../../core/di';
import { TYPES } from '../../core/di/types';
import { BaseRepository } from '../../core/repository/BaseRepository';
import { IOrdemServicoResponsavelRepository } from './IOrdemServicoResponsavelRepository';
import { ICacheService } from '../../core/cache/ICacheService';
import { ITenantService } from '../../core/tenant/ITenantService';
import OrdemServicoResponsavel from '../../models/OrdemServicoResponsavel';
import Pessoa from '../../models/Pessoa';

/**
 * Repositório para entidade OrdemServicoResponsavel
 *
 * Repositório filho (child) do padrão master-detail.
 * Estende BaseRepository e adiciona métodos específicos de busca por ordem de serviço.
 */
@Injectable()
export class OrdemServicoResponsavelRepository
  extends BaseRepository<OrdemServicoResponsavel>
  implements IOrdemServicoResponsavelRepository
{
  constructor(
    @Inject(TYPES.ICacheService) cacheService: ICacheService,
    @Inject(TYPES.ITenantService) tenantService: ITenantService
  ) {
    super(OrdemServicoResponsavel, cacheService, tenantService);
  }

  /**
   * Busca responsáveis vinculados a uma ordem de serviço, incluindo os dados da Pessoa
   */
  async findByOrdemServico(osId: number): Promise<OrdemServicoResponsavel[]> {
    const tenantFilter = this.getTenantFilter();
    const cacheKey = `ordemServicoResponsavel:findByOrdemServico:${osId}:${JSON.stringify(tenantFilter)}`;

    const cached = await this.cacheService.get<OrdemServicoResponsavel[]>(cacheKey);
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
        { model: Pessoa, as: 'pessoa', required: false },
      ],
    });

    await this.cacheService.set(cacheKey, result, this.DEFAULT_CACHE_TTL);
    return result;
  }

  /**
   * Remove todos os responsáveis de uma ordem de serviço
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
