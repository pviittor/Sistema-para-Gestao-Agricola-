/**
 * PlanejadoRealizadoDto - DTO para resposta de relatório de planejado vs realizado
 * 
 * DTO usado nas respostas da API para relatórios de planejado vs realizado,
 * agrupado por plano de contas e centro de custo.
 */
export class PlanejadoRealizadoDto {
  /**
   * ID do plano de contas gerencial
   */
  idPlanoContaGerencial!: number;

  /**
   * Item do plano de contas (ex: "1.1.2.0")
   */
  itemPlanoConta!: string;

  /**
   * Descrição do plano de contas
   */
  descricaoPlanoConta!: string;

  /**
   * ID do centro de custo
   */
  idCentroCusto!: number;

  /**
   * Código do centro de custo
   */
  codigoCentroCusto!: string;

  /**
   * Nome do centro de custo
   */
  nomeCentroCusto!: string;

  /**
   * Valor planejado (soma dos valores de rateios de parcelas ainda não baixadas)
   */
  valorPlanejado!: number;

  /**
   * Valor realizado (soma dos valores de movimentos financeiros de parcelas baixadas)
   */
  valorRealizado!: number;

  /**
   * Diferença entre planejado e realizado (realizado - planejado)
   */
  diferenca!: number;

  /**
   * Percentual de realização (realizado / planejado * 100)
   */
  percentualRealizacao!: number;

  /**
   * ID da safra (quando filtrado por safra)
   */
  idSafra?: number;

  /**
   * Nome da safra (quando filtrado por safra)
   */
  nomeSafra?: string;

  /**
   * Período inicial (quando filtrado por período)
   */
  dataInicio?: string;

  /**
   * Período final (quando filtrado por período)
   */
  dataFim?: string;
}
