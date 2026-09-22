import { Injectable, Inject } from '../../core/di'
import { TYPES } from '../../core/di/types'
import { BaseRepository } from '../../core/repository/BaseRepository'
import { ICotacaoItemRepository } from './ICotacaoItemRepository'
import { ICacheService } from '../../core/cache/ICacheService'
import { ITenantService } from '../../core/tenant/ITenantService'
import CotacaoItem from '../../models/CotacaoItem'

/**
 * Repositorio para entidade CotacaoItem
 */
@Injectable()
export class CotacaoItemRepository extends BaseRepository<CotacaoItem> implements ICotacaoItemRepository {
  constructor(
    @Inject(TYPES.ICacheService) cacheService: ICacheService,
    @Inject(TYPES.ITenantService) tenantService: ITenantService
  ) {
    super(CotacaoItem, cacheService, tenantService)
  }

  async findByCotacao(cotacaoId: number): Promise<CotacaoItem[]> {
    const where: any = { cotacaoId }
    const tenantFilter = this.getTenantFilter()
    if (tenantFilter?.tenantId) where.tenantId = tenantFilter.tenantId
    return this.model.findAll({ where, order: [['id', 'ASC']] })
  }

  async deleteByCotacao(cotacaoId: number): Promise<number> {
    const where: any = { cotacaoId }
    const tenantFilter = this.getTenantFilter()
    if (tenantFilter?.tenantId) where.tenantId = tenantFilter.tenantId
    return this.model.destroy({ where })
  }
}
