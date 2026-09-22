import { Op, fn, col } from 'sequelize';
import { Injectable, Inject } from '../../core/di';
import { TYPES } from '../../core/di/types';
import { BaseRepository } from '../../core/repository/BaseRepository';
import { IMovimentoEstoqueRepository } from './IMovimentoEstoqueRepository';
import { ICacheService } from '../../core/cache/ICacheService';
import { ITenantService } from '../../core/tenant/ITenantService';
import { PaginatedResult } from '../../core/repository/types';
import { OperacaoEstoque } from '../../models/enums/MovimentoEstoqueEnums';
import MovimentoEstoque from '../../models/MovimentoEstoque';
import Produto from '../../models/Produto';
import Pessoa from '../../models/Pessoa';
import Fazenda from '../../models/Fazenda';
import Abastecimento from '../../models/Abastecimento';
import Usuario from '../../models/Usuario';

/**
 * Repositório para entidade MovimentoEstoque
 */
@Injectable()
export class MovimentoEstoqueRepository extends BaseRepository<MovimentoEstoque> implements IMovimentoEstoqueRepository {
  constructor(
    @Inject(TYPES.ICacheService) cacheService: ICacheService,
    @Inject(TYPES.ITenantService) tenantService: ITenantService
  ) {
    super(MovimentoEstoque, cacheService, tenantService);
  }

  /**
   * Busca um movimento por ID com todas as associações
   */
  async findById(id: number | string): Promise<MovimentoEstoque | null> {
    const tenantFilter = this.getTenantFilter();
    if (!tenantFilter) {
      return null;
    }

    const cacheKey = `movimentoEstoque:findById:${id}:${JSON.stringify(tenantFilter)}`;
    const cached = await this.cacheService.get<MovimentoEstoque>(cacheKey);
    if (cached !== null) {
      return cached;
    }

    const where: any = { id_mov: id };
    if (tenantFilter.tenantId) {
      where.tenantId = tenantFilter.tenantId;
    }

    const result = await this.model.findOne({
      where,
      include: [
        {
          model: Produto,
          as: 'produto',
          required: false,
        },
        {
          model: Pessoa,
          as: 'produtor',
          required: false,
        },
        {
          model: Fazenda,
          as: 'fazenda',
          required: false,
        },
        {
          model: Abastecimento,
          as: 'abastecimento',
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
   * Busca todos os movimentos paginados com associações resumidas
   */
  async findAllPaginated(page: number = 1, limit: number = 10): Promise<PaginatedResult<MovimentoEstoque>> {
    const offset = (page - 1) * limit;
    const tenantFilter = this.getTenantFilter();
    const cacheKey = `movimentoEstoque:list:${page}:${limit}:${JSON.stringify(tenantFilter)}`;

    const cached = await this.cacheService.get<PaginatedResult<MovimentoEstoque>>(cacheKey);
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
      order: [['data', 'DESC'], ['id_mov', 'DESC']],
      include: [
        {
          model: Produto,
          as: 'produto',
          required: false,
        },
        {
          model: Fazenda,
          as: 'fazenda',
          required: false,
        },
      ],
    });

    const result: PaginatedResult<MovimentoEstoque> = {
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
   * Retorna o saldo (SUM quantidade) filtrado por produto, fazenda, data e operação
   */
  async retornaSaldoPorOperacao(idProduto: number, idFazenda: number, data: string, operacao: OperacaoEstoque): Promise<number> {
    const tenantFilter = this.getTenantFilter();
    if (!tenantFilter) {
      return 0;
    }

    const where: any = {
      idProduto,
      idFazenda,
      operacao,
      data: { [Op.lte]: data },
    };
    if (tenantFilter.tenantId) {
      where.tenantId = tenantFilter.tenantId;
    }

    const result = await this.model.findOne({
      where,
      attributes: [[fn('SUM', col('quantidade')), 'totalQuantidade']],
      raw: true,
    }) as any;

    return result?.totalQuantidade ? Number(result.totalQuantidade) : 0;
  }

  /**
   * Retorna o saldo filtrado por produto, fazenda, data, operação e produtor
   */
  async retornaSaldoPorOperacaoProdutor(idProduto: number, idFazenda: number, data: string, operacao: OperacaoEstoque, idProdutor: number): Promise<number> {
    const tenantFilter = this.getTenantFilter();
    if (!tenantFilter) {
      return 0;
    }

    const where: any = {
      idProduto,
      idFazenda,
      operacao,
      idProdutor,
      data: { [Op.lte]: data },
    };
    if (tenantFilter.tenantId) {
      where.tenantId = tenantFilter.tenantId;
    }

    const result = await this.model.findOne({
      where,
      attributes: [[fn('SUM', col('quantidade')), 'totalQuantidade']],
      raw: true,
    }) as any;

    return result?.totalQuantidade ? Number(result.totalQuantidade) : 0;
  }

  /**
   * Retorna o saldo DISPONÍVEL para o produtor informado
   */
  async retornaSaldoProdutor(idProduto: number, idFazenda: number, idProdutor: number): Promise<number> {
    const tenantFilter = this.getTenantFilter();
    if (!tenantFilter) {
      return 0;
    }

    const where: any = {
      idProduto,
      idFazenda,
      idProdutor,
      operacao: OperacaoEstoque.DISPONIVEL,
    };
    if (tenantFilter.tenantId) {
      where.tenantId = tenantFilter.tenantId;
    }

    const result = await this.model.findOne({
      where,
      attributes: [[fn('SUM', col('quantidade')), 'totalQuantidade']],
      raw: true,
    }) as any;

    return result?.totalQuantidade ? Number(result.totalQuantidade) : 0;
  }

  /**
   * Retorna o saldo geral DISPONÍVEL do produto na fazenda
   */
  async getSaldoProdutoEstoque(idProduto: number, idFazenda: number): Promise<number> {
    const tenantFilter = this.getTenantFilter();
    if (!tenantFilter) {
      return 0;
    }

    const where: any = {
      idProduto,
      idFazenda,
      operacao: OperacaoEstoque.DISPONIVEL,
    };
    if (tenantFilter.tenantId) {
      where.tenantId = tenantFilter.tenantId;
    }

    const result = await this.model.findOne({
      where,
      attributes: [[fn('SUM', col('quantidade')), 'totalQuantidade']],
      raw: true,
    }) as any;

    return result?.totalQuantidade ? Number(result.totalQuantidade) : 0;
  }

  /**
   * Retorna soma de entradas (totalQuantidade + totalValor) para cálculo de custo médio
   * Considera movimentos com quantidade > 0 (entradas) na operação DISPONÍVEL
   */
  async getSomaEntradas(idProduto: number, idFazenda: number): Promise<{ totalQuantidade: number; totalValor: number }> {
    const tenantFilter = this.getTenantFilter();
    if (!tenantFilter) {
      return { totalQuantidade: 0, totalValor: 0 };
    }

    const where: any = {
      idProduto,
      idFazenda,
      operacao: OperacaoEstoque.DISPONIVEL,
      quantidade: { [Op.gt]: 0 },
    };
    if (tenantFilter.tenantId) {
      where.tenantId = tenantFilter.tenantId;
    }

    const result = await this.model.findOne({
      where,
      attributes: [
        [fn('SUM', col('quantidade')), 'totalQuantidade'],
        [fn('SUM', col('valor')), 'totalValor'],
      ],
      raw: true,
    }) as any;

    return {
      totalQuantidade: result?.totalQuantidade ? Number(result.totalQuantidade) : 0,
      totalValor: result?.totalValor ? Number(result.totalValor) : 0,
    };
  }

  /**
   * Busca movimentos por produto e fazenda
   */
  async findByProdutoFazenda(idProduto: number, idFazenda: number): Promise<MovimentoEstoque[]> {
    const tenantFilter = this.getTenantFilter();
    if (!tenantFilter) {
      return [];
    }

    const where: any = { idProduto, idFazenda };
    if (tenantFilter.tenantId) {
      where.tenantId = tenantFilter.tenantId;
    }

    return await this.model.findAll({
      where,
      order: [['data', 'DESC'], ['id_mov', 'DESC']],
      include: [
        {
          model: Produto,
          as: 'produto',
          required: false,
        },
        {
          model: Fazenda,
          as: 'fazenda',
          required: false,
        },
      ],
    });
  }

  /**
   * Busca movimentos por período
   */
  async findByPeriodo(dataInicio: string, dataFim: string): Promise<MovimentoEstoque[]> {
    const tenantFilter = this.getTenantFilter();
    if (!tenantFilter) {
      return [];
    }

    const where: any = {
      data: {
        [Op.between]: [dataInicio, dataFim],
      },
    };
    if (tenantFilter.tenantId) {
      where.tenantId = tenantFilter.tenantId;
    }

    return await this.model.findAll({
      where,
      order: [['data', 'DESC'], ['id_mov', 'DESC']],
      include: [
        {
          model: Produto,
          as: 'produto',
          required: false,
        },
        {
          model: Fazenda,
          as: 'fazenda',
          required: false,
        },
        {
          model: Pessoa,
          as: 'produtor',
          required: false,
        },
      ],
    });
  }

  /**
   * Sobrescreve create para invalidar caches relevantes
   */
  async create(entity: Partial<MovimentoEstoque>): Promise<MovimentoEstoque> {
    const result = await super.create(entity);

    await this.cacheService.deleteByPattern('movimentoEstoque:list:*');
    await this.cacheService.deleteByPattern('movimentoEstoque:findByProdutoFazenda:*');
    await this.cacheService.deleteByPattern('movimentoEstoque:findByPeriodo:*');

    return result;
  }

  /**
   * Sobrescreve update para usar id_mov ao invés de id
   */
  async update(id: number | string, entity: Partial<MovimentoEstoque>): Promise<MovimentoEstoque> {
    const tenantFilter = this.getTenantFilter();
    if (!tenantFilter) {
      throw new Error('Tenant não identificado. Não é possível atualizar entidade sem tenantId.');
    }

    const where: any = { id_mov: id };
    if (tenantFilter.tenantId) {
      where.tenantId = tenantFilter.tenantId;
    }

    const instance = await this.model.findOne({ where });

    if (!instance) {
      throw new Error('Movimento de estoque não encontrado');
    }

    const entityWithoutAudit = { ...entity };
    if ('tenantId' in entityWithoutAudit) {
      delete (entityWithoutAudit as any).tenantId;
    }
    if ('id_mov' in entityWithoutAudit) {
      delete (entityWithoutAudit as any).id_mov;
    }

    await instance.update(entityWithoutAudit);

    await this.cacheService.deleteByPattern('movimentoEstoque:findById:*');
    await this.cacheService.deleteByPattern('movimentoEstoque:list:*');
    await this.cacheService.deleteByPattern('movimentoEstoque:findByProdutoFazenda:*');
    await this.cacheService.deleteByPattern('movimentoEstoque:findByPeriodo:*');

    return instance;
  }

  /**
   * Sobrescreve delete para usar id_mov ao invés de id
   */
  async delete(id: number | string): Promise<boolean> {
    const tenantFilter = this.getTenantFilter();
    if (!tenantFilter) {
      throw new Error('Tenant não identificado. Não é possível deletar entidade sem tenantId.');
    }

    const where: any = { id_mov: id };
    if (tenantFilter.tenantId) {
      where.tenantId = tenantFilter.tenantId;
    }

    const instance = await this.model.findOne({ where });

    if (!instance) {
      return false;
    }

    await instance.destroy();

    await this.cacheService.deleteByPattern('movimentoEstoque:findById:*');
    await this.cacheService.deleteByPattern('movimentoEstoque:list:*');
    await this.cacheService.deleteByPattern('movimentoEstoque:findByProdutoFazenda:*');
    await this.cacheService.deleteByPattern('movimentoEstoque:findByPeriodo:*');

    return true;
  }
}
