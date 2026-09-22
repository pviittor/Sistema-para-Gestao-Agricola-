/**
 * DTO para resposta de AlertaVencimento
 */
export class AlertaVencimentoResponseDto {
  id!: number;
  tenantId!: number;
  usuarioId!: number;
  alertaVencimentoConfigId!: number;
  tipoParcela!: string;
  idParcela!: number;
  idTitulo!: number;
  dataVencimentoParcela!: Date;
  dataAlerta!: Date;
  tipoAlerta!: string;
  diasAntecedencia!: number;
  mensagem!: string;
  valorSaldo!: number;
  lido!: boolean;
  datecreation!: Date;
  usuario?: {
    id: number;
    nome: string;
    email: string;
  } | null;
  config?: {
    id: number;
    tipoTitulo: string;
    ativo: boolean;
  } | null;
}
