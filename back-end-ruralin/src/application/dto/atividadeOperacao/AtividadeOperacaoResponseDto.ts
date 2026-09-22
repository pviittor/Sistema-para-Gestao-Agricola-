/**
 * AtividadeOperacaoResponseDto - DTO para resposta de operação de atividade
 */
export class AtividadeOperacaoResponseDto {
  id_op!: number;
  tenantId!: number;
  descricao!: string;
  idAtividade!: number;
  financeiro!: boolean;
  usercreation!: number;
  datecreation!: Date;

  // ===== Relacionamentos =====
  atividadeAgricola?: {
    id_atv: number;
    descricao: string;
    tipo: number;
  } | null;

  usuarioCriador?: {
    id: number;
    nome: string;
    email: string;
  } | null;
}
