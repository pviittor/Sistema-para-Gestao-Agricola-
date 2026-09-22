/**
 * FluxoCaixaSimulacaoItemResponseDto - DTO para resposta de item de simulação
 *
 * @example
 * ```typescript
 * {
 *   "id": 1,
 *   "simulacaoId": 5,
 *   "tipoOverride": "antecipar_recebimento",
 *   "referenciaTipo": "parcela_titulo_receber",
 *   "referenciaId": 42,
 *   "descricao": "Antecipar recebimento da safra",
 *   "tipoFluxo": "entrada",
 *   "dataOriginal": "2026-12-15",
 *   "dataNova": "2026-09-15",
 *   "valorOriginal": 50000,
 *   "valorNovo": 48000,
 *   "contaBancariaId": 1,
 *   "createdAt": "2026-03-10T10:00:00.000Z",
 *   "updatedAt": "2026-03-10T10:00:00.000Z"
 * }
 * ```
 */
export interface FluxoCaixaSimulacaoItemResponseDto {
  /** ID do item de simulação */
  id: number;

  /** ID da simulação pai */
  simulacaoId: number;

  /** Tipo de override aplicado */
  tipoOverride: string;

  /** Tipo da referência original */
  referenciaTipo: string | null;

  /** ID da referência original */
  referenciaId: number | null;

  /** Descrição do item */
  descricao: string;

  /** Tipo de fluxo: entrada ou saida */
  tipoFluxo: string;

  /** Data original do lançamento */
  dataOriginal: string | null;

  /** Nova data proposta */
  dataNova: string | null;

  /** Valor original do lançamento */
  valorOriginal: number | null;

  /** Novo valor proposto */
  valorNovo: number | null;

  /** ID da conta bancária */
  contaBancariaId: number | null;

  /** Data de criação */
  createdAt: Date;

  /** Data de atualização */
  updatedAt: Date;
}
