/**
 * ApontamentoResponseDto - DTO para resposta de apontamento
 */
export class ApontamentoResponseDto {
  id_apt!: number;
  tenantId!: number;
  idConfiguracao!: number;
  idAtividade!: number;
  idOperacao!: number;
  dataInicio?: string | null;
  usercreation!: number;
  datecreation!: Date;

  // ===== Relacionamentos =====
  configuracao?: {
    id_cfg: number;
    descricao: string;
  } | null;

  atividade?: {
    id_atv: number;
    descricao: string;
  } | null;

  operacao?: {
    id_op: number;
    descricao: string;
  } | null;

  usuarioCriador?: {
    id: number;
    nome: string;
    email: string;
  } | null;
}
