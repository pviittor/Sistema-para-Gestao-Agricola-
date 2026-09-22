import { Injectable, Inject } from '../../core/di';
import { TYPES } from '../../core/di/types';
import { BaseRepository } from '../../core/repository/BaseRepository';
import { ICertificadoDigitalRepository } from './ICertificadoDigitalRepository';
import { ICacheService } from '../../core/cache/ICacheService';
import { ITenantService } from '../../core/tenant/ITenantService';
import CertificadoDigital from '../../models/CertificadoDigital';

/**
 * Repositório para entidade CertificadoDigital
 *
 * Estende BaseRepository para fornecer métodos CRUD padrão e adiciona
 * métodos específicos para busca de certificados digitais.
 */
@Injectable()
export class CertificadoDigitalRepository extends BaseRepository<CertificadoDigital> implements ICertificadoDigitalRepository {
  constructor(
    @Inject(TYPES.ICacheService) cacheService: ICacheService,
    @Inject(TYPES.ITenantService) tenantService: ITenantService
  ) {
    super(CertificadoDigital, cacheService, tenantService);
  }

  /**
   * Busca o certificado padrão do tenant
   */
  async findPadraoByTenant(tenantId: number): Promise<CertificadoDigital | null> {
    return this.model.findOne({
      where: { tenantId, padrao: true, ativo: true },
    });
  }

  /**
   * Limpa o flag padrão de todos os certificados do tenant
   */
  async clearPadraoByTenant(tenantId: number): Promise<void> {
    await this.model.update(
      { padrao: false } as any,
      { where: { tenantId, padrao: true } }
    );
  }
}
