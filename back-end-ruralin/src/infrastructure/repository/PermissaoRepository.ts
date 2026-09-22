/**
 * PermissaoRepository - Repositório para entidade Permissao
 * 
 * Implementa IPermissaoRepository estendendo BaseRepository e adiciona
 * métodos específicos para busca de permissões por nome.
 * 
 * @example
 * ```typescript
 * import { PermissaoRepository } from './PermissaoRepository';
 * 
 * const repository = new PermissaoRepository();
 * const permissao = await repository.findByNome('usuario:create');
 * ```
 */

import { Injectable, Inject } from '../../core/di';
import { TYPES } from '../../core/di/types';
import { BaseRepository } from '../../core/repository/BaseRepository';
import { IPermissaoRepository } from './IPermissaoRepository';
import { ICacheService } from '../../core/cache/ICacheService';
import { ITenantService } from '../../core/tenant/ITenantService';
import Permissao from '../../models/Permissao';

/**
 * Repositório para entidade Permissao
 * 
 * Estende BaseRepository para fornecer métodos CRUD padrão e adiciona
 * métodos específicos para busca por nome.
 */
@Injectable()
export class PermissaoRepository extends BaseRepository<Permissao> implements IPermissaoRepository {
  /**
   * Construtor do repositório
   * 
   * Inicializa o BaseRepository com o modelo Permissao, cacheService e tenantService.
   */
  constructor(
    @Inject(TYPES.ICacheService) cacheService: ICacheService,
    @Inject(TYPES.ITenantService) tenantService: ITenantService
  ) {
    super(Permissao, cacheService, tenantService);
  }

  /**
   * Busca uma permissão por nome
   * 
   * Permissões são entidades globais que não possuem tenantId, portanto
   * este método usa findOneWithoutTenant para buscar sem filtro de tenant.
   * 
   * @param nome - Nome da permissão
   * @returns Promise que resolve com a permissão encontrada ou null
   */
  async findByNome(nome: string): Promise<Permissao | null> {
    // Permissões não têm tenantId, usar findOneWithoutTenant
    return await this.findOneWithoutTenant({ where: { nome } });
  }
}
