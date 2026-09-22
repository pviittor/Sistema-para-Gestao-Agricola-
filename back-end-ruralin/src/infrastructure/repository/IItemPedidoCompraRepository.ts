import { IRepository } from '../../core/repository/IRepository';
import ItemPedidoCompra from '../../models/ItemPedidoCompra';

/**
 * Interface para repositorio de ItemPedidoCompra
 */
export interface IItemPedidoCompraRepository extends IRepository<ItemPedidoCompra> {
  /**
   * Lista todos os itens de um pedido de compra
   */
  findByPedidoCompra(pedidoCompraId: number): Promise<ItemPedidoCompra[]>;

  /**
   * Lista itens pendentes de um pedido de compra
   */
  findPendentesByPedido(pedidoCompraId: number): Promise<ItemPedidoCompra[]>;

  /**
   * Busca itens por produto
   */
  findByProduto(produtoId: number): Promise<ItemPedidoCompra[]>;

  /**
   * Consolida quantidade e valor comprado por produto em um periodo
   */
  totalCompradoPorProduto(produtoId: number, dataInicio: string, dataFim: string): Promise<{ qtd: number; vlTotal: number }>;

  /**
   * Remove todos os itens de um pedido de compra
   */
  deleteByPedidoCompra(pedidoCompraId: number): Promise<number>;
}
