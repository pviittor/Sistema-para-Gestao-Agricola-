/**
 * Interface para serviço de integração de estoque
 *
 * Serviço transversal que gera movimentos de estoque a partir de documentos fiscais.
 * Para NF entrada: cria movimentos de entrada (aumenta estoque).
 * Para NF saída: cria movimentos de saída (diminui estoque).
 */
export interface IIntegracaoEstoqueService {
  /**
   * Gera movimentos de estoque a partir de uma nota fiscal autorizada
   * @param notaFiscalId ID da nota fiscal autorizada
   * @param tenantId ID do tenant
   * @throws BusinessException se NF não autorizada ou estoque já movimentado
   */
  gerarMovimentosDeNotaFiscal(notaFiscalId: number, tenantId: number): Promise<void>

  /**
   * Reverte movimentos de estoque de uma nota fiscal (cancelamento)
   * @param notaFiscalId ID da nota fiscal
   * @param tenantId ID do tenant
   */
  reverterMovimentosDeNotaFiscal(notaFiscalId: number, tenantId: number): Promise<void>
}
