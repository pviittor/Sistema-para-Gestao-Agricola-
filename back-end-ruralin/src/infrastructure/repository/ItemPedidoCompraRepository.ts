import { Op, fn, col } from 'sequelize';
import { Injectable, Inject } from '../../core/di';
import { TYPES } from '../../core/di/types';
import { BaseRepository } from '../../core/repository/BaseRepository';
import { IItemPedidoCompraRepository } from './IItemPedidoCompraRepository';
import { ICacheService } from '../../core/cache/ICacheService';
import { ITenantService } from '../../core/tenant/ITenantService';
import { PaginatedResult } from '../../core/repository/types';
import ItemPedidoCompra from '../../models/ItemPedidoCompra';
import PedidoCompra from '../../models/PedidoCompra';
import Produto from '../../models/Produto';
import Usuario from '../../models/Usuario';

/**
 * Repositorio para entidade ItemPedidoCompra
 *
 * Cache desabilitado conforme especificacao.
 */
@Injectable()
export class ItemPedidoCompraRepository extends BaseRepository<ItemPedidoCompra> implements IItemPedidoCompraRepository {
  constructor(
    @Inject(TYPES.ICacheService) cacheService: ICacheService,
    @Inject(TYPES.ITenantService) tenantService: ITenantService
  ) {
    super(ItemPedidoCompra, cacheService, tenantService);
  }

  /**
   * Busca um item por ID com todas as associacoes
   */
  async findById(id: number | string): Promise<ItemPedidoCompra | null> {
    const tenantFilter = this.getTenantFilter();
    if (!tenantFilter) {
      return null;
    }

    const where: any = { id_item_ped: id };
    if (tenantFilter.tenantId) {
      where.tenantId = tenantFilter.tenantId;
    }

    return await this.model.findOne({
      where,
      include: [
        {
          model: PedidoCompra,
          as: 'pedidoCompra',
          required: false,
        },
        {
          model: Produto,
          as: 'produto',
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
  async findAllPaginated(page: number = 1, limit: number = 10): Promise<PaginatedResult<ItemPedidoCompra>> {
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
      order: [['id_item_ped', 'DESC']],
      include: [
        {
          model: PedidoCompra,
          as: 'pedidoCompra',
          required: false,
        },
        {
          model: Produto,
          as: 'produto',
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
   * Lista todos os itens de um pedido de compra
   */
  async findByPedidoCompra(pedidoCompraId: number): Promise<ItemPedidoCompra[]> {
    const tenantFilter = this.getTenantFilter();
    if (!tenantFilter) {
      return [];
    }

    const where: any = { pedidoCompraId };
    if (tenantFilter.tenantId) {
      where.tenantId = tenantFilter.tenantId;
    }

    return await this.model.findAll({
      where,
      order: [['numero_item', 'ASC']],
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
   * Lista itens pendentes de um pedido de compra
   */
  async findPendentesByPedido(pedidoCompraId: number): Promise<ItemPedidoCompra[]> {
    const tenantFilter = this.getTenantFilter();
    if (!tenantFilter) {
      return [];
    }

    const where: any = {
      pedidoCompraId,
      status: {
        [Op.in]: ['pendente', 'parcialmente_atendido'],
      },
    };
    if (tenantFilter.tenantId) {
      where.tenantId = tenantFilter.tenantId;
    }

    return await this.model.findAll({
      where,
      order: [['numero_item', 'ASC']],
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
   * Busca itens por produto
   */
  async findByProduto(produtoId: number): Promise<ItemPedidoCompra[]> {
    const tenantFilter = this.getTenantFilter();
    if (!tenantFilter) {
      return [];
    }

    const where: any = { produtoId };
    if (tenantFilter.tenantId) {
      where.tenantId = tenantFilter.tenantId;
    }

    return await this.model.findAll({
      where,
      order: [['id_item_ped', 'DESC']],
      include: [
        {
          model: PedidoCompra,
          as: 'pedidoCompra',
          required: false,
        },
        {
          model: Produto,
          as: 'produto',
          required: false,
        },
      ],
    });
  }

  /**
   * Consolida quantidade e valor comprado por produto em um periodo
   */
  async totalCompradoPorProduto(produtoId: number, dataInicio: string, dataFim: string): Promise<{ qtd: number; vlTotal: number }> {
    const tenantFilter = this.getTenantFilter();
    if (!tenantFilter) {
      return { qtd: 0, vlTotal: 0 };
    }

    const where: any = { produtoId };
    if (tenantFilter.tenantId) {
      where.tenantId = tenantFilter.tenantId;
    }

    const result = await this.model.findOne({
      where,
      attributes: [
        [fn('SUM', col('quantidade_solicitada')), 'totalQuantidade'],
        [fn('SUM', col('vl_total')), 'totalValor'],
      ],
      include: [
        {
          model: PedidoCompra,
          as: 'pedidoCompra',
          required: true,
          attributes: [],
          where: {
            data_emissao: { [Op.between]: [dataInicio, dataFim] },
            ativo: true,
          },
        },
      ],
      raw: true,
    }) as any;

    return {
      qtd: result?.totalQuantidade ? Number(result.totalQuantidade) : 0,
      vlTotal: result?.totalValor ? Number(result.totalValor) : 0,
    };
  }

  /**
   * Remove todos os itens de um pedido de compra
   */
  async deleteByPedidoCompra(pedidoCompraId: number): Promise<number> {
    const tenantFilter = this.getTenantFilter();
    const where: any = { pedidoCompraId };
    if (tenantFilter?.tenantId) where.tenantId = tenantFilter.tenantId;
    return this.model.destroy({ where });
  }

  /**
   * Sobrescreve update para usar id_item_ped ao inves de id
   */
  async update(id: number | string, entity: Partial<ItemPedidoCompra>): Promise<ItemPedidoCompra> {
    const tenantFilter = this.getTenantFilter();
    if (!tenantFilter) {
      throw new Error('Tenant nao identificado. Nao e possivel atualizar entidade sem tenantId.');
    }

    const where: any = { id_item_ped: id };
    if (tenantFilter.tenantId) {
      where.tenantId = tenantFilter.tenantId;
    }

    const instance = await this.model.findOne({ where });

    if (!instance) {
      throw new Error('Item de pedido de compra nao encontrado');
    }

    const entityWithoutAudit = { ...entity };
    if ('tenantId' in entityWithoutAudit) {
      delete (entityWithoutAudit as any).tenantId;
    }
    if ('id_item_ped' in entityWithoutAudit) {
      delete (entityWithoutAudit as any).id_item_ped;
    }

    await instance.update(entityWithoutAudit);

    return instance;
  }

  /**
   * Sobrescreve delete para usar id_item_ped ao inves de id
   */
  async delete(id: number | string): Promise<boolean> {
    const tenantFilter = this.getTenantFilter();
    if (!tenantFilter) {
      throw new Error('Tenant nao identificado. Nao e possivel deletar entidade sem tenantId.');
    }

    const where: any = { id_item_ped: id };
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
