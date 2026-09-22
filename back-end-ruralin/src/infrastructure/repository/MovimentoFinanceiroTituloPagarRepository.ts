import { Injectable, Inject } from '../../core/di';
import { TYPES } from '../../core/di/types';
import { BaseRepository } from '../../core/repository/BaseRepository';
import { IMovimentoFinanceiroTituloPagarRepository } from './IMovimentoFinanceiroTituloPagarRepository';
import { ICacheService } from '../../core/cache/ICacheService';
import { ITenantService } from '../../core/tenant/ITenantService';
import MovimentoFinanceiroTituloPagar from '../../models/MovimentoFinanceiroTituloPagar';
import { Op, fn, col } from 'sequelize';
import ParcelaTituloPagar from '../../models/ParcelaTituloPagar';
import TituloPagar from '../../models/TituloPagar';
import PlanoContaGerencial from '../../models/PlanoContaGerencial';
import CentroCusto from '../../models/CentroCusto';

/**
 * Repositório para entidade MovimentoFinanceiroTituloPagar
 * 
 * Estende BaseRepository para fornecer métodos CRUD padrão e adiciona
 * métodos específicos para busca e agregação de movimentos financeiros de títulos a pagar.
 */
@Injectable()
export class MovimentoFinanceiroTituloPagarRepository extends BaseRepository<MovimentoFinanceiroTituloPagar> implements IMovimentoFinanceiroTituloPagarRepository {
  /**
   * Construtor do repositório
   * 
   * Inicializa o BaseRepository com o modelo MovimentoFinanceiroTituloPagar, cacheService e tenantService.
   */
  constructor(
    @Inject(TYPES.ICacheService) cacheService: ICacheService,
    @Inject(TYPES.ITenantService) tenantService: ITenantService
  ) {
    super(MovimentoFinanceiroTituloPagar, cacheService, tenantService);
  }

  /**
   * Busca movimentos por parcela
   */
  async findByParcela(idParcelaTituloPagar: number): Promise<MovimentoFinanceiroTituloPagar[]> {
    const tenantFilter = this.getTenantFilter();
    const cacheKey = `movimentoFinanceiroTituloPagar:findByParcela:${idParcelaTituloPagar}:${JSON.stringify(tenantFilter)}`;
    
    const cached = await this.cacheService.get<MovimentoFinanceiroTituloPagar[]>(cacheKey);
    if (cached !== null) {
      return cached;
    }

    const where: any = { idParcelaTituloPagar };
    if (tenantFilter) {
      if (tenantFilter.tenantId) {
        where.tenantId = tenantFilter.tenantId;
      }
    }

    const result = await this.model.findAll({
      where,
      order: [['dataMovimento', 'DESC']],
      include: [
        {
          model: ParcelaTituloPagar,
          as: 'parcelaTituloPagar',
          required: false,
        },
        {
          model: TituloPagar,
          as: 'tituloPagar',
          required: false,
        },
        {
          model: PlanoContaGerencial,
          as: 'planoContaGerencial',
          required: false,
        },
        {
          model: CentroCusto,
          as: 'centroCusto',
          required: false,
        },
      ],
    });

    await this.cacheService.set(cacheKey, result, this.DEFAULT_CACHE_TTL);
    return result;
  }

  /**
   * Busca movimentos por título a pagar
   */
  async findByTituloPagar(idTituloPagar: number): Promise<MovimentoFinanceiroTituloPagar[]> {
    const tenantFilter = this.getTenantFilter();
    const cacheKey = `movimentoFinanceiroTituloPagar:findByTituloPagar:${idTituloPagar}:${JSON.stringify(tenantFilter)}`;
    
    const cached = await this.cacheService.get<MovimentoFinanceiroTituloPagar[]>(cacheKey);
    if (cached !== null) {
      return cached;
    }

    const where: any = { idTituloPagar };
    if (tenantFilter) {
      if (tenantFilter.tenantId) {
        where.tenantId = tenantFilter.tenantId;
      }
    }

    const result = await this.model.findAll({
      where,
      order: [['dataMovimento', 'DESC']],
      include: [
        {
          model: ParcelaTituloPagar,
          as: 'parcelaTituloPagar',
          required: false,
        },
        {
          model: TituloPagar,
          as: 'tituloPagar',
          required: false,
        },
        {
          model: PlanoContaGerencial,
          as: 'planoContaGerencial',
          required: false,
        },
        {
          model: CentroCusto,
          as: 'centroCusto',
          required: false,
        },
      ],
    });

    await this.cacheService.set(cacheKey, result, this.DEFAULT_CACHE_TTL);
    return result;
  }

  /**
   * Busca movimentos por período de movimento
   */
  async findByDataMovimento(dataInicio: Date, dataFim: Date): Promise<MovimentoFinanceiroTituloPagar[]> {
    const tenantFilter = this.getTenantFilter();
    const cacheKey = `movimentoFinanceiroTituloPagar:findByDataMovimento:${dataInicio.toISOString()}:${dataFim.toISOString()}:${JSON.stringify(tenantFilter)}`;
    
    const cached = await this.cacheService.get<MovimentoFinanceiroTituloPagar[]>(cacheKey);
    if (cached !== null) {
      return cached;
    }

    const where: any = {
      dataMovimento: {
        [Op.between]: [dataInicio, dataFim],
      },
    };
    if (tenantFilter) {
      if (tenantFilter.tenantId) {
        where.tenantId = tenantFilter.tenantId;
      }
    }

    const result = await this.model.findAll({
      where,
      order: [['dataMovimento', 'DESC']],
      include: [
        {
          model: ParcelaTituloPagar,
          as: 'parcelaTituloPagar',
          required: false,
        },
        {
          model: TituloPagar,
          as: 'tituloPagar',
          required: false,
        },
        {
          model: PlanoContaGerencial,
          as: 'planoContaGerencial',
          required: false,
        },
        {
          model: CentroCusto,
          as: 'centroCusto',
          required: false,
        },
      ],
    });

    await this.cacheService.set(cacheKey, result, this.DEFAULT_CACHE_TTL);
    return result;
  }

  /**
   * Soma valores de movimentos por plano de contas gerencial
   */
  async sumByPlanoConta(idPlanoContaGerencial: number, dataInicio?: Date, dataFim?: Date): Promise<number> {
    const tenantFilter = this.getTenantFilter();
    const cacheKey = `movimentoFinanceiroTituloPagar:sumByPlanoConta:${idPlanoContaGerencial}:${dataInicio?.toISOString() || 'all'}:${dataFim?.toISOString() || 'all'}:${JSON.stringify(tenantFilter)}`;
    
    const cached = await this.cacheService.get<number>(cacheKey);
    if (cached !== null) {
      return cached;
    }

    const where: any = { idPlanoContaGerencial };
    if (tenantFilter) {
      if (tenantFilter.tenantId) {
        where.tenantId = tenantFilter.tenantId;
      }
    }
    if (dataInicio && dataFim) {
      where.dataMovimento = {
        [Op.between]: [dataInicio, dataFim],
      };
    }

    const result = await this.model.sum('valorMovimentoMoedaPadrao', {
      where,
    });

    const total = result || 0;
    await this.cacheService.set(cacheKey, total, this.DEFAULT_CACHE_TTL);
    return total;
  }

  /**
   * Soma valores de movimentos por centro de custo
   */
  async sumByCentroCusto(idCentroCusto: number, dataInicio?: Date, dataFim?: Date): Promise<number> {
    const tenantFilter = this.getTenantFilter();
    const cacheKey = `movimentoFinanceiroTituloPagar:sumByCentroCusto:${idCentroCusto}:${dataInicio?.toISOString() || 'all'}:${dataFim?.toISOString() || 'all'}:${JSON.stringify(tenantFilter)}`;
    
    const cached = await this.cacheService.get<number>(cacheKey);
    if (cached !== null) {
      return cached;
    }

    const where: any = { idCentroCusto };
    if (tenantFilter) {
      if (tenantFilter.tenantId) {
        where.tenantId = tenantFilter.tenantId;
      }
    }
    if (dataInicio && dataFim) {
      where.dataMovimento = {
        [Op.between]: [dataInicio, dataFim],
      };
    }

    const result = await this.model.sum('valorMovimentoMoedaPadrao', {
      where,
    });

    const total = result || 0;
    await this.cacheService.set(cacheKey, total, this.DEFAULT_CACHE_TTL);
    return total;
  }

  /**
   * Soma valores de movimentos por plano de contas e centro de custo
   */
  async sumByPlanoContaECentroCusto(idPlanoContaGerencial: number, idCentroCusto: number, dataInicio?: Date, dataFim?: Date): Promise<number> {
    const tenantFilter = this.getTenantFilter();
    const cacheKey = `movimentoFinanceiroTituloPagar:sumByPlanoContaECentroCusto:${idPlanoContaGerencial}:${idCentroCusto}:${dataInicio?.toISOString() || 'all'}:${dataFim?.toISOString() || 'all'}:${JSON.stringify(tenantFilter)}`;
    
    const cached = await this.cacheService.get<number>(cacheKey);
    if (cached !== null) {
      return cached;
    }

    const where: any = {
      idPlanoContaGerencial,
      idCentroCusto,
    };
    if (tenantFilter) {
      if (tenantFilter.tenantId) {
        where.tenantId = tenantFilter.tenantId;
      }
    }
    if (dataInicio && dataFim) {
      where.dataMovimento = {
        [Op.between]: [dataInicio, dataFim],
      };
    }

    const result = await this.model.sum('valorMovimentoMoedaPadrao', {
      where,
    });

    const total = result || 0;
    await this.cacheService.set(cacheKey, total, this.DEFAULT_CACHE_TTL);
    return total;
  }

  /**
   * Agrega valores de movimentos agrupados por plano de contas
   */
  async aggregateByPlanoConta(dataInicio?: Date, dataFim?: Date): Promise<Array<{ idPlanoContaGerencial: number; total: number }>> {
    const tenantFilter = this.getTenantFilter();
    const cacheKey = `movimentoFinanceiroTituloPagar:aggregateByPlanoConta:${dataInicio?.toISOString() || 'all'}:${dataFim?.toISOString() || 'all'}:${JSON.stringify(tenantFilter)}`;
    
    const cached = await this.cacheService.get<Array<{ idPlanoContaGerencial: number; total: number }>>(cacheKey);
    if (cached !== null) {
      return cached;
    }

    const where: any = {};
    if (tenantFilter) {
      if (tenantFilter.tenantId) {
        where.tenantId = tenantFilter.tenantId;
      }
    }
    if (dataInicio && dataFim) {
      where.dataMovimento = {
        [Op.between]: [dataInicio, dataFim],
      };
    }

    const result = await this.model.findAll({
      where,
      attributes: [
        'idPlanoContaGerencial',
        [fn('SUM', col('valorMovimentoMoedaPadrao')), 'total'],
      ],
      group: ['idPlanoContaGerencial'],
      raw: true,
    });

    const aggregated = result.map((item: any) => ({
      idPlanoContaGerencial: item.idPlanoContaGerencial,
      total: parseFloat(item.total || '0'),
    }));

    await this.cacheService.set(cacheKey, aggregated, this.DEFAULT_CACHE_TTL);
    return aggregated;
  }

  /**
   * Agrega valores de movimentos agrupados por centro de custo
   */
  async aggregateByCentroCusto(dataInicio?: Date, dataFim?: Date): Promise<Array<{ idCentroCusto: number; total: number }>> {
    const tenantFilter = this.getTenantFilter();
    const cacheKey = `movimentoFinanceiroTituloPagar:aggregateByCentroCusto:${dataInicio?.toISOString() || 'all'}:${dataFim?.toISOString() || 'all'}:${JSON.stringify(tenantFilter)}`;
    
    const cached = await this.cacheService.get<Array<{ idCentroCusto: number; total: number }>>(cacheKey);
    if (cached !== null) {
      return cached;
    }

    const where: any = {};
    if (tenantFilter) {
      if (tenantFilter.tenantId) {
        where.tenantId = tenantFilter.tenantId;
      }
    }
    if (dataInicio && dataFim) {
      where.dataMovimento = {
        [Op.between]: [dataInicio, dataFim],
      };
    }

    const result = await this.model.findAll({
      where,
      attributes: [
        'idCentroCusto',
        [fn('SUM', col('valorMovimentoMoedaPadrao')), 'total'],
      ],
      group: ['idCentroCusto'],
      raw: true,
    });

    const aggregated = result.map((item: any) => ({
      idCentroCusto: item.idCentroCusto,
      total: parseFloat(item.total || '0'),
    }));

    await this.cacheService.set(cacheKey, aggregated, this.DEFAULT_CACHE_TTL);
    return aggregated;
  }
}
