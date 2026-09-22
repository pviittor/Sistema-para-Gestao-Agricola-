import { Op, fn, col } from 'sequelize';
import { Injectable, Inject } from '../../core/di';
import { TYPES } from '../../core/di/types';
import { BaseRepository } from '../../core/repository/BaseRepository';
import { IItemNotaFiscalRepository } from './IItemNotaFiscalRepository';
import { ICacheService } from '../../core/cache/ICacheService';
import { ITenantService } from '../../core/tenant/ITenantService';
import { PaginatedResult } from '../../core/repository/types';
import ItemNotaFiscal from '../../models/ItemNotaFiscal';
import NotaFiscal from '../../models/NotaFiscal';
import Produto from '../../models/Produto';
import Usuario from '../../models/Usuario';

/**
 * Repositorio para entidade ItemNotaFiscal
 *
 * Cache desabilitado conforme especificacao.
 */
@Injectable()
export class ItemNotaFiscalRepository extends BaseRepository<ItemNotaFiscal> implements IItemNotaFiscalRepository {
  constructor(
    @Inject(TYPES.ICacheService) cacheService: ICacheService,
    @Inject(TYPES.ITenantService) tenantService: ITenantService
  ) {
    super(ItemNotaFiscal, cacheService, tenantService);
  }

  /**
   * Busca um item por ID com todas as associacoes
   */
  async findById(id: number | string): Promise<ItemNotaFiscal | null> {
    const tenantFilter = this.getTenantFilter();
    if (!tenantFilter) {
      return null;
    }

    const where: any = { id_item_nf: id };
    if (tenantFilter.tenantId) {
      where.tenantId = tenantFilter.tenantId;
    }

    return await this.model.findOne({
      where,
      include: [
        {
          model: NotaFiscal,
          as: 'notaFiscal',
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
  async findAllPaginated(page: number = 1, limit: number = 10): Promise<PaginatedResult<ItemNotaFiscal>> {
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
      order: [['id_item_nf', 'DESC']],
      include: [
        {
          model: NotaFiscal,
          as: 'notaFiscal',
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
   * Lista todos os itens de uma nota fiscal
   */
  async findByNotaFiscal(notaFiscalId: number): Promise<ItemNotaFiscal[]> {
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
   * Busca historico de movimentacao de produto em notas fiscais
   */
  async findByProduto(produtoId: number, dataInicio?: string, dataFim?: string): Promise<ItemNotaFiscal[]> {
    const tenantFilter = this.getTenantFilter();
    if (!tenantFilter) {
      return [];
    }

    const where: any = { produtoId };
    if (tenantFilter.tenantId) {
      where.tenantId = tenantFilter.tenantId;
    }

    const includeWhere: any = {};
    if (dataInicio && dataFim) {
      includeWhere.data_emissao = { [Op.between]: [dataInicio, dataFim] };
    } else if (dataInicio) {
      includeWhere.data_emissao = { [Op.gte]: dataInicio };
    } else if (dataFim) {
      includeWhere.data_emissao = { [Op.lte]: dataFim };
    }

    return await this.model.findAll({
      where,
      order: [['id_item_nf', 'DESC']],
      include: [
        {
          model: NotaFiscal,
          as: 'notaFiscal',
          required: Object.keys(includeWhere).length > 0,
          where: Object.keys(includeWhere).length > 0 ? includeWhere : undefined,
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
   * Rastreabilidade por numero de lote
   */
  async findByLote(numeroLote: string, produtoId?: number): Promise<ItemNotaFiscal[]> {
    const tenantFilter = this.getTenantFilter();
    if (!tenantFilter) {
      return [];
    }

    const where: any = { numero_lote: numeroLote };
    if (tenantFilter.tenantId) {
      where.tenantId = tenantFilter.tenantId;
    }
    if (produtoId) {
      where.produtoId = produtoId;
    }

    return await this.model.findAll({
      where,
      order: [['id_item_nf', 'DESC']],
      include: [
        {
          model: NotaFiscal,
          as: 'notaFiscal',
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
   * Rastreabilidade por numero de serie
   */
  async findByNumeroSerie(numeroSerie: string): Promise<ItemNotaFiscal | null> {
    const tenantFilter = this.getTenantFilter();
    if (!tenantFilter) {
      return null;
    }

    const where: any = { numero_serie_item: numeroSerie };
    if (tenantFilter.tenantId) {
      where.tenantId = tenantFilter.tenantId;
    }

    return await this.model.findOne({
      where,
      include: [
        {
          model: NotaFiscal,
          as: 'notaFiscal',
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
   * Consolida quantidade e valor vendido por produto em um periodo
   */
  async totalVendidoPorProduto(produtoId: number, dataInicio: string, dataFim: string): Promise<{ qtd: number; vlTotal: number }> {
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
        [fn('SUM', col('quantidade')), 'totalQuantidade'],
        [fn('SUM', col('vl_total')), 'totalValor'],
      ],
      include: [
        {
          model: NotaFiscal,
          as: 'notaFiscal',
          required: true,
          attributes: [],
          where: {
            tipo: 'saida',
            data_emissao: { [Op.between]: [dataInicio, dataFim] },
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
   * Remove todos os itens de uma nota fiscal (usado no padrao delete-and-recreate)
   */
  async deleteByNotaFiscal(notaFiscalId: number): Promise<number> {
    const tenantFilter = this.getTenantFilter();
    const where: any = { notaFiscalId };
    if (tenantFilter?.tenantId) where.tenantId = tenantFilter.tenantId;
    return this.model.destroy({ where });
  }

  /**
   * Sobrescreve update para usar id_item_nf ao inves de id
   */
  async update(id: number | string, entity: Partial<ItemNotaFiscal>): Promise<ItemNotaFiscal> {
    const tenantFilter = this.getTenantFilter();
    if (!tenantFilter) {
      throw new Error('Tenant nao identificado. Nao e possivel atualizar entidade sem tenantId.');
    }

    const where: any = { id_item_nf: id };
    if (tenantFilter.tenantId) {
      where.tenantId = tenantFilter.tenantId;
    }

    const instance = await this.model.findOne({ where });

    if (!instance) {
      throw new Error('Item de nota fiscal nao encontrado');
    }

    const entityWithoutAudit = { ...entity };
    if ('tenantId' in entityWithoutAudit) {
      delete (entityWithoutAudit as any).tenantId;
    }
    if ('id_item_nf' in entityWithoutAudit) {
      delete (entityWithoutAudit as any).id_item_nf;
    }

    await instance.update(entityWithoutAudit);

    return instance;
  }

  /**
   * Sobrescreve delete para usar id_item_nf ao inves de id
   */
  async delete(id: number | string): Promise<boolean> {
    const tenantFilter = this.getTenantFilter();
    if (!tenantFilter) {
      throw new Error('Tenant nao identificado. Nao e possivel deletar entidade sem tenantId.');
    }

    const where: any = { id_item_nf: id };
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
