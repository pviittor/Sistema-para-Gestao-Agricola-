/**
 * ProdutoBenfeitoriaResponseDto - DTO para resposta de produto benfeitoria
 */
export class ProdutoBenfeitoriaResponseDto {
  id_prodbenf!: number;
  tenantId!: number;
  idBenfeitoria!: number;
  idProduto!: number;
  data!: string;
  quantidade!: number;
  unitario!: number;
  observacao?: string | null;
  idSafra?: number | null;
  usercreation!: number;
  datecreation!: Date;

  // ===== Relacionamentos =====
  benfeitoria?: {
    id_benf: number;
    descricao: string;
  } | null;

  produto?: {
    id_prod: number;
    descricao: string;
  } | null;

  safra?: {
    id: number;
    descricao: string;
  } | null;

  usuarioCriador?: {
    id: number;
    nome: string;
    email: string;
  } | null;
}
