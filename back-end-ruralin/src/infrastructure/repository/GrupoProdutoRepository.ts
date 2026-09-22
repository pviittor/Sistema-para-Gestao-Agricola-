import { Injectable, Inject } from '../../core/di';
import { TYPES } from '../../core/di/types';
import { BaseRepository } from '../../core/repository/BaseRepository';
import { IGrupoProdutoRepository } from './IGrupoProdutoRepository';
import { ICacheService } from '../../core/cache/ICacheService';
import { ITenantService } from '../../core/tenant/ITenantService';
import GrupoProduto from '../../models/GrupoProduto';

/**
 * Repositório para entidade GrupoProduto
 * 
 * Estende BaseRepository para fornecer métodos CRUD padrão e adiciona
 * métodos específicos para busca de grupos de produto.
 */
@Injectable()
export class GrupoProdutoRepository extends BaseRepository<GrupoProduto> implements IGrupoProdutoRepository {
  /**
   * Construtor do repositório
   * 
   * Inicializa o BaseRepository com o modelo GrupoProduto, cacheService e tenantService.
   */
  constructor(
    @Inject(TYPES.ICacheService) cacheService: ICacheService,
    @Inject(TYPES.ITenantService) tenantService: ITenantService
  ) {
    super(GrupoProduto, cacheService, tenantService);
  }

  // TODO: Implementar métodos customizados se necessário
}
