import { IApplicationService } from '../IApplicationService';
import { CreateBaixaPedidoCompraDto } from '../../dto/baixaPedidoCompra/CreateBaixaPedidoCompraDto';
import { UpdateBaixaPedidoCompraDto } from '../../dto/baixaPedidoCompra/UpdateBaixaPedidoCompraDto';
import { BaixaPedidoCompraResponseDto } from '../../dto/baixaPedidoCompra/BaixaPedidoCompraResponseDto';

/**
 * Interface para Application Service de BaixaPedidoCompra
 */
export interface IBaixaPedidoCompraApplicationService extends IApplicationService<BaixaPedidoCompraResponseDto, CreateBaixaPedidoCompraDto, UpdateBaixaPedidoCompraDto> {
  /**
   * Processa uma baixa de pedido de compra
   * Atualiza quantidades atendidas nos itens do pedido e status do pedido
   */
  processar(id: number): Promise<BaixaPedidoCompraResponseDto>;

  /**
   * Cancela uma baixa de pedido de compra
   * Se processada, realiza estorno das quantidades atendidas
   */
  cancelar(id: number, motivo: string): Promise<BaixaPedidoCompraResponseDto>;

  /**
   * Busca baixas por nota fiscal
   */
  findByNotaFiscal(notaFiscalId: number): Promise<BaixaPedidoCompraResponseDto[]>;

  /**
   * Busca baixas por pedido de compra
   */
  findByPedidoCompra(pedidoCompraId: number): Promise<BaixaPedidoCompraResponseDto[]>;

  /**
   * Busca baixas por fornecedor (empresa)
   */
  findByFornecedor(fornecedorId: number): Promise<BaixaPedidoCompraResponseDto[]>;

  /**
   * Busca baixas pendentes
   */
  findPendentes(): Promise<BaixaPedidoCompraResponseDto[]>;

  /**
   * Busca baixas por periodo
   */
  findByPeriodo(dataInicio: string, dataFim: string): Promise<BaixaPedidoCompraResponseDto[]>;
}
