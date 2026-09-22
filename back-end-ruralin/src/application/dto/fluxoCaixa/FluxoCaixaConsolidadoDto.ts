/**
 * DTOs de resposta do fluxo de caixa consolidado
 *
 * Classes plain (sem decorators de validação) pois são computadas pelo serviço.
 */

/**
 * Entrada individual no fluxo de caixa (um lançamento realizado ou projetado)
 */
export interface FluxoCaixaEntryDto {
  /** Tipo do lançamento: entrada ou saida */
  tipoFluxo: string;

  /** Origem do lançamento */
  origem: string;

  /** ID da origem (parcela, agreement schedule, recorrência, etc.) */
  origemId: number | null;

  /** Descrição do lançamento */
  descricao: string;

  /** Data do lançamento (formato: YYYY-MM-DD) */
  data: string;

  /** Valor do lançamento */
  valor: number;

  /** ID da conta bancária associada */
  contaBancariaId: number | null;

  /** Nome da conta bancária */
  contaBancariaNome: string | null;

  /** Se o lançamento já foi realizado ou é projetado */
  realizado: boolean;

  /** ID da categoria / plano de contas */
  planoContaId: number | null;

  /** Nome da categoria / plano de contas */
  planoContaNome: string | null;
}

/**
 * Período agrupado do fluxo de caixa (diário, semanal, mensal ou safra)
 */
export interface FluxoCaixaPeriodoDto {
  /** Rótulo do período (ex: "2026-03-01", "Semana 10/2026", "Mar/2026") */
  rotulo: string;

  /** Data de início do período (formato: YYYY-MM-DD) */
  dataInicio: string;

  /** Data de fim do período (formato: YYYY-MM-DD) */
  dataFim: string;

  /** Total de entradas no período */
  totalEntradas: number;

  /** Total de saídas no período */
  totalSaidas: number;

  /** Saldo do período (entradas - saídas) */
  saldoPeriodo: number;

  /** Saldo acumulado até o fim deste período */
  saldoAcumulado: number;

  /** Lançamentos individuais do período */
  lancamentos: FluxoCaixaEntryDto[];
}

/**
 * Saldo por conta bancária
 */
export interface FluxoCaixaSaldoContaDto {
  /** ID da conta bancária */
  contaBancariaId: number;

  /** Nome da conta bancária */
  contaBancariaNome: string;

  /** Saldo atual da conta */
  saldoAtual: number;

  /** Total de entradas projetadas */
  entradasProjetadas: number;

  /** Total de saídas projetadas */
  saidasProjetadas: number;

  /** Saldo projetado ao fim do período */
  saldoProjetado: number;
}

/**
 * Alerta gerado pelo fluxo de caixa
 */
export interface FluxoCaixaAlertaDto {
  /** Tipo do alerta: saldo_minimo, saldo_negativo, concentracao_saidas */
  tipo: string;

  /** Severidade: info, warning, danger */
  severidade: string;

  /** Mensagem descritiva do alerta */
  mensagem: string;

  /** Data referência do alerta (formato: YYYY-MM-DD) */
  data: string;

  /** Valor associado ao alerta */
  valor: number | null;
}

/**
 * Resposta consolidada do fluxo de caixa
 */
export interface FluxoCaixaConsolidadoDto {
  /** Periodicidade utilizada */
  periodicidade: string;

  /** Data de início do período consultado */
  dataInicio: string;

  /** Data de fim do período consultado */
  dataFim: string;

  /** Saldo inicial (realizado) no início do período */
  saldoInicial: number;

  /** Saldo final projetado ao fim do período */
  saldoFinal: number;

  /** Total geral de entradas */
  totalEntradas: number;

  /** Total geral de saídas */
  totalSaidas: number;

  /** Períodos agrupados */
  periodos: FluxoCaixaPeriodoDto[];

  /** Saldos por conta bancária */
  saldosPorConta: FluxoCaixaSaldoContaDto[];

  /** Alertas gerados */
  alertas: FluxoCaixaAlertaDto[];
}
