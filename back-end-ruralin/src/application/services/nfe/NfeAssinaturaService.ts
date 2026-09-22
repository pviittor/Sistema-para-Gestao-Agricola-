import { Injectable, Inject } from '../../../core/di';
import { TYPES } from '../../../core/di/types';
import { BusinessException } from '../../../core/exceptions/BusinessException';
import { INfeAssinaturaService } from './INfeAssinaturaService';
import { ICertificadoDigitalRepository } from '../../../infrastructure/repository/ICertificadoDigitalRepository';
import * as fs from 'fs';
import * as crypto from 'crypto';

/**
 * Serviço de assinatura digital de XML NF-e
 * Usa certificado digital A1 (.pfx) para assinar com XML Signature (enveloped, SHA-256)
 */
@Injectable()
export class NfeAssinaturaService implements INfeAssinaturaService {
  constructor(
    @Inject(TYPES.ICertificadoDigitalRepository) private readonly certificadoRepository: ICertificadoDigitalRepository
  ) {}

  async assinarXml(xml: string, certificadoId: number): Promise<string> {
    // 1. Buscar certificado
    const certificado = await this.certificadoRepository.findById(certificadoId);
    if (!certificado) {
      throw new BusinessException('Certificado digital não encontrado');
    }

    // 2. Validar certificado
    if (!(certificado as any).ativo) {
      throw new BusinessException('Certificado digital está inativo');
    }

    const dataValidade = new Date((certificado as any).data_validade);
    if (dataValidade < new Date()) {
      throw new BusinessException('Certificado digital está expirado');
    }

    // 3. Ler arquivo .pfx
    const arquivoPath = (certificado as any).arquivo_path;
    if (!arquivoPath || !fs.existsSync(arquivoPath)) {
      throw new BusinessException(`Arquivo do certificado não encontrado: ${arquivoPath}`);
    }

    const pfxBuffer = fs.readFileSync(arquivoPath);
    const senha = (certificado as any).senha;

    try {
      // 4. Extrair dados do certificado PFX
      const pfxObject = crypto.createPrivateKey({
        key: pfxBuffer,
        format: 'der',
        type: 'pkcs8',
        passphrase: senha,
      });

      // 5. Extrair a tag infNFe para assinar
      const infNFeMatch = xml.match(/<infNFe[^>]*>([\s\S]*?)<\/infNFe>/);
      if (!infNFeMatch) {
        throw new BusinessException('Tag infNFe não encontrada no XML');
      }

      const infNFeId = xml.match(/Id="(NFe\d+)"/);
      const referenceUri = infNFeId ? `#${infNFeId[1]}` : '';

      // 6. Calcular digest da infNFe (canônico)
      const infNFeContent = `<infNFe${xml.match(/<infNFe([^>]*)>/)?.[1] || ''}>${infNFeMatch[1]}</infNFe>`;
      const digestValue = crypto
        .createHash('sha256')
        .update(infNFeContent, 'utf8')
        .digest('base64');

      // 7. Montar SignedInfo
      const signedInfo = `<SignedInfo xmlns="http://www.w3.org/2000/09/xmldsig#">` +
        `<CanonicalizationMethod Algorithm="http://www.w3.org/TR/2001/REC-xml-c14n-20010315"/>` +
        `<SignatureMethod Algorithm="http://www.w3.org/2001/04/xmldsig-more#rsa-sha256"/>` +
        `<Reference URI="${referenceUri}">` +
        `<Transforms>` +
        `<Transform Algorithm="http://www.w3.org/2000/09/xmldsig#enveloped-signature"/>` +
        `<Transform Algorithm="http://www.w3.org/TR/2001/REC-xml-c14n-20010315"/>` +
        `</Transforms>` +
        `<DigestMethod Algorithm="http://www.w3.org/2001/04/xmlenc#sha256"/>` +
        `<DigestValue>${digestValue}</DigestValue>` +
        `</Reference>` +
        `</SignedInfo>`;

      // 8. Assinar SignedInfo
      const signer = crypto.createSign('RSA-SHA256');
      signer.update(signedInfo);
      const signatureValue = signer.sign(pfxObject, 'base64');

      // 9. Extrair certificado X509 do PFX para KeyInfo
      // Simplificado — certificado X509 seria extraído do PFX via openssl ou forge
      const x509Data = ''; // TODO: Extrair X509 do PFX com biblioteca adequada

      // 10. Montar Signature completa
      const signature = `<Signature xmlns="http://www.w3.org/2000/09/xmldsig#">` +
        signedInfo +
        `<SignatureValue>${signatureValue}</SignatureValue>` +
        `<KeyInfo>` +
        `<X509Data><X509Certificate>${x509Data}</X509Certificate></X509Data>` +
        `</KeyInfo>` +
        `</Signature>`;

      // 11. Inserir Signature antes de </infNFe>
      const xmlAssinado = xml.replace('</infNFe>', `${signature}</infNFe>`);

      return xmlAssinado;
    } catch (error: any) {
      if (error instanceof BusinessException) throw error;
      if (error.message?.includes('bad decrypt') || error.message?.includes('wrong password')) {
        throw new BusinessException('Senha do certificado digital incorreta');
      }
      throw new BusinessException(`Erro ao assinar XML: ${error.message}`);
    }
  }
}
