import { Op } from 'sequelize';
import { Injectable, Inject } from '../../core/di';
import { TYPES } from '../../core/di/types';
import { BaseRepository } from '../../core/repository/BaseRepository';
import { IBaixaPedidoCompraRepository } from './IBaixaPedidoCompraRepository';
import { ICacheService } from '../../core/cache/ICacheService';
import { ITenantService } from '../../core/tenant/ITenantService';
import { PaginatedResult } from '../../core/repository/types';
import BaixaPedidoCompra from '../../models/BaixaPedidoCompra';
import Pessoa from '../../models/Pessoa';
import NotaFiscal from '../../models/NotaFiscal';
import PedidoCompra from '../../models/PedidoCompra';
import Usuario from '../../models/Usuario';

/**
 * Repositorio para entidade BaixaPedidoCompra
 */
@Injectable()
export class BaixaPedidoCompraRepository extends BaseRepository<BaixaPedidoCompra> implements IBaixaPedidoCompraRepository {
  protected override readonly DEFAULT_CACHE_TTL = 120;

  constructor(
    @Inject(TYPES.ICacheService) cacheService: ICacheService,
    @Inject(TYPES.ITenantService) tenantService: ITenantService
  ) {
    super(BaixaPedidoCompra, cacheService, tenantService);
  }

  /**
   * Busca uma baixa por ID com todas as associacoes
   */
  async findById(id: number | string): Promise<BaixaPedidoCompra | null> {
    const tenantFilter = this.getTenantFilter();
    if (!tenantFilter) {
      return null;
    }

    const cacheKey = `baixaPedidoCompra:findById:${id}:${JSON.stringify(tenantFilter)}`;
    const cached = await this.cacheService.get<BaixaPedidoCompra>(cacheKey);
    if (cached !== null) {
      return cached;
    }

    const where: any = { id_baixa_ped: id };
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
          model: NotaFiscal,
          as: 'notaFiscal',
          required: false,
        },
        {
          model: PedidoCompra,
          as: 'pedidoCompra',
          required: false,
        },
        {
          model: Usuario,
          as: 'usuario',
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
   * Busca todas as baixas paginadas com associacoes
   */
  async findAllPaginated(page: number = 1, limit: number = 10): Promise<PaginatedResult<BaixaPedidoCompra>> {
    const offset = (page - 1) * limit;
    const tenantFilter = this.getTenantFilter();
    const cacheKey = `baixaPedidoCompra:list:${page}:${limit}:${JSON.stringify(tenantFilter)}`;

    const cached = await this.cacheService.get<PaginatedResult<BaixaPedidoCompra>>(cacheKey);
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
      order: [['data_baixa', 'DESC'], ['id_baixa_ped', 'DESC']],
      include: [
        {
          model: Pessoa,
          as: 'empresa',
          required: false,
        },
        {
          model: NotaFiscal,
          as: 'notaFiscal',
          required: false,
        },
        {
          model: PedidoCompra,
          as: 'pedidoCompra',
          required: false,
        },
        {
          model: Usuario,
          as: 'usuario',
          required: false,
        },
      ],
    });

    const result: PaginatedResult<BaixaPedidoCompra> = {
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
   * Busca baixas por nota fiscal
   */
  async findByNotaFiscal(notaFiscalId: number): Promise<BaixaPedidoCompra[]> {
    const tenantFilter = this.getTenantFilter();
    if (!tenantFilter) {
      return [];
    }

    const where: any = { notaFiscalId };
    if (tenantFilter.tenantId) {
      where.tenantId = tenantFilter.tenantId;
    }

    return await this.model.findAll({
      where,
      order: [['data_baixa', 'DESC'], ['id_baixa_ped', 'DESC']],
      include: [
        {
          model: Pessoa,
          as: 'empresa',
          required: false,
        },
        {
          model: PedidoCompra,
          as: 'pedidoCompra',
          required: false,
        },
        {
          model: Usuario,
          as: 'usuario',
          required: false,
        },
      ],
    });
  }

  /**
   * Busca baixas por pedido de compra
   */
  async findByPedidoCompra(pedidoCompraId: number): Promise<BaixaPedidoCompra[]> {
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
      order: [['data_baixa', 'DESC'], ['id_baixa_ped', 'DESC']],
      include: [
        {
          model: Pessoa,
          as: 'empresa',
          required: false,
        },
        {
          model: NotaFiscal,
          as: 'notaFiscal',
          required: false,
        },
        {
          model: Usuario,
          as: 'usuario',
          required: false,
        },
      ],
    });
  }

  /**
   * Busca baixas por fornecedor (empresa)
   */
  async findByFornecedor(fornecedorId: number): Promise<BaixaPedidoCompra[]> {
    const tenantFilter = this.getTenantFilter();
    if (!tenantFilter) {
      return [];
    }

    const where: any = { empresaId: fornecedorId };
    if (tenantFilter.tenantId) {
      where.tenantId = tenantFilter.tenantId;
    }

    return await this.model.findAll({
      where,
      order: [['data_baixa', 'DESC'], ['id_baixa_ped', 'DESC']],
      include: [
        {
          model: Pessoa,
          as: 'empresa',
          required: false,
        },
        {
          model: NotaFiscal,
          as: 'notaFiscal',
          required: false,
        },
        {
          model: PedidoCompra,
          as: 'pedidoCompra',
          required: false,
        },
      ],
    });
  }

  /**
   * Busca baixas pendentes
   */
  async findPendentes(): Promise<BaixaPedidoCompra[]> {
    const tenantFilter = this.getTenantFilter();
    if (!tenantFilter) {
      return [];
    }

    const where: any = { status: 'pendente', ativo: true };
    if (tenantFilter.tenantId) {
      where.tenantId = tenantFilter.tenantId;
    }

    return await this.model.findAll({
      where,
      order: [['data_baixa', 'ASC'], ['id_baixa_ped', 'ASC']],
      include: [
        {
          model: Pessoa,
          as: 'empresa',
          required: false,
        },
        {
          model: NotaFiscal,
          as: 'notaFiscal',
          required: false,
        },
        {
          model: PedidoCompra,
          as: 'pedidoCompra',
          required: false,
        },
        {
          model: Usuario,
          as: 'usuario',
          required: false,
        },
      ],
    });
  }

  /**
   * Busca baixas por periodo
   */
  async findByPeriodo(dataInicio: string, dataFim: string): Promise<BaixaPedidoCompra[]> {
    const tenantFilter = this.getTenantFilter();
    if (!tenantFilter) {
      return [];
    }

    const where: any = {
      data_baixa: {
        [Op.between]: [dataInicio, dataFim],
      },
    };
    if (tenantFilter.tenantId) {
      where.tenantId = tenantFilter.tenantId;
    }

    return await this.model.findAll({
      where,
      order: [['data_baixa', 'DESC'], ['id_baixa_ped', 'DESC']],
      include: [
        {
          model: Pessoa,
          as: 'empresa',
          required: false,
        },
        {
          model: NotaFiscal,
          as: 'notaFiscal',
          required: false,
        },
        {
          model: PedidoCompra,
          as: 'pedidoCompra',
          required: false,
        },
        {
          model: Usuario,
          as: 'usuario',
          required: false,
        },
      ],
    });
  }

  /**
   * Sobrescreve create para invalidar caches relevantes
   */
  async create(entity: Partial<BaixaPedidoCompra>): Promise<BaixaPedidoCompra> {
    const result = await super.create(entity);

    await this.cacheService.deleteByPattern('baixaPedidoCompra:list:*');
    await this.cacheService.deleteByPattern('baixaPedidoCompra:findByPeriodo:*');
    await this.cacheService.deleteByPattern('baixaPedidoCompra:findByNotaFiscal:*');
    await this.cacheService.deleteByPattern('baixaPedidoCompra:findByPedidoCompra:*');
    await this.cacheService.deleteByPattern('baixaPedidoCompra:findByFornecedor:*');

    return result;
  }

  /**
   * Sobrescreve update para usar id_baixa_ped ao inves de id
   */
  async update(id: number | string, entity: Partial<BaixaPedidoCompra>): Promise<BaixaPedidoCompra> {
    const tenantFilter = this.getTenantFilter();
    if (!tenantFilter) {
      throw new Error('Tenant nao identificado. Nao e possivel atualizar entidade sem tenantId.');
    }

    const where: any = { id_baixa_ped: id };
    if (tenantFilter.tenantId) {
      where.tenantId = tenantFilter.tenantId;
    }

    const instance = await this.model.findOne({ where });

    if (!instance) {
      throw new Error('Baixa de pedido de compra nao encontrada');
    }

    const entityWithoutAudit = { ...entity };
    if ('tenantId' in entityWithoutAudit) {
      delete (entityWithoutAudit as any).tenantId;
    }
    if ('id_baixa_ped' in entityWithoutAudit) {
      delete (entityWithoutAudit as any).id_baixa_ped;
    }

    await instance.update(entityWithoutAudit);

    await this.cacheService.deleteByPattern('baixaPedidoCompra:findById:*');
    await this.cacheService.deleteByPattern('baixaPedidoCompra:list:*');
    await this.cacheService.deleteByPattern('baixaPedidoCompra:findByPeriodo:*');
    await this.cacheService.deleteByPattern('baixaPedidoCompra:findByNotaFiscal:*');
    await this.cacheService.deleteByPattern('baixaPedidoCompra:findByPedidoCompra:*');
    await this.cacheService.deleteByPattern('baixaPedidoCompra:findByFornecedor:*');

    return instance;
  }

  /**
   * Sobrescreve delete para usar id_baixa_ped ao inves de id
   */
  async delete(id: number | string): Promise<boolean> {
    const tenantFilter = this.getTenantFilter();
    if (!tenantFilter) {
      throw new Error('Tenant nao identificado. Nao e possivel deletar entidade sem tenantId.');
    }

    const where: any = { id_baixa_ped: id };
    if (tenantFilter.tenantId) {
      where.tenantId = tenantFilter.tenantId;
    }

    const instance = await this.model.findOne({ where });

    if (!instance) {
      return false;
    }

    await instance.destroy();

    await this.cacheService.deleteByPattern('baixaPedidoCompra:findById:*');
    await this.cacheService.deleteByPattern('baixaPedidoCompra:list:*');
    await this.cacheService.deleteByPattern('baixaPedidoCompra:findByPeriodo:*');
    await this.cacheService.deleteByPattern('baixaPedidoCompra:findByNotaFiscal:*');
    await this.cacheService.deleteByPattern('baixaPedidoCompra:findByPedidoCompra:*');
    await this.cacheService.deleteByPattern('baixaPedidoCompra:findByFornecedor:*');

    return true;
  }
}
