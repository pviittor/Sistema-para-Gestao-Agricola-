/**
 * Interface para serviço de geração de XML NF-e 4.0
 */
export interface INfeXmlGeneratorService {
  /**
   * Gera XML NF-e a partir de uma NotaFiscal do banco
   * Atribui número sequencial automaticamente
   */
  gerarXml(notaFiscalId: number, tenantId: number): Promise<string>;
}
