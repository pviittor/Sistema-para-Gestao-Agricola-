/**
 * FluxoCaixaConfiguracaoResponseDto - DTO para resposta de configuração do fluxo de caixa
 *
 * @example
 * ```typescript
 * // GET /api/fluxo-caixa/configuracao
 * {
 *   "id": 1,
 *   "tenantId": 1,
 *   "saldoMinimoAlerta": 5000,
 *   "diasProjecaoPadrao": 90,
 *   "periodicidadePadrao": "mensal",
 *   "incluirAgreements": true,
 *   "incluirTitulos": true,
 *   "incluirRecorrentes": true,
 *   "contasBancariasFiltro": [1, 3],
 *   "coresConfiguracao": { "entrada": "#16a34a", "saida": "#dc2626", "saldo": "#2563eb" },
 *   "createdAt": "2026-03-10T10:00:00.000Z",
 *   "updatedAt": "2026-03-10T10:00:00.000Z"
 * }
 * ```
 */
export interface FluxoCaixaConfiguracaoResponseDto {
  /** ID da configuração */
  id: number;

  /** ID do tenant */
  tenantId: number;

  /** Saldo mínimo para disparo de alertas */
  saldoMinimoAlerta: number;

  /** Dias padrão para projeção do fluxo de caixa */
  diasProjecaoPadrao: number;

  /** Periodicidade padrão de agrupamento */
  periodicidadePadrao: string;

  /** Incluir agreements na projeção */
  incluirAgreements: boolean;

  /** Incluir títulos a pagar/receber na projeção */
  incluirTitulos: boolean;

  /** Incluir lançamentos recorrentes na projeção */
  incluirRecorrentes: boolean;

  /** IDs das contas bancárias para filtro (null = todas) */
  contasBancariasFiltro: number[] | null;

  /** Configuração de cores para gráficos */
  coresConfiguracao: { entrada: string; saida: string; saldo: string } | null;

  /** Data de criação */
  createdAt: Date;

  /** Data de atualização */
  updatedAt: Date;
}
