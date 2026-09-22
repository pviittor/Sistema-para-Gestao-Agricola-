import { Injectable, Inject } from '../../core/di';
import { TYPES } from '../../core/di/types';
import { BaseRepository } from '../../core/repository/BaseRepository';
import { IParcelaTituloReceberRepository } from './IParcelaTituloReceberRepository';
import { ICacheService } from '../../core/cache/ICacheService';
import { ITenantService } from '../../core/tenant/ITenantService';
import ParcelaTituloReceber from '../../models/ParcelaTituloReceber';
import { StatusParcela } from '../../models/ParcelaTituloReceber';
import { Op } from 'sequelize';
import TituloReceber from '../../models/TituloReceber';

/**
 * Repositório para entidade ParcelaTituloReceber
 * 
 * Estende BaseRepository para fornecer métodos CRUD padrão e adiciona
 * métodos específicos para busca de parcelas de títulos a receber.
 */
@Injectable()
export class ParcelaTituloReceberRepository extends BaseRepository<ParcelaTituloReceber> implements IParcelaTituloReceberRepository {
  /**
   * Construtor do repositório
   * 
   * Inicializa o BaseRepository com o modelo ParcelaTituloReceber, cacheService e tenantService.
   */
  constructor(
    @Inject(TYPES.ICacheService) cacheService: ICacheService,
    @Inject(TYPES.ITenantService) tenantService: ITenantService
  ) {
    super(ParcelaTituloReceber, cacheService, tenantService);
  }

  /**
   * Busca parcelas por título a receber
   */
  async findByTituloReceber(idTituloReceber: number): Promise<ParcelaTituloReceber[]> {
    const tenantFilter = this.getTenantFilter();
    const cacheKey = `parcelaTituloReceber:findByTituloReceber:${idTituloReceber}:${JSON.stringify(tenantFilter)}`;
    
    const cached = await this.cacheService.get<ParcelaTituloReceber[]>(cacheKey);
    if (cached !== null) {
      return cached;
    }

    const where: any = { idTituloReceber };
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
          model: TituloReceber,
          as: 'tituloReceber',
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
  async findByStatus(status: StatusParcela): Promise<ParcelaTituloReceber[]> {
    const tenantFilter = this.getTenantFilter();
    const cacheKey = `parcelaTituloReceber:findByStatus:${status}:${JSON.stringify(tenantFilter)}`;
    
    const cached = await this.cacheService.get<ParcelaTituloReceber[]>(cacheKey);
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
          model: TituloReceber,
          as: 'tituloReceber',
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
  async findByDataVencimento(dataInicio: Date, dataFim: Date): Promise<ParcelaTituloReceber[]> {
    const tenantFilter = this.getTenantFilter();
    const cacheKey = `parcelaTituloReceber:findByDataVencimento:${dataInicio.toISOString()}:${dataFim.toISOString()}:${JSON.stringify(tenantFilter)}`;
    
    const cached = await this.cacheService.get<ParcelaTituloReceber[]>(cacheKey);
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
          model: TituloReceber,
          as: 'tituloReceber',
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
  async findVencidas(): Promise<ParcelaTituloReceber[]> {
    const tenantFilter = this.getTenantFilter();
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);
    const cacheKey = `parcelaTituloReceber:findVencidas:${hoje.toISOString()}:${JSON.stringify(tenantFilter)}`;
    
    const cached = await this.cacheService.get<ParcelaTituloReceber[]>(cacheKey);
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
          model: TituloReceber,
          as: 'tituloReceber',
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
  async findAVencer(dataLimite: Date): Promise<ParcelaTituloReceber[]> {
    const tenantFilter = this.getTenantFilter();
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);
    const dataLimiteNormalizada = new Date(dataLimite);
    dataLimiteNormalizada.setHours(23, 59, 59, 999);
    const cacheKey = `parcelaTituloReceber:findAVencer:${hoje.toISOString()}:${dataLimiteNormalizada.toISOString()}:${JSON.stringify(tenantFilter)}`;
    
    const cached = await this.cacheService.get<ParcelaTituloReceber[]>(cacheKey);
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
          model: TituloReceber,
          as: 'tituloReceber',
          required: false,
        },
      ],
    });

    await this.cacheService.set(cacheKey, result, this.DEFAULT_CACHE_TTL);
    return result;
  }
}
