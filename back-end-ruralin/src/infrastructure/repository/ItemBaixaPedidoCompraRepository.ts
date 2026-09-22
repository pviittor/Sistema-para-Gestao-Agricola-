import { fn, col } from 'sequelize';
import { Injectable, Inject } from '../../core/di';
import { TYPES } from '../../core/di/types';
import { BaseRepository } from '../../core/repository/BaseRepository';
import { IItemBaixaPedidoCompraRepository } from './IItemBaixaPedidoCompraRepository';
import { ICacheService } from '../../core/cache/ICacheService';
import { ITenantService } from '../../core/tenant/ITenantService';
import { PaginatedResult } from '../../core/repository/types';
import ItemBaixaPedidoCompra from '../../models/ItemBaixaPedidoCompra';
import BaixaPedidoCompra from '../../models/BaixaPedidoCompra';
import ItemPedidoCompra from '../../models/ItemPedidoCompra';
import ItemNotaFiscal from '../../models/ItemNotaFiscal';
import Usuario from '../../models/Usuario';

/**
 * Repositorio para entidade ItemBaixaPedidoCompra
 *
 * Cache desabilitado conforme especificacao.
 */
@Injectable()
export class ItemBaixaPedidoCompraRepository extends BaseRepository<ItemBaixaPedidoCompra> implements IItemBaixaPedidoCompraRepository {
  constructor(
    @Inject(TYPES.ICacheService) cacheService: ICacheService,
    @Inject(TYPES.ITenantService) tenantService: ITenantService
  ) {
    super(ItemBaixaPedidoCompra, cacheService, tenantService);
  }

  /**
   * Busca um item por ID com todas as associacoes
   */
  async findById(id: number | string): Promise<ItemBaixaPedidoCompra | null> {
    const tenantFilter = this.getTenantFilter();
    if (!tenantFilter) {
      return null;
    }

    const where: any = { id_item_baixa_ped: id };
    if (tenantFilter.tenantId) {
      where.tenantId = tenantFilter.tenantId;
    }

    return await this.model.findOne({
      where,
      include: [
        {
          model: BaixaPedidoCompra,
          as: 'baixaPedidoCompra',
          required: false,
        },
        {
          model: ItemPedidoCompra,
          as: 'itemPedidoCompra',
          required: false,
        },
        {
          model: ItemNotaFiscal,
          as: 'itemNotaFiscal',
          required: false,
        },
        {
          model: Usuario,
          as: 'usuarioCriador',
          required: false,
        },
      ],
    });
  }

  /**
   * Busca todos os itens paginados com associacoes
   */
  async findAllPaginated(page: number = 1, limit: number = 10): Promise<PaginatedResult<ItemBaixaPedidoCompra>> {
    const offset = (page - 1) * limit;
    const tenantFilter = this.getTenantFilter();

    const where: any = {};
    if (tenantFilter) {
      if (tenantFilter.tenantId) {
        where.tenantId = tenantFilter.tenantId;
      }
    }

    const { count, rows } = await this.model.findAndCountAll({
      where,
      limit,
      offset,
      order: [['id_item_baixa_ped', 'DESC']],
      include: [
        {
          model: BaixaPedidoCompra,
          as: 'baixaPedidoCompra',
          required: false,
        },
        {
          model: ItemPedidoCompra,
          as: 'itemPedidoCompra',
          required: false,
        },
        {
          model: ItemNotaFiscal,
          as: 'itemNotaFiscal',
          required: false,
        },
      ],
    });

    return {
      data: rows,
      page,
      limit,
      total: count,
      totalPages: Math.ceil(count / limit),
    };
  }

  /**
   * Busca itens por baixa de pedido de compra
   */
  async findByBaixa(baixaPedidoCompraId: number): Promise<ItemBaixaPedidoCompra[]> {
    const tenantFilter = this.getTenantFilter();
    if (!tenantFilter) {
      return [];
    }

    const where: any = { baixaPedidoCompraId };
    if (tenantFilter.tenantId) {
      where.tenantId = tenantFilter.tenantId;
    }

    return await this.model.findAll({
      where,
      order: [['id_item_baixa_ped', 'ASC']],
      include: [
        {
          model: ItemPedidoCompra,
          as: 'itemPedidoCompra',
          required: false,
        },
        {
          model: ItemNotaFiscal,
          as: 'itemNotaFiscal',
          required: false,
        },
      ],
    });
  }

  /**
   * Busca itens por item de pedido de compra
   */
  async findByItemPedido(itemPedidoCompraId: number): Promise<ItemBaixaPedidoCompra[]> {
    const tenantFilter = this.getTenantFilter();
    if (!tenantFilter) {
      return [];
    }

    const where: any = { itemPedidoCompraId };
    if (tenantFilter.tenantId) {
      where.tenantId = tenantFilter.tenantId;
    }

    return await this.model.findAll({
      where,
      order: [['id_item_baixa_ped', 'DESC']],
      include: [
        {
          model: BaixaPedidoCompra,
          as: 'baixaPedidoCompra',
          required: false,
        },
        {
          model: ItemNotaFiscal,
          as: 'itemNotaFiscal',
          required: false,
        },
      ],
    });
  }

  /**
   * Totaliza quantidade e valor baixado por item de pedido
   */
  async totalBaixadoPorItemPedido(itemPedidoCompraId: number): Promise<{ qtd: number; vlTotal: number }> {
    const tenantFilter = this.getTenantFilter();
    if (!tenantFilter) {
      return { qtd: 0, vlTotal: 0 };
    }

    const where: any = { itemPedidoCompraId };
    if (tenantFilter.tenantId) {
      where.tenantId = tenantFilter.tenantId;
    }

    const result = await this.model.findOne({
      where,
      attributes: [
        [fn('SUM', col('quantidade')), 'totalQuantidade'],
        [fn('SUM', col('vl_unitario_nf')), 'totalValor'],
      ],
      raw: true,
    }) as any;

    return {
      qtd: result?.totalQuantidade ? Number(result.totalQuantidade) : 0,
      vlTotal: result?.totalValor ? Number(result.totalValor) : 0,
    };
  }

  /**
   * Sobrescreve update para usar id_item_baixa_ped ao inves de id
   */
  async update(id: number | string, entity: Partial<ItemBaixaPedidoCompra>): Promise<ItemBaixaPedidoCompra> {
    const tenantFilter = this.getTenantFilter();
    if (!tenantFilter) {
      throw new Error('Tenant nao identificado. Nao e possivel atualizar entidade sem tenantId.');
    }

    const where: any = { id_item_baixa_ped: id };
    if (tenantFilter.tenantId) {
      where.tenantId = tenantFilter.tenantId;
    }

    const instance = await this.model.findOne({ where });

    if (!instance) {
      throw new Error('Item de baixa de pedido de compra nao encontrado');
    }

    const entityWithoutAudit = { ...entity };
    if ('tenantId' in entityWithoutAudit) {
      delete (entityWithoutAudit as any).tenantId;
    }
    if ('id_item_baixa_ped' in entityWithoutAudit) {
      delete (entityWithoutAudit as any).id_item_baixa_ped;
    }

    await instance.update(entityWithoutAudit);

    return instance;
  }

  /**
   * Sobrescreve delete para usar id_item_baixa_ped ao inves de id
   */
  async delete(id: number | string): Promise<boolean> {
    const tenantFilter = this.getTenantFilter();
    if (!tenantFilter) {
      throw new Error('Tenant nao identificado. Nao e possivel deletar entidade sem tenantId.');
    }

    const where: any = { id_item_baixa_ped: id };
    if (tenantFilter.tenantId) {
      where.tenantId = tenantFilter.tenantId;
    }

    const instance = await this.model.findOne({ where });

    if (!instance) {
      return false;
    }

    await instance.destroy();

    return true;
  }
}
