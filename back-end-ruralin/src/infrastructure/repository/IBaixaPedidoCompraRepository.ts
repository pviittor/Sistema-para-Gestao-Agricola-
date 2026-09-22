import { IRepository } from '../../core/repository/IRepository';
import BaixaPedidoCompra from '../../models/BaixaPedidoCompra';

/**
 * Interface para repositorio de BaixaPedidoCompra
 */
export interface IBaixaPedidoCompraRepository extends IRepository<BaixaPedidoCompra> {
  /**
   * Busca baixas por nota fiscal
   */
  findByNotaFiscal(notaFiscalId: number): Promise<BaixaPedidoCompra[]>;

  /**
   * Busca baixas por pedido de compra
   */
  findByPedidoCompra(pedidoCompraId: number): Promise<BaixaPedidoCompra[]>;

  /**
   * Busca baixas por fornecedor (empresa)
   */
  findByFornecedor(fornecedorId: number): Promise<BaixaPedidoCompra[]>;

  /**
   * Busca baixas pendentes
   */
  findPendentes(): Promise<BaixaPedidoCompra[]>;

  /**
   * Busca baixas por periodo
   */
  findByPeriodo(dataInicio: string, dataFim: string): Promise<BaixaPedidoCompra[]>;
}
