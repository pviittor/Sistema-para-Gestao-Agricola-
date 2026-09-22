import { Injectable, Inject } from '../../core/di';
import { TYPES } from '../../core/di/types';
import { BaseRepository } from '../../core/repository/BaseRepository';
import { IGrupoEquipamentoRepository } from './IGrupoEquipamentoRepository';
import { ICacheService } from '../../core/cache/ICacheService';
import { ITenantService } from '../../core/tenant/ITenantService';
import GrupoEquipamento from '../../models/GrupoEquipamento';

/**
 * Repositório para entidade GrupoEquipamento
 *
 * Estende BaseRepository para fornecer métodos CRUD padrão e adiciona
 * métodos específicos para busca de grupos de equipamento.
 */
@Injectable()
export class GrupoEquipamentoRepository extends BaseRepository<GrupoEquipamento> implements IGrupoEquipamentoRepository {
  /**
   * Construtor do repositório
   *
   * Inicializa o BaseRepository com o modelo GrupoEquipamento, cacheService e tenantService.
   */
  constructor(
    @Inject(TYPES.ICacheService) cacheService: ICacheService,
    @Inject(TYPES.ITenantService) tenantService: ITenantService
  ) {
    super(GrupoEquipamento, cacheService, tenantService);
  }

  /**
   * Busca uma entidade por ID usando a PK customizada id_grpequip
   */
  async findById(id: number | string): Promise<GrupoEquipamento | null> {
    const tenantFilter = this.getTenantFilter();
    const where: any = { id_grpequip: id };
    if (tenantFilter) {
      if (tenantFilter.tenantId) {
        where.tenantId = tenantFilter.tenantId;
      }
    }

    return await this.model.findOne({ where });
  }
}
