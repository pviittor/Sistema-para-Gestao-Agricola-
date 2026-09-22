import { Op, fn, col } from 'sequelize';
import { Injectable, Inject } from '../../core/di';
import { TYPES } from '../../core/di/types';
import { BaseRepository } from '../../core/repository/BaseRepository';
import { IPedidoCompraRepository } from './IPedidoCompraRepository';
import { ICacheService } from '../../core/cache/ICacheService';
import { ITenantService } from '../../core/tenant/ITenantService';
import { PaginatedResult } from '../../core/repository/types';
import PedidoCompra from '../../models/PedidoCompra';
import Pessoa from '../../models/Pessoa';
import Usuario from '../../models/Usuario';
import ItemPedidoCompra from '../../models/ItemPedidoCompra';
import Produto from '../../models/Produto';

/**
 * Repositorio para entidade PedidoCompra
 */
@Injectable()
export class PedidoCompraRepository extends BaseRepository<PedidoCompra> implements IPedidoCompraRepository {
  protected override readonly DEFAULT_CACHE_TTL = 300;

  constructor(
    @Inject(TYPES.ICacheService) cacheService: ICacheService,
    @Inject(TYPES.ITenantService) tenantService: ITenantService
  ) {
    super(PedidoCompra, cacheService, tenantService);
  }

  /**
   * Busca um pedido de compra por ID com todas as associacoes
   */
  async findById(id: number | string): Promise<PedidoCompra | null> {
    const tenantFilter = this.getTenantFilter();
    if (!tenantFilter) {
      return null;
    }

    const cacheKey = `pedidoCompra:findById:${id}:${JSON.stringify(tenantFilter)}`;
    const cached = await this.cacheService.get<PedidoCompra>(cacheKey);
    if (cached !== null) {
      return cached;
    }

    const where: any = { id_ped_compra: id };
    if (tenantFilter.tenantId) {
      where.tenantId = tenantFilter.tenantId;
    }

    const result = await this.model.findOne({
      where,
      include: [
        {
          model: Pessoa,
          as: 'empresa',
          required: false,
        },
        {
          model: Pessoa,
          as: 'fornecedor',
          required: false,
        },
        {
          model: Usuario,
          as: 'comprador',
          required: false,
        },
        {
          model: Usuario,
          as: 'aprovador',
          required: false,
        },
        {
          model: Usuario,
          as: 'usuarioCriador',
          required: false,
        },
      ],
    });

    if (result) {
      await this.cacheService.set(cacheKey, result, this.DEFAULT_CACHE_TTL);
    }

    return result;
  }

  /**
   * Busca pedido de compra por ID incluindo itens e produto de cada item
   */
  async findByIdWithDetails(id: number): Promise<PedidoCompra | null> {
    const tenantFilter = this.getTenantFilter();
    const where: any = { id_ped_compra: id };
    if (tenantFilter?.tenantId) where.tenantId = tenantFilter.tenantId;

    return this.model.findOne({
      where,
      include: [
        { model: Pessoa, as: 'empresa', required: false },
        { model: Pessoa, as: 'fornecedor', required: false },
        { model: Usuario, as: 'comprador', required: false },
        { model: Usuario, as: 'aprovador', required: false },
        { model: Usuario, as: 'usuarioCriador', required: false },
        {
          model: ItemPedidoCompra,
          as: 'itens',
          required: false,
          include: [
            { model: Produto, as: 'produto', required: false },
          ],
        },
      ],
      order: [[{ model: ItemPedidoCompra, as: 'itens' }, 'numero_item', 'ASC']],
    });
  }

  /**
   * Busca todos os pedidos de compra paginados com associacoes resumidas
   */
  async findAllPaginated(page: number = 1, limit: number = 10): Promise<PaginatedResult<PedidoCompra>> {
    const offset = (page - 1) * limit;
    const tenantFilter = this.getTenantFilter();
    const cacheKey = `pedidoCompra:list:${page}:${limit}:${JSON.stringify(tenantFilter)}`;

    const cached = await this.cacheService.get<PaginatedResult<PedidoCompra>>(cacheKey);
    if (cached !== null) {
      return cached;
    }

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
      order: [['data_emissao', 'DESC'], ['id_ped_compra', 'DESC']],
      include: [
        {
          model: Pessoa,
          as: 'empresa',
          required: false,
        },
        {
          model: Pessoa,
          as: 'fornecedor',
          required: false,
        },
        {
          model: Usuario,
          as: 'comprador',
          required: false,
        },
      ],
    });

    const result: PaginatedResult<PedidoCompra> = {
      data: rows,
      page,
      limit,
      total: count,
      totalPages: Math.ceil(count / limit),
    };

    await this.cacheService.set(cacheKey, result, this.DEFAULT_CACHE_TTL);
    return result;
  }

  /**
   * Busca pedidos de compra por fornecedor
   */
  async findByFornecedor(fornecedorId: number, status?: string): Promise<PedidoCompra[]> {
    const tenantFilter = this.getTenantFilter();
    if (!tenantFilter) {
      return [];
    }

    const where: any = { fornecedorId };
    if (tenantFilter.tenantId) {
      where.tenantId = tenantFilter.tenantId;
    }
    if (status) {
      where.status = status;
    }

    return await this.model.findAll({
      where,
      order: [['data_emissao', 'DESC'], ['id_ped_compra', 'DESC']],
      include: [
        {
          model: Pessoa,
          as: 'empresa',
          required: false,
        },
        {
          model: Pessoa,
          as: 'fornecedor',
          required: false,
        },
      ],
    });
  }

  /**
   * Lista pedidos de compra por periodo de emissao
   */
  async findByPeriodo(dataInicio: string, dataFim: string, status?: string): Promise<PedidoCompra[]> {
    const tenantFilter = this.getTenantFilter();
    if (!tenantFilter) {
      return [];
    }

    const where: any = {
      data_emissao: {
        [Op.between]: [dataInicio, dataFim],
      },
    };
    if (tenantFilter.tenantId) {
      where.tenantId = tenantFilter.tenantId;
    }
    if (status) {
      where.status = status;
    }

    return await this.model.findAll({
      where,
      order: [['data_emissao', 'DESC'], ['id_ped_compra', 'DESC']],
      include: [
        {
          model: Pessoa,
          as: 'empresa',
          required: false,
        },
        {
          model: Pessoa,
          as: 'fornecedor',
          required: false,
        },
      ],
    });
  }

  /**
   * Busca pedidos pendentes de entrega
   */
  async findPendentesEntrega(dataPrevisaoAte?: string): Promise<PedidoCompra[]> {
    const tenantFilter = this.getTenantFilter();
    if (!tenantFilter) {
      return [];
    }

    const where: any = {
      status: {
        [Op.in]: ['aprovado', 'parcialmente_atendido'],
      },
      ativo: true,
    };
    if (tenantFilter.tenantId) {
      where.tenantId = tenantFilter.tenantId;
    }
    if (dataPrevisaoAte) {
      where.data_previsao_entrega = {
        [Op.lte]: dataPrevisaoAte,
      };
    }

    return await this.model.findAll({
      where,
      order: [['data_previsao_entrega', 'ASC'], ['id_ped_compra', 'ASC']],
      include: [
        {
          model: Pessoa,
          as: 'empresa',
          required: false,
        },
        {
          model: Pessoa,
          as: 'fornecedor',
          required: false,
        },
      ],
    });
  }

  /**
   * Busca pedido de compra por numero e empresa
   */
  async findByNumero(numero: string, empresaId: number): Promise<PedidoCompra | null> {
    const tenantFilter = this.getTenantFilter();
    if (!tenantFilter) {
      return null;
    }

    const where: any = { numero, empresaId };
    if (tenantFilter.tenantId) {
      where.tenantId = tenantFilter.tenantId;
    }

    return await this.model.findOne({
      where,
      include: [
        {
          model: Pessoa,
          as: 'empresa',
          required: false,
        },
        {
          model: Pessoa,
          as: 'fornecedor',
          required: false,
        },
      ],
    });
  }

  /**
   * Soma de totais agrupados por fornecedor em um periodo
   */
  async totalPorPeriodo(dataInicio: string, dataFim: string): Promise<{ fornecedorId: number; total: number; qtd: number }[]> {
    const tenantFilter = this.getTenantFilter();
    if (!tenantFilter) {
      return [];
    }

    const where: any = {
      data_emissao: {
        [Op.between]: [dataInicio, dataFim],
      },
      ativo: true,
    };
    if (tenantFilter.tenantId) {
      where.tenantId = tenantFilter.tenantId;
    }

    const results = await this.model.findAll({
      where,
      attributes: [
        'fornecedorId',
        [fn('SUM', col('vl_total')), 'total'],
        [fn('COUNT', col('id_ped_compra')), 'qtd'],
      ],
      group: ['fornecedorId'],
      raw: true,
    }) as any[];

    return results.map((r: any) => ({
      fornecedorId: r.fornecedorId,
      total: r.total ? Number(r.total) : 0,
      qtd: r.qtd ? Number(r.qtd) : 0,
    }));
  }

  /**
   * Sobrescreve create para invalidar caches relevantes
   */
  async create(entity: Partial<PedidoCompra>): Promise<PedidoCompra> {
    const result = await super.create(entity);

    await this.cacheService.deleteByPattern('pedidoCompra:list:*');
    await this.cacheService.deleteByPattern('pedidoCompra:findByPeriodo:*');
    await this.cacheService.deleteByPattern('pedidoCompra:findByFornecedor:*');

    return result;
  }

  /**
   * Sobrescreve update para usar id_ped_compra ao inves de id
   */
  async update(id: number | string, entity: Partial<PedidoCompra>): Promise<PedidoCompra> {
    const tenantFilter = this.getTenantFilter();
    if (!tenantFilter) {
      throw new Error('Tenant nao identificado. Nao e possivel atualizar entidade sem tenantId.');
    }

    const where: any = { id_ped_compra: id };
    if (tenantFilter.tenantId) {
      where.tenantId = tenantFilter.tenantId;
    }

    const instance = await this.model.findOne({ where });

    if (!instance) {
      throw new Error('Pedido de compra nao encontrado');
    }

    const entityWithoutAudit = { ...entity };
    if ('tenantId' in entityWithoutAudit) {
      delete (entityWithoutAudit as any).tenantId;
    }
    if ('id_ped_compra' in entityWithoutAudit) {
      delete (entityWithoutAudit as any).id_ped_compra;
    }

    await instance.update(entityWithoutAudit);

    await this.cacheService.deleteByPattern('pedidoCompra:findById:*');
    await this.cacheService.deleteByPattern('pedidoCompra:list:*');
    await this.cacheService.deleteByPattern('pedidoCompra:findByPeriodo:*');
    await this.cacheService.deleteByPattern('pedidoCompra:findByFornecedor:*');

    return instance;
  }

  /**
   * Sobrescreve delete para usar id_ped_compra ao inves de id
   */
  async delete(id: number | string): Promise<boolean> {
    const tenantFilter = this.getTenantFilter();
    if (!tenantFilter) {
      throw new Error('Tenant nao identificado. Nao e possivel deletar entidade sem tenantId.');
    }

    const where: any = { id_ped_compra: id };
    if (tenantFilter.tenantId) {
      where.tenantId = tenantFilter.tenantId;
    }

    const instance = await this.model.findOne({ where });

    if (!instance) {
      return false;
    }

    await instance.destroy();

    await this.cacheService.deleteByPattern('pedidoCompra:findById:*');
    await this.cacheService.deleteByPattern('pedidoCompra:list:*');
    await this.cacheService.deleteByPattern('pedidoCompra:findByPeriodo:*');
    await this.cacheService.deleteByPattern('pedidoCompra:findByFornecedor:*');

    return true;
  }
}
