/**
 * AtividadeAgricolaResponseDto - DTO para resposta de atividade agrícola
 */
export class AtividadeAgricolaResponseDto {
  id_atv!: number;
  tenantId!: number;
  descricao!: string;
  tipo!: number;
  usercreation!: number;
  datecreation!: Date;

  // ===== Relacionamentos =====
  usuarioCriador?: {
    id: number;
    nome: string;
    email: string;
  } | null;
}
