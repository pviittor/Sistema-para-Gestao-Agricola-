import { IRepository } from '../../core/repository/IRepository';
import CertificadoDigital from '../../models/CertificadoDigital';

export interface ICertificadoDigitalRepository extends IRepository<CertificadoDigital> {
  findPadraoByTenant(tenantId: number): Promise<CertificadoDigital | null>;
  clearPadraoByTenant(tenantId: number): Promise<void>;
}
