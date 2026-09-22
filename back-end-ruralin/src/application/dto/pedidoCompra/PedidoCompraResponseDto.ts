/**
 * PedidoCompraResponseDto - DTO para resposta de pedido de compra
 */
export class PedidoCompraResponseDto {
  id_ped_compra!: number;
  tenantId!: number;
  numero!: string;
  empresaId!: number;
  fornecedorId!: number;
  compradorId?: number | null;
  status!: string;
  data_emissao!: string;
  data_previsao_entrega?: string | null;
  data_aprovacao?: string | null;
  aprovadoPorId?: number | null;
  condicaoPagamentoId?: number | null;
  forma_pagamento?: string | null;
  prazo_pagamento_dias?: number | null;
  localEntregaId?: number | null;
  cfop?: string | null;
  vl_produtos!: number;
  vl_frete!: number;
  vl_seguro!: number;
  vl_desconto!: number;
  vl_outros!: number;
  vl_total!: number;
  percentual_tolerancia!: number;
  permite_entrega_parcial!: boolean;
  observacoes?: string | null;
  observacoes_fornecedor?: string | null;
  motivo_cancelamento?: string | null;
  data_cancelamento?: string | null;
  ativo!: boolean;
  condicao_pagamento?: string | null;
  parcelas_qtd?: number | null;
  cotacao_vencedora_id?: number | null;
  usercreation!: number;
  datecreation!: Date;

  // ===== Relacionamentos =====
  empresa?: {
    id_pessoa: number;
    nomerazao_pessoa: string | null;
  } | null;

  fornecedor?: {
    id_pessoa: number;
    nomerazao_pessoa: string | null;
  } | null;

  comprador?: {
    id: number;
    nome: string;
    email: string;
  } | null;

  aprovador?: {
    id: number;
    nome: string;
    email: string;
  } | null;

  usuarioCriador?: {
    id: number;
    nome: string;
    email: string;
  } | null;

  itens?: {
    id_item_ped: number;
    pedidoCompraId: number;
    numero_item: number;
    produtoId: number;
    descricao: string;
    unidade: string;
    quantidade_solicitada: number;
    quantidade_atendida: number;
    quantidade_pendente: number;
    vl_unitario: number;
    vl_desconto: number;
    vl_bruto: number;
    vl_total: number;
    status: string;
    depositoDestinoId?: number | null;
    observacao?: string | null;
    produto?: { id_prod: number; descricao_prod: string | null } | null;
  }[] | null;
}
