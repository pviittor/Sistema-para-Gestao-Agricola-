import { Injectable, Inject } from '../../core/di';
import { TYPES } from '../../core/di/types';
import { BaseRepository } from '../../core/repository/BaseRepository';
import { IAgreementRepository } from './IAgreementRepository';
import { ICacheService } from '../../core/cache/ICacheService';
import { ITenantService } from '../../core/tenant/ITenantService';
import Agreement from '../../models/Agreement';
import AgreementField from '../../models/AgreementField';
import AgreementLeaseTerm from '../../models/AgreementLeaseTerm';
import AgreementPaymentSchedule from '../../models/AgreementPaymentSchedule';
import Talhao from '../../models/Talhao';
import Pessoa from '../../models/Pessoa';
import Fazenda from '../../models/Fazenda';
import { AgreementType } from '../../models/enums/AgreementEnums';
import { Op } from 'sequelize';

/**
 * Repositório para entidade Agreement
 *
 * Estende BaseRepository para fornecer métodos CRUD padrão e adiciona
 * métodos específicos para busca de agreements.
 */
@Injectable()
export class AgreementRepository extends BaseRepository<Agreement> implements IAgreementRepository {
  /**
   * Construtor do repositório
   *
   * Inicializa o BaseRepository com o modelo Agreement, cacheService e tenantService.
   */
  constructor(
    @Inject(TYPES.ICacheService) cacheService: ICacheService,
    @Inject(TYPES.ITenantService) tenantService: ITenantService
  ) {
    super(Agreement, cacheService, tenantService);
  }

  /**
   * Invalida caches customizados de busca por fazenda, tipo, field e período
   */
  async invalidateCustomCaches(): Promise<void> {
    await this.cacheService.deleteByPattern('agreement:findByFazenda:*');
    await this.cacheService.deleteByPattern('agreement:findByType:*');
    await this.cacheService.deleteByPattern('agreement:findByField:*');
    await this.cacheService.deleteByPattern('agreement:findActiveByPeriod:*');
    await this.cacheService.deleteByPattern('agreement:findWithSchedules:*');
    await this.cacheService.deleteByPattern('agreement:findWithLeaseTerms:*');
  }

  async create(entity: Partial<Agreement>): Promise<Agreement> {
    const result = await super.create(entity);
    await this.invalidateCustomCaches();
    return result;
  }

  async update(id: number | string, entity: Partial<Agreement>): Promise<Agreement> {
    const result = await super.update(id, entity);
    await this.invalidateCustomCaches();
    return result;
  }

  async delete(id: number | string): Promise<boolean> {
    const result = await super.delete(id);
    await this.invalidateCustomCaches();
    return result;
  }

  /**
   * Includes padrão para listagem com relacionamentos
   */
  private getListIncludes() {
    return [
      {
        model: AgreementField,
        as: 'agreementFields',
        required: false,
        include: [
          {
            model: Talhao,
            as: 'talhao',
            required: false,
          },
        ],
      },
      {
        model: AgreementPaymentSchedule,
        as: 'paymentSchedules',
        required: false,
      },
      {
        model: Pessoa,
        as: 'arrendador',
        required: false,
      },
    ];
  }

  /**
   * Busca agreements por fazenda
   */
  async findByFazenda(fazendaId: number): Promise<Agreement[]> {
    const tenantFilter = this.getTenantFilter();
    const cacheKey = `agreement:findByFazenda:${fazendaId}:${JSON.stringify(tenantFilter)}`;

    const cached = await this.cacheService.get<Agreement[]>(cacheKey);
    if (cached !== null) {
      return cached;
    }

    const where: any = { fazendaId };
    if (tenantFilter) {
      if (tenantFilter.tenantId) {
        where.tenantId = tenantFilter.tenantId;
      }
    }

    const result = await this.model.findAll({
      where,
      include: this.getListIncludes(),
      order: [['id', 'DESC']],
    });

    await this.cacheService.set(cacheKey, result, this.DEFAULT_CACHE_TTL);
    return result;
  }

  /**
   * Busca agreements por tipo e fazenda
   */
  async findByType(type: AgreementType, fazendaId: number): Promise<Agreement[]> {
    const tenantFilter = this.getTenantFilter();
    const cacheKey = `agreement:findByType:${type}:${fazendaId}:${JSON.stringify(tenantFilter)}`;

    const cached = await this.cacheService.get<Agreement[]>(cacheKey);
    if (cached !== null) {
      return cached;
    }

    const where: any = { agreementType: type, fazendaId };
    if (tenantFilter) {
      if (tenantFilter.tenantId) {
        where.tenantId = tenantFilter.tenantId;
      }
    }

    const result = await this.model.findAll({
      where,
      include: this.getListIncludes(),
      order: [['id', 'DESC']],
    });

    await this.cacheService.set(cacheKey, result, this.DEFAULT_CACHE_TTL);
    return result;
  }

  /**
   * Busca agreements por talhão (field)
   */
  async findByField(fieldId: number): Promise<Agreement[]> {
    const tenantFilter = this.getTenantFilter();
    const cacheKey = `agreement:findByField:${fieldId}:${JSON.stringify(tenantFilter)}`;

    const cached = await this.cacheService.get<Agreement[]>(cacheKey);
    if (cached !== null) {
      return cached;
    }

    const where: any = {};
    if (tenantFilter) {
      if (tenantFilter.tenantId) {
        where.tenantId = tenantFilter.tenantId;
      }
    }

    const result = await this.model.findAll({
      where,
      include: [
        {
          model: AgreementField,
          as: 'agreementFields',
          where: { fieldId },
          required: true,
        },
      ],
      order: [['id', 'DESC']],
    });

    await this.cacheService.set(cacheKey, result, this.DEFAULT_CACHE_TTL);
    return result;
  }

  /**
   * Busca agreements ativos por período
   */
  async findActiveByPeriod(startDate: Date, endDate: Date): Promise<Agreement[]> {
    const tenantFilter = this.getTenantFilter();
    const cacheKey = `agreement:findActiveByPeriod:${startDate.toISOString()}:${endDate.toISOString()}:${JSON.stringify(tenantFilter)}`;

    const cached = await this.cacheService.get<Agreement[]>(cacheKey);
    if (cached !== null) {
      return cached;
    }

    const where: any = {
      ativo: true,
      [Op.or]: [
        // LOAN e NON_CROP_REVENUE: overlap por startDate/endDate
        {
          agreementType: { [Op.in]: [AgreementType.LOAN, AgreementType.NON_CROP_REVENUE] },
          startDate: { [Op.lte]: endDate },
          endDate: { [Op.gte]: startDate },
        },
        // RENT_LEASE: overlap por startYear/endYear
        {
          agreementType: AgreementType.RENT_LEASE,
          startYear: { [Op.lte]: endDate.getFullYear() },
          endYear: { [Op.gte]: startDate.getFullYear() },
        },
      ],
    };
    if (tenantFilter) {
      if (tenantFilter.tenantId) {
        where.tenantId = tenantFilter.tenantId;
      }
    }

    const result = await this.model.findAll({
      where,
      order: [['id', 'DESC']],
    });

    await this.cacheService.set(cacheKey, result, this.DEFAULT_CACHE_TTL);
    return result;
  }

  /**
   * Busca agreement com schedules de pagamento
   */
  async findWithSchedules(id: number): Promise<Agreement | null> {
    const tenantFilter = this.getTenantFilter();
    const cacheKey = `agreement:findWithSchedules:${id}:${JSON.stringify(tenantFilter)}`;

    const cached = await this.cacheService.get<Agreement | null>(cacheKey);
    if (cached !== null) {
      return cached;
    }

    const where: any = { id };
    if (tenantFilter) {
      if (tenantFilter.tenantId) {
        where.tenantId = tenantFilter.tenantId;
      }
    }

    const result = await this.model.findOne({
      where,
      include: [
        {
          model: AgreementPaymentSchedule,
          as: 'paymentSchedules',
          required: false,
        },
      ],
    });

    await this.cacheService.set(cacheKey, result, this.DEFAULT_CACHE_TTL);
    return result;
  }

  /**
   * Busca agreement com lease terms, fields, arrendador e fazenda
   */
  async findWithLeaseTerms(id: number): Promise<Agreement | null> {
    const tenantFilter = this.getTenantFilter();
    const cacheKey = `agreement:findWithLeaseTerms:${id}:${JSON.stringify(tenantFilter)}`;

    const cached = await this.cacheService.get<Agreement | null>(cacheKey);
    if (cached !== null) {
      return cached;
    }

    const where: any = { id };
    if (tenantFilter) {
      if (tenantFilter.tenantId) {
        where.tenantId = tenantFilter.tenantId;
      }
    }

    const result = await this.model.findOne({
      where,
      include: [
        {
          model: AgreementLeaseTerm,
          as: 'leaseTerms',
          required: false,
        },
        {
          model: AgreementPaymentSchedule,
          as: 'paymentSchedules',
          required: false,
        },
        {
          model: AgreementField,
          as: 'agreementFields',
          required: false,
          include: [
            {
              model: Talhao,
              as: 'talhao',
              required: false,
            },
          ],
        },
        {
          model: Pessoa,
          as: 'arrendador',
          required: false,
        },
        {
          model: Fazenda,
          as: 'fazenda',
          required: false,
        },
      ],
    });

    await this.cacheService.set(cacheKey, result, this.DEFAULT_CACHE_TTL);
    return result;
  }
}
