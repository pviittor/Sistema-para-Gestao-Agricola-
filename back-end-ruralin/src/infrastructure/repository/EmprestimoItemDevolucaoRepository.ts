import { fn, col } from 'sequelize';
import { Injectable, Inject } from '../../core/di';
import { TYPES } from '../../core/di/types';
import { BaseRepository } from '../../core/repository/BaseRepository';
import { IEmprestimoItemDevolucaoRepository } from './IEmprestimoItemDevolucaoRepository';
import { ICacheService } from '../../core/cache/ICacheService';
import { ITenantService } from '../../core/tenant/ITenantService';
import EmprestimoItemDevolucao from '../../models/EmprestimoItemDevolucao';
import Produto from '../../models/Produto';

/**
 * Repositório para entidade EmprestimoItemDevolucao
 *
 * Estende BaseRepository para fornecer métodos CRUD padrão e adiciona
 * métodos específicos para busca de devoluções por item e soma de quantidades.
 *
 * Entidade NÃO multi-tenant — o tenant é herdado pelo empréstimo pai.
 */
@Injectable()
export class EmprestimoItemDevolucaoRepository
  extends BaseRepository<EmprestimoItemDevolucao>
  implements IEmprestimoItemDevolucaoRepository
{
  constructor(
    @Inject(TYPES.ICacheService) cacheService: ICacheService,
    @Inject(TYPES.ITenantService) tenantService: ITenantService
  ) {
    super(EmprestimoItemDevolucao, cacheService, tenantService);
  }

  /**
   * Desabilita filtro de tenant — tabela não possui tenantId.
   * Isolamento é garantido pelo empréstimo pai.
   */
  protected getTenantFilter(): { tenantId?: number; consultoriaId?: number } | null {
    return {};
  }

  /**
   * Busca todas as devoluções de um item de empréstimo
   *
   * @param itemId - ID do item do empréstimo
   * @returns Promise que resolve com array de devoluções do item
   */
  async findByItem(itemId: number): Promise<EmprestimoItemDevolucao[]> {
    return await this.model.findAll({
      where: { itemDevolucaoId: itemId },
      order: [['datadevolucao_empdev', 'ASC']],
      include: [
        {
          model: Produto,
          as: 'produtoDevolucao',
          required: false,
        },
        {
          model: Produto,
          as: 'produtoSimilar',
          required: false,
        },
      ],
    });
  }

  /**
   * Soma a quantidade total devolvida de um item de empréstimo
   *
   * @param itemId - ID do item do empréstimo
   * @returns Promise que resolve com a soma da quantidade devolvida (0 se não houver devoluções)
   */
  async sumQuantidadeDevolvida(itemId: number): Promise<number> {
    const result = await this.model.findOne({
      where: { itemDevolucaoId: itemId },
      attributes: [
        [fn('SUM', col('quantidadedevolvida_empdev')), 'totalDevolvido'],
      ],
      raw: true,
    }) as any;

    return result?.totalDevolvido ? Number(result.totalDevolvido) : 0;
  }

  /**
   * Remove todas as devoluções de um item de empréstimo
   *
   * Entidade NÃO multi-tenant — sem filtro de tenant (herdado pelo empréstimo pai).
   *
   * @param itemDevolucaoId - ID do item do empréstimo
   * @returns Promise que resolve com o número de registros removidos
   */
  async deleteByItem(itemDevolucaoId: number): Promise<number> {
    return this.model.destroy({ where: { itemDevolucaoId } });
  }
}
