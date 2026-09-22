/**
 * ItemBaixaPedidoCompraResponseDto - DTO para resposta de item de baixa de pedido de compra
 */
export class ItemBaixaPedidoCompraResponseDto {
  id_item_baixa_ped!: number;
  tenantId!: number;
  baixaPedidoCompraId!: number;
  itemPedidoCompraId!: number;
  itemNotaFiscalId!: number;
  quantidade!: number;
  vl_unitario_pedido!: number;
  vl_unitario_nf!: number;
  vl_divergencia!: number;
  divergencia_aprovada!: boolean;
  usercreation!: number;
  datecreation!: Date;

  // ===== Relacionamentos =====
  baixaPedidoCompra?: {
    id_baixa_ped: number;
    status: string;
    data_baixa: string;
  } | null;

  itemPedidoCompra?: {
    id_item_ped: number;
    quantidade: number;
    vl_unitario: number;
  } | null;

  itemNotaFiscal?: {
    id_item_nf: number;
    descricao: string;
    quantidade: number;
    vl_unitario: number;
  } | null;

  usuarioCriador?: {
    id: number;
    nome: string;
    email: string;
  } | null;
}
