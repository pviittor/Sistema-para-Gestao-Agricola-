/**
 * BenfeitoriaResponseDto - DTO para resposta de benfeitoria
 */
export class BenfeitoriaResponseDto {
  id_benf!: number;
  tenantId!: number;
  descricao!: string;
  valortotal!: number;
  vidautil!: number;
  percsucata!: number;
  depreciacaoano!: number;
  taxamanutencao!: number;
  manutencaoano!: number;
  idFazenda!: number;
  idUnidadeMedida?: number | null;
  idSafra?: number | null;
  data?: string | null;
  observacao?: string | null;
  usercreation!: number;
  datecreation!: Date;

  // ===== Relacionamentos =====
  fazenda?: {
    id: number;
    descricao: string;
  } | null;

  unidadeMedida?: {
    id_unidade: number;
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
