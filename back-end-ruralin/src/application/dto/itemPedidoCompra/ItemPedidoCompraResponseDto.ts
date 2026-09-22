/**
 * ItemPedidoCompraResponseDto - DTO para resposta de item de pedido de compra
 */
export class ItemPedidoCompraResponseDto {
  id_item_ped!: number;
  tenantId!: number;
  pedidoCompraId!: number;
  numero_item!: number;
  produtoId!: number;
  descricao!: string;
  unidade!: string;
  quantidade_solicitada!: number;
  quantidade_atendida!: number;
  quantidade_pendente!: number;
  vl_unitario!: number;
  vl_desconto!: number;
  vl_bruto!: number;
  vl_total!: number;
  status!: string;
  depositoDestinoId?: number | null;
  observacao?: string | null;
  usercreation!: number;
  datecreation!: Date;

  // ===== Relacionamentos =====
  pedidoCompra?: {
    id_ped_compra: number;
    numero: string;
    status: string;
  } | null;

  produto?: {
    id_prod: number;
    descricao_prod: string;
  } | null;

  usuarioCriador?: {
    id: number;
    nome: string;
    email: string;
  } | null;
}
