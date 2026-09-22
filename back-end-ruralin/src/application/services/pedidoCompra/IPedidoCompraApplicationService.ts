import { IApplicationService } from '../IApplicationService';
import { CreatePedidoCompraDto } from '../../dto/pedidoCompra/CreatePedidoCompraDto';
import { UpdatePedidoCompraDto } from '../../dto/pedidoCompra/UpdatePedidoCompraDto';
import { PedidoCompraResponseDto } from '../../dto/pedidoCompra/PedidoCompraResponseDto';
import { CreatePedidoCompraCompletoDto } from '../../dto/pedidoCompra/CreatePedidoCompraCompletoDto';
import { UpdatePedidoCompraCompletoDto } from '../../dto/pedidoCompra/UpdatePedidoCompraCompletoDto';

/**
 * Interface para Application Service de PedidoCompra
 */
export interface IPedidoCompraApplicationService extends IApplicationService<PedidoCompraResponseDto, CreatePedidoCompraDto, UpdatePedidoCompraDto> {
  /**
   * Aprova um pedido de compra
   */
  aprovar(id: number): Promise<PedidoCompraResponseDto>;

  /**
   * Cancela um pedido de compra
   */
  cancelar(id: number, motivo: string): Promise<PedidoCompraResponseDto>;

  /**
   * Busca pedidos de compra por fornecedor
   */
  findByFornecedor(fornecedorId: number, status?: string): Promise<PedidoCompraResponseDto[]>;

  /**
   * Lista pedidos de compra por periodo de emissao
   */
  findByPeriodo(dataInicio: string, dataFim: string, status?: string): Promise<PedidoCompraResponseDto[]>;

  /**
   * Busca pedidos pendentes de entrega
   */
  findPendentesEntrega(dataPrevisaoAte?: string): Promise<PedidoCompraResponseDto[]>;

  /**
   * Busca pedido de compra por numero e empresa
   */
  findByNumero(numero: string, empresaId: number): Promise<PedidoCompraResponseDto | null>;

  /**
   * Soma de totais agrupados por fornecedor em um periodo
   */
  totalPorPeriodo(dataInicio: string, dataFim: string): Promise<any>;

  /**
   * Recalcula os totais do pedido com base nos itens
   */
  recalcularTotais(id: number): Promise<void>;

  /**
   * Atualiza o status de atendimento do pedido com base nos itens
   */
  atualizarStatusAtendimento(id: number): Promise<void>;

  /**
   * Cria um pedido de compra completo com itens em uma unica operacao atomica
   */
  createCompleto(dto: CreatePedidoCompraCompletoDto): Promise<PedidoCompraResponseDto>;

  /**
   * Atualiza um pedido de compra completo com itens (delete-and-recreate)
   * Permitido somente quando status eh rascunho
   */
  updateCompleto(id: number, dto: UpdatePedidoCompraCompletoDto): Promise<PedidoCompraResponseDto>;

  /**
   * Busca um pedido de compra por ID com todos os detalhes (itens + associacoes)
   */
  getByIdDetalhado(id: number): Promise<PedidoCompraResponseDto | null>;
}
