import { IApplicationService } from '../IApplicationService';
import { CreateItemBaixaPedidoCompraDto } from '../../dto/itemBaixaPedidoCompra/CreateItemBaixaPedidoCompraDto';
import { UpdateItemBaixaPedidoCompraDto } from '../../dto/itemBaixaPedidoCompra/UpdateItemBaixaPedidoCompraDto';
import { ItemBaixaPedidoCompraResponseDto } from '../../dto/itemBaixaPedidoCompra/ItemBaixaPedidoCompraResponseDto';

/**
 * Interface para Application Service de ItemBaixaPedidoCompra
 */
export interface IItemBaixaPedidoCompraApplicationService extends IApplicationService<ItemBaixaPedidoCompraResponseDto, CreateItemBaixaPedidoCompraDto, UpdateItemBaixaPedidoCompraDto> {
  /**
   * Lista todos os itens de uma baixa de pedido de compra
   */
  findByBaixaPedidoCompra(baixaPedidoCompraId: number): Promise<ItemBaixaPedidoCompraResponseDto[]>;

  /**
   * Lista itens por item do pedido de compra
   */
  findByItemPedidoCompra(itemPedidoCompraId: number): Promise<ItemBaixaPedidoCompraResponseDto[]>;
}
