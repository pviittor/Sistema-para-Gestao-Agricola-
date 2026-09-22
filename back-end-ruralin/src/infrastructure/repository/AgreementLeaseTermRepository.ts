import { Injectable, Inject } from '../../core/di';
import { TYPES } from '../../core/di/types';
import { BaseRepository } from '../../core/repository/BaseRepository';
import { IAgreementLeaseTermRepository } from './IAgreementLeaseTermRepository';
import { ICacheService } from '../../core/cache/ICacheService';
import { ITenantService } from '../../core/tenant/ITenantService';
import AgreementLeaseTerm from '../../models/AgreementLeaseTerm';

/**
 * Repositório para entidade AgreementLeaseTerm
 *
 * Estende BaseRepository para fornecer métodos CRUD padrão e adiciona
 * métodos específicos para busca de lease terms de agreements.
 */
@Injectable()
export class AgreementLeaseTermRepository extends BaseRepository<AgreementLeaseTerm> implements IAgreementLeaseTermRepository {
  /**
   * Construtor do repositório
   *
   * Inicializa o BaseRepository com o modelo AgreementLeaseTerm, cacheService e tenantService.
   */
  constructor(
    @Inject(TYPES.ICacheService) cacheService: ICacheService,
    @Inject(TYPES.ITenantService) tenantService: ITenantService
  ) {
    super(AgreementLeaseTerm, cacheService, tenantService);
  }

  /**
   * Busca lease terms por agreement
   */
  async findByAgreement(agreementId: number): Promise<AgreementLeaseTerm[]> {
    const tenantFilter = this.getTenantFilter();
    const cacheKey = `agreementLeaseTerm:findByAgreement:${agreementId}:${JSON.stringify(tenantFilter)}`;

    const cached = await this.cacheService.get<AgreementLeaseTerm[]>(cacheKey);
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
      order: [['id', 'ASC']],
    });

    await this.cacheService.set(cacheKey, result, this.DEFAULT_CACHE_TTL);
    return result;
  }

  /**
   * Deleta todos os lease terms de um agreement
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
