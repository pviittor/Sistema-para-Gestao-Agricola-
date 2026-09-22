import { Injectable, Inject } from '../../core/di'
import { TYPES } from '../../core/di/types'
import { BaseRepository } from '../../core/repository/BaseRepository'
import { ICotacaoRepository } from './ICotacaoRepository'
import { ICacheService } from '../../core/cache/ICacheService'
import { ITenantService } from '../../core/tenant/ITenantService'
import Cotacao from '../../models/Cotacao'
import CotacaoItem from '../../models/CotacaoItem'
import Pessoa from '../../models/Pessoa'
import Produto from '../../models/Produto'
import ItemPedidoCompra from '../../models/ItemPedidoCompra'

/**
 * Repositorio para entidade Cotacao
 */
@Injectable()
export class CotacaoRepository extends BaseRepository<Cotacao> implements ICotacaoRepository {
  constructor(
    @Inject(TYPES.ICacheService) cacheService: ICacheService,
    @Inject(TYPES.ITenantService) tenantService: ITenantService
  ) {
    super(Cotacao, cacheService, tenantService)
  }

  async findByPedidoCompra(pedidoCompraId: number): Promise<Cotacao[]> {
    const where: any = { pedidoCompraId }
    const tenantFilter = this.getTenantFilter()
    if (tenantFilter?.tenantId) where.tenantId = tenantFilter.tenantId
    return this.model.findAll({
      where,
      include: [
        { model: Pessoa, as: 'fornecedor' },
      ],
      order: [['vl_total', 'ASC']],
    })
  }

  async findByFornecedor(fornecedorId: number): Promise<Cotacao[]> {
    const where: any = { fornecedorId }
    const tenantFilter = this.getTenantFilter()
    if (tenantFilter?.tenantId) where.tenantId = tenantFilter.tenantId
    return this.model.findAll({ where, order: [['id', 'DESC']] })
  }

  async findByPedidoCompraComItens(pedidoCompraId: number): Promise<Cotacao[]> {
    const where: any = { pedidoCompraId }
    const tenantFilter = this.getTenantFilter()
    if (tenantFilter?.tenantId) where.tenantId = tenantFilter.tenantId
    return this.model.findAll({
      where,
      include: [
        {
          model: CotacaoItem,
          as: 'itens',
          include: [
            { model: Produto, as: 'produto' },
            { model: ItemPedidoCompra, as: 'itemPedidoCompra' },
          ],
        },
        { model: Pessoa, as: 'fornecedor' },
      ],
      order: [['vl_total', 'ASC']],
    })
  }
}
