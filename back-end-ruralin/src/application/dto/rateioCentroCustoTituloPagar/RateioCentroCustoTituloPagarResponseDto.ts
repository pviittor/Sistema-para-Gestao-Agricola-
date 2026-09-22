/**
 * RateioCentroCustoTituloPagarResponseDto - DTO para resposta de rateio por centro de custo de título a pagar
 * 
 * DTO usado nas respostas da API para rateio por centro de custo de título a pagar.
 */
export class RateioCentroCustoTituloPagarResponseDto {
  id!: number;
  tenantId!: number;
  idTituloPagar!: number;
  idCentroCusto!: number;
  valorRateio!: number;
  percentualRateio!: number;
  observacao?: string | null;
  usercreation!: number;
  datecreation!: Date;

  /**
   * Relacionamentos opcionais (quando incluídos na query)
   */
  usuarioCriador?: {
    id: number;
    nome: string;
    email: string;
  } | null;

  tituloPagar?: {
    id: number;
    numeroTitulo: string;
    valorTitulo: number;
    dataLancamento: string;
    status: string;
  } | null;

  centroCusto?: {
    id: number;
    codigo: string;
    nome: string;
    ativo: boolean;
  } | null;
}
