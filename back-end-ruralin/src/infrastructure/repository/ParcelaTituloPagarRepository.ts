import { Injectable, Inject } from '../../core/di';
import { TYPES } from '../../core/di/types';
import { BaseRepository } from '../../core/repository/BaseRepository';
import { IParcelaTituloPagarRepository } from './IParcelaTituloPagarRepository';
import { ICacheService } from '../../core/cache/ICacheService';
import { ITenantService } from '../../core/tenant/ITenantService';
import ParcelaTituloPagar from '../../models/ParcelaTituloPagar';
import { StatusParcela } from '../../models/ParcelaTituloPagar';
import { Op } from 'sequelize';
import TituloPagar from '../../models/TituloPagar';

/**
 * Repositório para entidade ParcelaTituloPagar
 * 
 * Estende BaseRepository para fornecer métodos CRUD padrão e adiciona
 * métodos específicos para busca de parcelas de títulos a pagar.
 */
@Injectable()
export class ParcelaTituloPagarRepository extends BaseRepository<ParcelaTituloPagar> implements IParcelaTituloPagarRepository {
  /**
   * Construtor do repositório
   * 
   * Inicializa o BaseRepository com o modelo ParcelaTituloPagar, cacheService e tenantService.
   */
  constructor(
    @Inject(TYPES.ICacheService) cacheService: ICacheService,
    @Inject(TYPES.ITenantService) tenantService: ITenantService
  ) {
    super(ParcelaTituloPagar, cacheService, tenantService);
  }

  /**
   * Busca parcelas por título a pagar
   */
  async findByTituloPagar(idTituloPagar: number): Promise<ParcelaTituloPagar[]> {
    const tenantFilter = this.getTenantFilter();
    const cacheKey = `parcelaTituloPagar:findByTituloPagar:${idTituloPagar}:${JSON.stringify(tenantFilter)}`;
    
    const cached = await this.cacheService.get<ParcelaTituloPagar[]>(cacheKey);
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
      order: [['numeroParcela', 'ASC']],
      include: [
        {
          model: TituloPagar,
          as: 'tituloPagar',
          required: false,
        },
      ],
    });

    await this.cacheService.set(cacheKey, result, this.DEFAULT_CACHE_TTL);
    return result;
  }

  /**
   * Busca parcelas por status
   */
  async findByStatus(status: StatusParcela): Promise<ParcelaTituloPagar[]> {
    const tenantFilter = this.getTenantFilter();
    const cacheKey = `parcelaTituloPagar:findByStatus:${status}:${JSON.stringify(tenantFilter)}`;
    
    const cached = await this.cacheService.get<ParcelaTituloPagar[]>(cacheKey);
    if (cached !== null) {
      return cached;
    }

    const where: any = { status };
    if (tenantFilter) {
      if (tenantFilter.tenantId) {
        where.tenantId = tenantFilter.tenantId;
      }
    }

    const result = await this.model.findAll({
      where,
      order: [['dataVencimento', 'ASC']],
      include: [
        {
          model: TituloPagar,
          as: 'tituloPagar',
          required: false,
        },
      ],
    });

    await this.cacheService.set(cacheKey, result, this.DEFAULT_CACHE_TTL);
    return result;
  }

  /**
   * Busca parcelas por período de vencimento
   */
  async findByDataVencimento(dataInicio: Date, dataFim: Date): Promise<ParcelaTituloPagar[]> {
    const tenantFilter = this.getTenantFilter();
    const cacheKey = `parcelaTituloPagar:findByDataVencimento:${dataInicio.toISOString()}:${dataFim.toISOString()}:${JSON.stringify(tenantFilter)}`;
    
    const cached = await this.cacheService.get<ParcelaTituloPagar[]>(cacheKey);
    if (cached !== null) {
      return cached;
    }

    const where: any = {
      dataVencimento: {
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
      order: [['dataVencimento', 'ASC']],
      include: [
        {
          model: TituloPagar,
          as: 'tituloPagar',
          required: false,
        },
      ],
    });

    await this.cacheService.set(cacheKey, result, this.DEFAULT_CACHE_TTL);
    return result;
  }

  /**
   * Busca parcelas vencidas (data de vencimento anterior à data atual)
   */
  async findVencidas(): Promise<ParcelaTituloPagar[]> {
    const tenantFilter = this.getTenantFilter();
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);
    const cacheKey = `parcelaTituloPagar:findVencidas:${hoje.toISOString()}:${JSON.stringify(tenantFilter)}`;
    
    const cached = await this.cacheService.get<ParcelaTituloPagar[]>(cacheKey);
    if (cached !== null) {
      return cached;
    }

    const where: any = {
      dataVencimento: {
        [Op.lt]: hoje,
      },
      status: {
        [Op.ne]: 'BAIXADA',
      },
    };
    if (tenantFilter) {
      if (tenantFilter.tenantId) {
        where.tenantId = tenantFilter.tenantId;
      }
    }

    const result = await this.model.findAll({
      where,
      order: [['dataVencimento', 'ASC']],
      include: [
        {
          model: TituloPagar,
          as: 'tituloPagar',
          required: false,
        },
      ],
    });

    await this.cacheService.set(cacheKey, result, this.DEFAULT_CACHE_TTL);
    return result;
  }

  /**
   * Busca parcelas a vencer (data de vencimento entre hoje e data limite)
   */
  async findAVencer(dataLimite: Date): Promise<ParcelaTituloPagar[]> {
    const tenantFilter = this.getTenantFilter();
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);
    const dataLimiteNormalizada = new Date(dataLimite);
    dataLimiteNormalizada.setHours(23, 59, 59, 999);
    const cacheKey = `parcelaTituloPagar:findAVencer:${hoje.toISOString()}:${dataLimiteNormalizada.toISOString()}:${JSON.stringify(tenantFilter)}`;
    
    const cached = await this.cacheService.get<ParcelaTituloPagar[]>(cacheKey);
    if (cached !== null) {
      return cached;
    }

    const where: any = {
      dataVencimento: {
        [Op.between]: [hoje, dataLimiteNormalizada],
      },
      status: {
        [Op.ne]: 'BAIXADA',
      },
    };
    if (tenantFilter) {
      if (tenantFilter.tenantId) {
        where.tenantId = tenantFilter.tenantId;
      }
    }

    const result = await this.model.findAll({
      where,
      order: [['dataVencimento', 'ASC']],
      include: [
        {
          model: TituloPagar,
          as: 'tituloPagar',
          required: false,
        },
      ],
    });

    await this.cacheService.set(cacheKey, result, this.DEFAULT_CACHE_TTL);
    return result;
  }
}
