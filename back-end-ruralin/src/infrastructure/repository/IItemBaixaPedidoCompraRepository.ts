import { IRepository } from '../../core/repository/IRepository';
import ItemBaixaPedidoCompra from '../../models/ItemBaixaPedidoCompra';

/**
 * Interface para repositorio de ItemBaixaPedidoCompra
 */
export interface IItemBaixaPedidoCompraRepository extends IRepository<ItemBaixaPedidoCompra> {
  /**
   * Busca itens por baixa de pedido de compra
   */
  findByBaixa(baixaPedidoCompraId: number): Promise<ItemBaixaPedidoCompra[]>;

  /**
   * Busca itens por item de pedido de compra
   */
  findByItemPedido(itemPedidoCompraId: number): Promise<ItemBaixaPedidoCompra[]>;

  /**
   * Totaliza quantidade e valor baixado por item de pedido
   */
  totalBaixadoPorItemPedido(itemPedidoCompraId: number): Promise<{ qtd: number; vlTotal: number }>;
}
