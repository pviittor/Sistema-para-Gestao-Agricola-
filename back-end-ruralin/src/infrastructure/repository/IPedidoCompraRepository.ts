import { IRepository } from '../../core/repository/IRepository';
import PedidoCompra from '../../models/PedidoCompra';

/**
 * Interface para repositorio de PedidoCompra
 */
export interface IPedidoCompraRepository extends IRepository<PedidoCompra> {
  /**
   * Busca pedidos de compra por fornecedor
   */
  findByFornecedor(fornecedorId: number, status?: string): Promise<PedidoCompra[]>;

  /**
   * Lista pedidos de compra por periodo de emissao
   */
  findByPeriodo(dataInicio: string, dataFim: string, status?: string): Promise<PedidoCompra[]>;

  /**
   * Busca pedidos pendentes de entrega
   */
  findPendentesEntrega(dataPrevisaoAte?: string): Promise<PedidoCompra[]>;

  /**
   * Busca pedido de compra por numero e empresa
   */
  findByNumero(numero: string, empresaId: number): Promise<PedidoCompra | null>;

  /**
   * Soma de totais agrupados por fornecedor em um periodo
   */
  totalPorPeriodo(dataInicio: string, dataFim: string): Promise<{ fornecedorId: number; total: number; qtd: number }[]>;

  /**
   * Busca pedido de compra por ID incluindo itens e produto de cada item
   */
  findByIdWithDetails(id: number): Promise<PedidoCompra | null>;
}
