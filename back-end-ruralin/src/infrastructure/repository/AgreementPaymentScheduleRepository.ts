import { Injectable, Inject } from '../../core/di';
import { TYPES } from '../../core/di/types';
import { BaseRepository } from '../../core/repository/BaseRepository';
import { IAgreementPaymentScheduleRepository } from './IAgreementPaymentScheduleRepository';
import { ICacheService } from '../../core/cache/ICacheService';
import { ITenantService } from '../../core/tenant/ITenantService';
import AgreementPaymentSchedule from '../../models/AgreementPaymentSchedule';

/**
 * Repositório para entidade AgreementPaymentSchedule
 *
 * Estende BaseRepository para fornecer métodos CRUD padrão e adiciona
 * métodos específicos para busca de payment schedules de agreements.
 */
@Injectable()
export class AgreementPaymentScheduleRepository extends BaseRepository<AgreementPaymentSchedule> implements IAgreementPaymentScheduleRepository {
  /**
   * Construtor do repositório
   *
   * Inicializa o BaseRepository com o modelo AgreementPaymentSchedule, cacheService e tenantService.
   */
  constructor(
    @Inject(TYPES.ICacheService) cacheService: ICacheService,
    @Inject(TYPES.ITenantService) tenantService: ITenantService
  ) {
    super(AgreementPaymentSchedule, cacheService, tenantService);
  }

  /**
   * Busca payment schedules por agreement
   */
  async findByAgreement(agreementId: number): Promise<AgreementPaymentSchedule[]> {
    const tenantFilter = this.getTenantFilter();
    const cacheKey = `agreementPaymentSchedule:findByAgreement:${agreementId}:${JSON.stringify(tenantFilter)}`;

    const cached = await this.cacheService.get<AgreementPaymentSchedule[]>(cacheKey);
    if (cached !== null) {
      return cached;
    }

    const where: any = { agreementId };
    if (tenantFilter) {
      if (tenantFilter.tenantId) {
        where.tenantId = tenantFilter.tenantId;
      }
    }

    const result = await this.model.findAll({
      where,
      order: [['startDate', 'ASC']],
    });

    await this.cacheService.set(cacheKey, result, this.DEFAULT_CACHE_TTL);
    return result;
  }

  /**
   * Deleta todos os payment schedules de um agreement
   */
  async deleteByAgreement(agreementId: number): Promise<number> {
    const tenantFilter = this.getTenantFilter();
    const where: any = { agreementId };
    if (tenantFilter) {
      if (tenantFilter.tenantId) {
        where.tenantId = tenantFilter.tenantId;
      }
    }

    return this.model.destroy({ where });
  }
}
