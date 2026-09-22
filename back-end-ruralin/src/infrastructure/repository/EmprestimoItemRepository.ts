import { Injectable, Inject } from '../../core/di';
import { TYPES } from '../../core/di/types';
import { BaseRepository } from '../../core/repository/BaseRepository';
import { IEmprestimoItemRepository } from './IEmprestimoItemRepository';
import { ICacheService } from '../../core/cache/ICacheService';
import { ITenantService } from '../../core/tenant/ITenantService';
import EmprestimoItem from '../../models/EmprestimoItem';
import Produto from '../../models/Produto';

/**
 * Repositório para entidade EmprestimoItem
 *
 * Estende BaseRepository para fornecer métodos CRUD padrão e adiciona
 * métodos específicos para busca de itens por empréstimo.
 *
 * Entidade NÃO multi-tenant — o tenant é herdado pelo empréstimo pai.
 */
@Injectable()
export class EmprestimoItemRepository
  extends BaseRepository<EmprestimoItem>
  implements IEmprestimoItemRepository
{
  constructor(
    @Inject(TYPES.ICacheService) cacheService: ICacheService,
    @Inject(TYPES.ITenantService) tenantService: ITenantService
  ) {
    super(EmprestimoItem, cacheService, tenantService);
  }

  /**
   * Desabilita filtro de tenant — tabela não possui tenantId.
   * Isolamento é garantido pelo empréstimo pai.
   */
  protected getTenantFilter(): { tenantId?: number; consultoriaId?: number } | null {
    return {};
  }

  /**
   * Busca todos os itens de um empréstimo
   *
   * @param emprestimoId - ID do empréstimo
   * @returns Promise que resolve com array de itens do empréstimo
   */
  async findByEmprestimo(emprestimoId: number): Promise<EmprestimoItem[]> {
    return await this.model.findAll({
      where: { emprestimoId },
      order: [['id', 'ASC']],
      include: [
        {
          model: Produto,
          as: 'produto',
          required: false,
        },
      ],
    });
  }

  /**
   * Remove todos os itens de um empréstimo
   *
   * Entidade NÃO multi-tenant — sem filtro de tenant (herdado pelo empréstimo pai).
   *
   * @param emprestimoId - ID do empréstimo
   * @returns Promise que resolve com o número de registros removidos
   */
  async deleteByEmprestimo(emprestimoId: number): Promise<number> {
    return this.model.destroy({ where: { emprestimoId } });
  }
}
