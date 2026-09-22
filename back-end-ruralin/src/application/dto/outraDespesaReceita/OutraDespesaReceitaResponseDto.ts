/**
 * OutraDespesaReceitaResponseDto - DTO para resposta de outra despesa/receita
 */
export class OutraDespesaReceitaResponseDto {
  id!: number;
  tenantId!: number;
  planoGerencialId!: number;
  dataMovimento!: string;
  valor!: number;
  observacoes?: string | null;
  tipo!: string;
  tipoAlocacao!: string;
  configuradorCicloId?: number | null;
  usercreation!: number;
  datecreation!: Date;

  // ===== Relacionamentos =====
  planoGerencial?: {
    id: number;
    item: string;
    descricao: string;
  } | null;

  configuradorCiclo?: {
    id_cfg: number;
    idTalhao: number;
    idCiclo: number;
    idCultura: number;
  } | null;

  usuarioCriador?: {
    id: number;
    nome: string;
    email: string;
  } | null;
}
