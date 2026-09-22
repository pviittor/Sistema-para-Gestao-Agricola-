import { IApplicationService } from '../IApplicationService';
import { CreateCertificadoDigitalDto } from '../../dto/certificadoDigital/CreateCertificadoDigitalDto';
import { UpdateCertificadoDigitalDto } from '../../dto/certificadoDigital/UpdateCertificadoDigitalDto';
import { CertificadoDigitalResponseDto } from '../../dto/certificadoDigital/CertificadoDigitalResponseDto';

/**
 * Interface para Application Service de CertificadoDigital
 */
export interface ICertificadoDigitalApplicationService extends IApplicationService<CertificadoDigitalResponseDto, CreateCertificadoDigitalDto, UpdateCertificadoDigitalDto> {
  /**
   * Busca o certificado padrão do tenant atual
   */
  findPadrao(): Promise<CertificadoDigitalResponseDto | null>;

  /**
   * Define um certificado como padrão do tenant
   */
  setPadrao(id: number): Promise<CertificadoDigitalResponseDto>;
}
