/**
 * DTO para resposta de AlertaVencimentoConfig
 */
export class AlertaVencimentoConfigResponseDto {
  id!: number;
  tenantId!: number;
  usuarioId!: number;
  tipoTitulo!: string;
  antecedenciaAlerta1Dias?: number | null;
  antecedenciaAlerta2Dias?: number | null;
  antecedenciaAlerta3Dias?: number | null;
  notificarNoVencimento!: boolean;
  notificarVencidos!: boolean;
  frequenciaRenotificacaoVencidosDias?: number | null;
  ativo!: boolean;
  usercreation!: number;
  datecreation!: Date;
  usuario?: {
    id: number;
    nome: string;
    email: string;
  } | null;
  usuarioCriador?: {
    id: number;
    nome: string;
    email: string;
  } | null;
}
