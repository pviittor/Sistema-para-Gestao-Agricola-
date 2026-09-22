import { Injectable, Inject } from '../../core/di';
import { TYPES } from '../../core/di/types';
import { BaseRepository } from '../../core/repository/BaseRepository';
import { ICampoCondicionalTipoAtividadeRepository } from './ICampoCondicionalTipoAtividadeRepository';
import { ICacheService } from '../../core/cache/ICacheService';
import { ITenantService } from '../../core/tenant/ITenantService';
import CampoCondicionalTipoAtividade from '../../models/CampoCondicionalTipoAtividade';

/**
 * Repositório para entidade CampoCondicionalTipoAtividade
 *
 * Repositório filho (child) do padrão master-detail.
 * Estende BaseRepository e adiciona métodos específicos de busca por tipo de atividade OS.
 */
@Injectable()
export class CampoCondicionalTipoAtividadeRepository
  extends BaseRepository<CampoCondicionalTipoAtividade>
  implements ICampoCondicionalTipoAtividadeRepository
{
  constructor(
    @Inject(TYPES.ICacheService) cacheService: ICacheService,
    @Inject(TYPES.ITenantService) tenantService: ITenantService
  ) {
    super(CampoCondicionalTipoAtividade, cacheService, tenantService);
  }

  /**
   * Busca campos condicionais por tipo de atividade OS, ordenados por `ordem ASC`
   */
  async findByTipoAtividade(tipoAtividadeOSId: number): Promise<CampoCondicionalTipoAtividade[]> {
    const tenantFilter = this.getTenantFilter();
    const cacheKey = `campoCondicionalTipoAtividade:findByTipoAtividade:${tipoAtividadeOSId}:${JSON.stringify(tenantFilter)}`;

    const cached = await this.cacheService.get<CampoCondicionalTipoAtividade[]>(cacheKey);
    if (cached !== null) {
      return cached;
    }

    const where: any = { tipoAtividadeOSId };
    if (tenantFilter) {
      if (tenantFilter.tenantId) {
        where.tenantId = tenantFilter.tenantId;
      }
    }

    const result = await this.model.findAll({
      where,
      order: [['ordem', 'ASC']],
    });

    await this.cacheService.set(cacheKey, result, this.DEFAULT_CACHE_TTL);
    return result;
  }

  /**
   * Remove todos os campos condicionais de um tipo de atividade OS
   */
  async deleteByTipoAtividade(tipoAtividadeOSId: number): Promise<number> {
    const tenantFilter = this.getTenantFilter();
    const where: any = { tipoAtividadeOSId };
    if (tenantFilter) {
      if (tenantFilter.tenantId) {
        where.tenantId = tenantFilter.tenantId;
      }
    }

    return this.model.destroy({ where });
  }
}
