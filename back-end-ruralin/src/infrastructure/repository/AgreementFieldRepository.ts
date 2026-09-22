import { Injectable, Inject } from '../../core/di';
import { TYPES } from '../../core/di/types';
import { IAgreementFieldRepository } from './IAgreementFieldRepository';
import { ITenantService } from '../../core/tenant/ITenantService';
import AgreementField from '../../models/AgreementField';

/**
 * Repositório para entidade AgreementField
 *
 * Repositório standalone (sem BaseRepository) devido à chave primária composta.
 * Gerencia a associação entre Agreement e Talhão (field).
 */
@Injectable()
export class AgreementFieldRepository implements IAgreementFieldRepository {
  constructor(
    @Inject(TYPES.ITenantService) private tenantService: ITenantService
  ) {}

  private getTenantFilter(): any {
    try {
      const tenantId = this.tenantService.getCurrentTenantId();
      return tenantId ? { tenantId } : {};
    } catch {
      return {};
    }
  }

  /**
   * Busca fields por agreement
   */
  async findByAgreement(agreementId: number): Promise<AgreementField[]> {
    const tenantFilter = this.getTenantFilter();
    return AgreementField.findAll({
      where: { agreementId, ...tenantFilter },
    });
  }

  /**
   * Deleta todos os fields de um agreement
   */
  async deleteByAgreement(agreementId: number): Promise<number> {
    const tenantFilter = this.getTenantFilter();
    return AgreementField.destroy({
      where: { agreementId, ...tenantFilter },
    });
  }

  /**
   * Cria múltiplos registros de AgreementField em lote
   */
  async bulkCreate(entries: Partial<AgreementField>[]): Promise<AgreementField[]> {
    return AgreementField.bulkCreate(entries as any[]);
  }
}
