/**
 * RateioPlanoContaTituloReceberResponseDto - DTO para resposta de rateio por plano de contas de título a receber
 * 
 * DTO usado nas respostas da API para rateio por plano de contas de título a receber.
 */
export class RateioPlanoContaTituloReceberResponseDto {
  id!: number;
  tenantId!: number;
  idTituloReceber!: number;
  idPlanoContaGerencial!: number;
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

  tituloReceber?: {
    id: number;
    numeroTitulo: string;
    valorTitulo: number;
    dataLancamento: string;
    status: string;
  } | null;

  planoContaGerencial?: {
    id: number;
    item: string;
    descricao: string;
    tipo: 'SINTETICA' | 'ANALITICA';
    nivel: number;
  } | null;
}
