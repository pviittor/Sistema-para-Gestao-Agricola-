/**
 * DTO para resposta de Safra
 */
export class SafraResponseDto {
  id!: number;
  tenantId!: number;
  culturaId!: number;
  nome!: string;
  dataInicio!: string;
  dataFim?: string | null;
  status!: string;
  usercreation!: number;
  datecreation!: Date;
  usuarioCriador?: {
    id: number;
    nome: string;
    email: string;
  } | null;
  cultura?: {
    id: number;
    descricao_clt: string;
    idProduto: number;
  } | null;
}
