import { Injectable, Inject } from '../../core/di';
import { TYPES } from '../../core/di/types';
import { BaseRepository } from '../../core/repository/BaseRepository';
import { IOrdemServicoMaquinaRepository } from './IOrdemServicoMaquinaRepository';
import { ICacheService } from '../../core/cache/ICacheService';
import { ITenantService } from '../../core/tenant/ITenantService';
import OrdemServicoMaquina from '../../models/OrdemServicoMaquina';
import Maquina from '../../models/Maquina';
import Pessoa from '../../models/Pessoa';

/**
 * Repositório para entidade OrdemServicoMaquina
 *
 * Repositório filho (child) do padrão master-detail.
 * Estende BaseRepository e adiciona métodos específicos de busca por ordem de serviço.
 */
@Injectable()
export class OrdemServicoMaquinaRepository
  extends BaseRepository<OrdemServicoMaquina>
  implements IOrdemServicoMaquinaRepository
{
  constructor(
    @Inject(TYPES.ICacheService) cacheService: ICacheService,
    @Inject(TYPES.ITenantService) tenantService: ITenantService
  ) {
    super(OrdemServicoMaquina, cacheService, tenantService);
  }

  /**
   * Busca máquinas vinculadas a uma ordem de serviço,
   * incluindo Maquina (as 'maquina'), Maquina (as 'implemento') e Pessoa (as 'operador')
   */
  async findByOrdemServico(osId: number): Promise<OrdemServicoMaquina[]> {
    const tenantFilter = this.getTenantFilter();
    const cacheKey = `ordemServicoMaquina:findByOrdemServico:${osId}:${JSON.stringify(tenantFilter)}`;

    const cached = await this.cacheService.get<OrdemServicoMaquina[]>(cacheKey);
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
        { model: Maquina, as: 'maquina', required: false },
        { model: Maquina, as: 'implemento', required: false },
        { model: Pessoa, as: 'operador', required: false },
      ],
    });

    await this.cacheService.set(cacheKey, result, this.DEFAULT_CACHE_TTL);
    return result;
  }

  /**
   * Remove todas as máquinas de uma ordem de serviço
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
