/**
 * DTO para resposta de CentroCusto
 */
export class CentroCustoResponseDto {
  id!: number;
  tenantId!: number;
  codigo!: string;
  nome!: string;
  centroCustoPaiId?: number | null;
  ativo!: boolean;
  usercreation!: number;
  datecreation!: Date;
  usuarioCriador?: {
    id: number;
    nome: string;
    email: string;
  } | null;
  centroCustoPai?: {
    id: number;
    codigo: string;
    nome: string;
  } | null;
  centrosCustoFilhos?: {
    id: number;
    codigo: string;
    nome: string;
  }[] | null;
}
