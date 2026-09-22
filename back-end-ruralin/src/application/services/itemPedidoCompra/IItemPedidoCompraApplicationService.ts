import { IApplicationService } from '../IApplicationService';
import { CreateItemPedidoCompraDto } from '../../dto/itemPedidoCompra/CreateItemPedidoCompraDto';
import { UpdateItemPedidoCompraDto } from '../../dto/itemPedidoCompra/UpdateItemPedidoCompraDto';
import { ItemPedidoCompraResponseDto } from '../../dto/itemPedidoCompra/ItemPedidoCompraResponseDto';

/**
 * Interface para Application Service de ItemPedidoCompra
 */
export interface IItemPedidoCompraApplicationService extends IApplicationService<ItemPedidoCompraResponseDto, CreateItemPedidoCompraDto, UpdateItemPedidoCompraDto> {
  /**
   * Lista todos os itens de um pedido de compra
   */
  findByPedidoCompra(pedidoCompraId: number): Promise<ItemPedidoCompraResponseDto[]>;

  /**
   * Lista itens pendentes de um pedido de compra
   */
  findPendentesByPedido(pedidoCompraId: number): Promise<ItemPedidoCompraResponseDto[]>;

  /**
   * Busca itens por produto
   */
  findByProduto(produtoId: number): Promise<ItemPedidoCompraResponseDto[]>;

  /**
   * Consolida quantidade e valor comprado por produto em um periodo
   */
  totalCompradoPorProduto(produtoId: number, dataInicio: string, dataFim: string): Promise<{ qtd: number; vlTotal: number }>;
}
