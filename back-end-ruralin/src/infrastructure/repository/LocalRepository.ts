/**
 * LocalRepository - Repositório para entidade Local
 * 
 * Implementa ILocalRepository estendendo BaseRepository e adiciona
 * métodos específicos para busca de locais por usuário.
 * 
 * @example
 * ```typescript
 * import { LocalRepository } from './LocalRepository';
 * 
 * const repository = new LocalRepository();
 * const locais = await repository.findByUsuario(1);
 * ```
 */

import { Injectable, Inject } from '../../core/di';
import { TYPES } from '../../core/di/types';
import { BaseRepository } from '../../core/repository/BaseRepository';
import { ILocalRepository } from './ILocalRepository';
import { ICacheService } from '../../core/cache/ICacheService';
import { ITenantService } from '../../core/tenant/ITenantService';
import Local from '../../models/Local';

/**
 * Repositório para entidade Local
 * 
 * Estende BaseRepository para fornecer métodos CRUD padrão e adiciona
 * métodos específicos para busca por usuário.
 */
@Injectable()
export class LocalRepository extends BaseRepository<Local> implements ILocalRepository {
  /**
   * Construtor do repositório
   * 
   * Inicializa o BaseRepository com o modelo Local, cacheService e tenantService.
   */
  constructor(
    @Inject(TYPES.ICacheService) cacheService: ICacheService,
    @Inject(TYPES.ITenantService) tenantService: ITenantService
  ) {
    super(Local, cacheService, tenantService);
  }

  /**
   * Busca locais por usuário
   * 
   * @param usuarioId - ID do usuário
   * @returns Promise que resolve com array de locais do usuário
   */
  async findByUsuario(usuarioId: number): Promise<Local[]> {
    return await this.findAll({
      where: { usuarioId },
      order: [['desc_simples', 'ASC']],
    });
  }
}
