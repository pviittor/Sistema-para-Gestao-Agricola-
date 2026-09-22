/**
 * BaixaPedidoCompraResponseDto - DTO para resposta de baixa de pedido de compra
 */
export class BaixaPedidoCompraResponseDto {
  id_baixa_ped!: number;
  tenantId!: number;
  empresaId!: number;
  notaFiscalId!: number;
  pedidoCompraId!: number;
  usuarioId!: number;
  status!: string;
  data_baixa!: string;
  vl_total_baixa!: number;
  vl_divergencia!: number;
  percentual_divergencia!: number;
  estoque_movimentado!: boolean;
  financeiro_gerado!: boolean;
  xml_importado!: boolean;
  observacoes?: string | null;
  motivo_cancelamento?: string | null;
  data_cancelamento?: string | null;
  ativo!: boolean;
  usercreation!: number;
  datecreation!: Date;

  // ===== Relacionamentos =====
  empresa?: {
    id_pessoa: number;
    nomerazao_pessoa: string | null;
  } | null;

  notaFiscal?: {
    id_nf: number;
    numero: string;
    serie: string;
    tipo: string;
  } | null;

  pedidoCompra?: {
    id_ped_compra: number;
    numero_pedido: string;
    status: string;
  } | null;

  usuario?: {
    id: number;
    nome: string;
    email: string;
  } | null;

  usuarioCriador?: {
    id: number;
    nome: string;
    email: string;
  } | null;
}
