import { TituloPagarResponseDto } from '../../dto/tituloPagar/TituloPagarResponseDto'
import { TituloReceberResponseDto } from '../../dto/tituloReceber/TituloReceberResponseDto'

/**
 * Interface para serviço de integração financeira
 *
 * Serviço transversal que gera títulos financeiros a partir de documentos fiscais.
 * Reutilizável para NF entrada (Sprint 7), NF saída (Sprint 9), PedidoCompra (Sprint 8) e Empréstimo (Sprint 10).
 */
export interface IIntegracaoFinanceiraService {
  /**
   * Gera títulos a pagar a partir de uma nota fiscal de entrada
   * @param notaFiscalId ID da nota fiscal autorizada
   * @param tenantId ID do tenant
   * @returns Array de TituloPagarResponseDto criados
   * @throws BusinessException se NF não autorizada, já gerou financeiro, ou CFOP não gera financeiro
   */
  gerarTitulosPagarDeNotaFiscal(notaFiscalId: number, tenantId: number): Promise<TituloPagarResponseDto[]>

  /**
   * Gera títulos a receber a partir de uma nota fiscal de saída
   * @param notaFiscalId ID da nota fiscal de saída autorizada
   * @param tenantId ID do tenant
   * @returns Array de TituloReceberResponseDto criados
   * @throws BusinessException se NF não autorizada, já gerou financeiro, ou CFOP não gera financeiro
   */
  gerarTitulosReceberDeNotaFiscal(notaFiscalId: number, tenantId: number): Promise<TituloReceberResponseDto[]>

  /**
   * Gera titulos a pagar a partir de um pedido de compra
   * @param pedidoCompraId ID do pedido de compra aprovado
   * @param tenantId ID do tenant
   * @returns Array de TituloPagarResponseDto criados
   * @throws BusinessException se PO nao aprovado, ja gerou financeiro, ou sem valor
   */
  gerarTitulosPagarDePedidoCompra(pedidoCompraId: number, tenantId: number): Promise<TituloPagarResponseDto[]>

  /**
   * Gera título a receber a partir de um empréstimo vencido
   * Calcula valor base + multa + juros por dias de atraso
   * @param emprestimoId ID do empréstimo vencido
   * @param tenantId ID do tenant
   * @returns TituloReceberResponseDto criado
   * @throws BusinessException se empréstimo não vencido, já gerou financeiro, concluído, ou sem valor
   */
  gerarTituloDeEmprestimoVencido(emprestimoId: number, tenantId: number): Promise<TituloReceberResponseDto>
}
