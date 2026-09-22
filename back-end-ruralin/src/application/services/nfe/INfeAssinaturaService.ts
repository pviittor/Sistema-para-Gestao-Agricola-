/**
 * Interface para serviço de assinatura digital de XML NF-e
 */
export interface INfeAssinaturaService {
  /**
   * Assina XML NF-e usando certificado digital A1 (.pfx)
   * @param xml XML da NF-e a ser assinado
   * @param certificadoId ID do CertificadoDigital no banco
   * @returns XML assinado com tag Signature
   */
  assinarXml(xml: string, certificadoId: number): Promise<string>;
}
