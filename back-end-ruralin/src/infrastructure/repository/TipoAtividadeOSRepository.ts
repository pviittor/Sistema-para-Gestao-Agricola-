import { Injectable, Inject } from '../../core/di';
import { TYPES } from '../../core/di/types';
import { BaseRepository } from '../../core/repository/BaseRepository';
import { ITipoAtividadeOSRepository } from './ITipoAtividadeOSRepository';
import { ICacheService } from '../../core/cache/ICacheService';
import { ITenantService } from '../../core/tenant/ITenantService';
import TipoAtividadeOS from '../../models/TipoAtividadeOS';
import CampoCondicionalTipoAtividade from '../../models/CampoCondicionalTipoAtividade';
import { CategoriaAtividadeOS } from '../../models/enums/OrdemServicoEnums';

/**
 * Repositório para entidade TipoAtividadeOS
 *
 * Estende BaseRepository para fornecer métodos CRUD padrão e adiciona
 * métodos específicos para busca de tipos de atividade de OS.
 */
@Injectable()
export class TipoAtividadeOSRepository extends BaseRepository<TipoAtividadeOS> implements ITipoAtividadeOSRepository {
  constructor(
    @Inject(TYPES.ICacheService) cacheService: ICacheService,
    @Inject(TYPES.ITenantService) tenantService: ITenantService
  ) {
    super(TipoAtividadeOS, cacheService, tenantService);
  }

  /**
   * Override findById para incluir camposCondicionais
   */
  async findById(id: number | string): Promise<TipoAtividadeOS | null> {
    const tenantFilter = this.getTenantFilter();
    const cacheKey = `tipoAtividadeOS:findById:${id}:${JSON.stringify(tenantFilter)}`;

    const cached = await this.cacheService.get<TipoAtividadeOS>(cacheKey);
    if (cached !== null) {
      return cached;
    }

    const where: any = { id };
    if (tenantFilter) {
      if (tenantFilter.tenantId) {
        where.tenantId = tenantFilter.tenantId;
      }
    }

    const result = await this.model.findOne({
      where,
      include: [
        {
          model: CampoCondicionalTipoAtividade,
          as: 'camposCondicionais',
          required: false,
          order: [['ordem', 'ASC']],
        },
      ],
    });

    if (result) {
      await this.cacheService.set(cacheKey, result, this.DEFAULT_CACHE_TTL);
    }

    return result;
  }

  /**
   * Busca tipos de atividade por categoria
   */
  async findByCategoria(categoria: CategoriaAtividadeOS): Promise<TipoAtividadeOS[]> {
    const tenantFilter = this.getTenantFilter();
    const cacheKey = `tipoAtividadeOS:findByCategoria:${categoria}:${JSON.stringify(tenantFilter)}`;

    const cached = await this.cacheService.get<TipoAtividadeOS[]>(cacheKey);
    if (cached !== null) {
      return cached;
    }

    const where: any = { categoria };
    if (tenantFilter) {
      if (tenantFilter.tenantId) {
        where.tenantId = tenantFilter.tenantId;
      }
    }

    const result = await this.model.findAll({
      where,
      order: [['nome', 'ASC']],
    });

    await this.cacheService.set(cacheKey, result, this.DEFAULT_CACHE_TTL);
    return result;
  }
}
