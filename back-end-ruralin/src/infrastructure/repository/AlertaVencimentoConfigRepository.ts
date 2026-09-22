import { Injectable, Inject } from '../../core/di';
import { TYPES } from '../../core/di/types';
import { BaseRepository } from '../../core/repository/BaseRepository';
import { IAlertaVencimentoConfigRepository } from './IAlertaVencimentoConfigRepository';
import { ICacheService } from '../../core/cache/ICacheService';
import { ITenantService } from '../../core/tenant/ITenantService';
import AlertaVencimentoConfig from '../../models/AlertaVencimentoConfig';

/**
 * Repositório para entidade AlertaVencimentoConfig
 *
 * Estende BaseRepository para fornecer métodos CRUD padrão e adiciona
 * métodos específicos para busca de configurações de alerta de vencimento.
 */
@Injectable()
export class AlertaVencimentoConfigRepository extends BaseRepository<AlertaVencimentoConfig> implements IAlertaVencimentoConfigRepository {
  /**
   * Construtor do repositório
   *
   * Inicializa o BaseRepository com o modelo AlertaVencimentoConfig, cacheService e tenantService.
   */
  constructor(
    @Inject(TYPES.ICacheService) cacheService: ICacheService,
    @Inject(TYPES.ITenantService) tenantService: ITenantService
  ) {
    super(AlertaVencimentoConfig, cacheService, tenantService);
  }

  /**
   * Busca configurações de alerta por usuário e tenant
   */
  async findByUsuario(usuarioId: number, tenantId: number): Promise<AlertaVencimentoConfig[]> {
    const where: any = { usuarioId, tenantId };

    return this.model.findAll({
      where,
      order: [['id', 'ASC']],
    });
  }

  /**
   * Busca todas as configurações ativas
   */
  async findAtivas(): Promise<AlertaVencimentoConfig[]> {
    const where: any = { ativo: true };
    const tenantFilter = this.getTenantFilter();
    if (tenantFilter?.tenantId) {
      where.tenantId = tenantFilter.tenantId;
    }

    return this.model.findAll({
      where,
      order: [['id', 'ASC']],
    });
  }
}
