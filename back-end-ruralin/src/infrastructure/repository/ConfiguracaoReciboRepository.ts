import { Injectable, Inject } from '../../core/di';
import { TYPES } from '../../core/di/types';
import { BaseRepository } from '../../core/repository/BaseRepository';
import { IConfiguracaoReciboRepository } from './IConfiguracaoReciboRepository';
import { ICacheService } from '../../core/cache/ICacheService';
import { ITenantService } from '../../core/tenant/ITenantService';
import ConfiguracaoRecibo from '../../models/ConfiguracaoRecibo';

@Injectable()
export class ConfiguracaoReciboRepository extends BaseRepository<ConfiguracaoRecibo> implements IConfiguracaoReciboRepository {
  constructor(
    @Inject(TYPES.ICacheService) cacheService: ICacheService,
    @Inject(TYPES.ITenantService) tenantService: ITenantService
  ) {
    super(ConfiguracaoRecibo, cacheService, tenantService);
  }

  async findByTenant(): Promise<ConfiguracaoRecibo | null> {
    const where: any = { ativo: true };
    const tenantFilter = this.getTenantFilter();
    if (tenantFilter?.tenantId) where.tenantId = tenantFilter.tenantId;
    return this.model.findOne({ where });
  }
}
