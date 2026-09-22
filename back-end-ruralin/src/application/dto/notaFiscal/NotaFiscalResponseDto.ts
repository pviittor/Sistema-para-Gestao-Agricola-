/**
 * NotaFiscalResponseDto - DTO para resposta de nota fiscal
 */
export class NotaFiscalResponseDto {
  id_nf!: number;
  tenantId!: number;
  tipo!: string;
  numero!: string;
  serie!: string;
  chave_acesso?: string | null;
  modelo!: string;
  natureza_operacao!: string;
  cfop!: string;
  finalidade!: string;
  data_emissao!: string;
  data_entrada_saida!: string;
  hora_entrada_saida?: string | null;
  status!: string;
  emitenteId!: number;
  destinatarioId!: number;
  empresaId!: number;
  transportadoraId?: number | null;
  modalidade_frete?: string | null;
  vl_produtos!: number;
  vl_frete!: number;
  vl_seguro!: number;
  vl_desconto!: number;
  vl_outros!: number;
  vl_ipi!: number;
  vl_icms!: number;
  vl_pis!: number;
  vl_cofins!: number;
  vl_total!: number;
  volumes_qtd?: number | null;
  volumes_especie?: string | null;
  peso_bruto?: number | null;
  peso_liquido?: number | null;
  informacoes_adicionais?: string | null;
  informacoes_complementares?: string | null;
  xml_autorizacao?: string | null;
  protocolo_autorizacao?: string | null;
  data_autorizacao?: string | null;
  motivo_cancelamento?: string | null;
  data_cancelamento?: string | null;
  estoque_movimentado!: boolean;
  financeiro_gerado!: boolean;
  ativo!: boolean;
  notaFiscalRefId?: number | null;
  cfopId?: number | null;
  certificadoDigitalId?: number | null;
  ambiente_sefaz?: string | null;
  condicao_pagamento?: string | null;
  parcelas_qtd?: number | null;
  contingencia?: boolean | null;
  contingencia_motivo?: string | null;
  contingencia_data?: string | null;
  numero_sequencial?: number | null;
  usercreation!: number;
  datecreation!: Date;

  // ===== Relacionamentos =====
  emitente?: {
    id_pessoa: number;
    nomerazao_pessoa: string | null;
  } | null;

  destinatario?: {
    id_pessoa: number;
    nomerazao_pessoa: string | null;
  } | null;

  empresa?: {
    id_pessoa: number;
    nomerazao_pessoa: string | null;
  } | null;

  transportadora?: {
    id_pessoa: number;
    nomerazao_pessoa: string | null;
  } | null;

  notaFiscalRef?: {
    id_nf: number;
    numero: string;
    serie: string;
    modelo: string;
  } | null;

  usuarioCriador?: {
    id: number;
    nome: string;
    email: string;
  } | null;

  itens?: {
    id_item_nf: number;
    notaFiscalId: number;
    produtoId: number;
    numero_item: number;
    codigo_produto: string;
    descricao: string;
    ncm: string;
    cfop: string;
    unidade: string;
    quantidade: number;
    vl_unitario: number;
    vl_desconto: number;
    vl_frete: number;
    vl_seguro: number;
    vl_outros: number;
    vl_bruto: number;
    vl_total: number;
    produto?: { id_prod: number; descricao_prod: string | null } | null;
  }[] | null;
}
