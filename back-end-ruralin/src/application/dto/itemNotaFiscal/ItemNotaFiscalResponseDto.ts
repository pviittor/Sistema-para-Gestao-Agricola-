/**
 * ItemNotaFiscalResponseDto - DTO para resposta de item de nota fiscal
 */
export class ItemNotaFiscalResponseDto {
  id_item_nf!: number;
  tenantId!: number;
  notaFiscalId!: number;
  produtoId!: number;
  numero_item!: number;
  codigo_produto!: string;
  descricao!: string;
  ncm!: string;
  cest?: string | null;
  cfop!: string;
  unidade!: string;
  quantidade!: number;
  vl_unitario!: number;
  vl_desconto!: number;
  vl_frete!: number;
  vl_seguro!: number;
  vl_outros!: number;
  vl_bruto!: number;
  vl_total!: number;
  cst_icms!: string;
  modalidade_bc_icms?: string | null;
  aliq_icms!: number;
  vl_bc_icms!: number;
  vl_icms!: number;
  aliq_icms_st!: number;
  vl_bc_icms_st!: number;
  vl_icms_st!: number;
  cst_ipi?: string | null;
  aliq_ipi!: number;
  vl_ipi!: number;
  cst_pis!: string;
  aliq_pis!: number;
  vl_pis!: number;
  cst_cofins!: string;
  aliq_cofins!: number;
  vl_cofins!: number;
  numero_lote?: string | null;
  data_fabricacao?: string | null;
  data_validade?: string | null;
  numero_serie_item?: string | null;
  informacoes_adicionais?: string | null;
  movimentou_estoque!: boolean;
  itemPedidoCompraId?: number | null;
  usercreation!: number;
  datecreation!: Date;

  // ===== Relacionamentos =====
  notaFiscal?: {
    id_nf: number;
    numero: string;
    serie: string;
    tipo: string;
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
