import { FluxoCaixaConsolidadoDto } from '../../dto/fluxoCaixa';

/**
 * Parâmetros de consulta para cálculo do fluxo de caixa
 */
export interface FluxoCaixaQueryParams {
  dataInicio: string;
  dataFim: string;
  periodicidade: 'diario' | 'semanal' | 'mensal' | 'safra';
  contaBancariaIds?: number[];
  incluirAgreements?: boolean;
  incluirTitulos?: boolean;
  incluirRecorrentes?: boolean;
}

/**
 * Interface para o serviço de cálculo do fluxo de caixa
 *
 * Este serviço é puramente computacional — NUNCA persiste dados.
 * Consulta múltiplas fontes de dados em paralelo, agrega, agrupa por periodicidade
 * e gera alertas.
 */
export interface IFluxoCaixaCalculadorService {
  /**
   * Calcula o fluxo de caixa consolidado (realizado + projetado)
   */
  calcularConsolidado(tenantId: number, params: FluxoCaixaQueryParams): Promise<FluxoCaixaConsolidadoDto>;

  /**
   * Calcula apenas os lançamentos realizados (títulos baixados, despesas/receitas registradas)
   */
  calcularRealizado(tenantId: number, params: FluxoCaixaQueryParams): Promise<FluxoCaixaConsolidadoDto>;

  /**
   * Calcula apenas os lançamentos projetados (títulos em aberto, agreements pendentes)
   */
  calcularProjetado(tenantId: number, params: FluxoCaixaQueryParams): Promise<FluxoCaixaConsolidadoDto>;
}
