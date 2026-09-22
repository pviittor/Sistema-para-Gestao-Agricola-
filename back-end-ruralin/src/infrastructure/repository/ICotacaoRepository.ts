import { IRepository } from '../../core/repository/IRepository'
import Cotacao from '../../models/Cotacao'

/**
 * Interface para repositorio de Cotacao
 */
export interface ICotacaoRepository extends IRepository<Cotacao> {
  /**
   * Busca cotacoes por pedido de compra
   */
  findByPedidoCompra(pedidoCompraId: number): Promise<Cotacao[]>

  /**
   * Busca cotacoes por fornecedor
   */
  findByFornecedor(fornecedorId: number): Promise<Cotacao[]>

  /**
   * Busca cotacoes por pedido de compra com itens inclusos
   */
  findByPedidoCompraComItens(pedidoCompraId: number): Promise<Cotacao[]>
}
