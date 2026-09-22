/**
 * ApontamentoProdutoResponseDto - DTO para resposta de apontamento de produto
 */
export class ApontamentoProdutoResponseDto {
  id_aptprod!: number;
  tenantId!: number;
  idApontamento!: number;
  idProduto!: number;
  quantidade!: number;
  valor!: number;
  temperatura!: number;
  umidade!: number;
  periodo!: number;
  data!: string;
  numero!: number;
  observacao?: string | null;
  area!: number;
  dosagem!: number;
  produtoConvertidoMoeda!: boolean;
  usercreation!: number;
  datecreation!: Date;

  // ===== Relacionamentos =====
  apontamento?: {
    id_apt: number;
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
