import { Injectable, Inject } from '../../core/di';
import { TYPES } from '../../core/di/types';
import { BaseRepository } from '../../core/repository/BaseRepository';
import { IListaBancosRepository } from './IListaBancosRepository';
import { ICacheService } from '../../core/cache/ICacheService';
import { ITenantService } from '../../core/tenant/ITenantService';
import ListaBancos from '../../models/ListaBancos';
import { PaginatedResult } from '../../core/repository/types';

/**
 * Repositório para entidade ListaBancos
 * 
 * Dados globais - sempre usa métodos sem filtro de tenant
 */
@Injectable()
export class ListaBancosRepository extends BaseRepository<ListaBancos> implements IListaBancosRepository {
  constructor(
    @Inject(TYPES.ICacheService) cacheService: ICacheService,
    @Inject(TYPES.ITenantService) tenantService: ITenantService
  ) {
    super(ListaBancos, cacheService, tenantService);
  }

  /**
   * Busca uma entidade por ID (sem filtro de tenant - dados globais)
   */
  async findById(id: number | string): Promise<ListaBancos | null> {
    return await this.findByIdWithoutTenant(id);
  }

  /**
   * Busca todas as entidades paginadas (sem filtro de tenant - dados globais)
   */
  async findAllPaginated(page: number = 1, limit: number = 10): Promise<PaginatedResult<ListaBancos>> {
    return await this.findAllPaginatedWithoutTenant(page, limit, {
      order: [['nome', 'ASC']],
    });
  }
}
