import { Injectable, Inject } from '../../core/di';
import { TYPES } from '../../core/di/types';
import { BaseRepository } from '../../core/repository/BaseRepository';
import { IFluxoCaixaConfiguracaoRepository } from './IFluxoCaixaConfiguracaoRepository';
import { ICacheService } from '../../core/cache/ICacheService';
import { ITenantService } from '../../core/tenant/ITenantService';
import FluxoCaixaConfiguracao from '../../models/FluxoCaixaConfiguracao';

/**
 * Repositório para entidade FluxoCaixaConfiguracao
 *
 * Estende BaseRepository para fornecer métodos CRUD padrão e adiciona
 * método específico para busca de configuração por tenant.
 */
@Injectable()
export class FluxoCaixaConfiguracaoRepository extends BaseRepository<FluxoCaixaConfiguracao> implements IFluxoCaixaConfiguracaoRepository {
  constructor(
    @Inject(TYPES.ICacheService) cacheService: ICacheService,
    @Inject(TYPES.ITenantService) tenantService: ITenantService
  ) {
    super(FluxoCaixaConfiguracao, cacheService, tenantService);
  }

  /**
   * Busca a configuração de fluxo de caixa de um tenant
   *
   * @param tenantId - ID do tenant
   * @returns Promise que resolve com a configuração ou null se não encontrada
   */
  async findByTenant(tenantId: number): Promise<FluxoCaixaConfiguracao | null> {
    return this.model.findOne({ where: { tenantId } });
  }
}
