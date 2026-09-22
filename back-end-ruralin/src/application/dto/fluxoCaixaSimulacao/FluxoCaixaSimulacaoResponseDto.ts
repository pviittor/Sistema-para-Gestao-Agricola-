/**
 * FluxoCaixaSimulacaoResponseDto - DTO para resposta de simulação de fluxo de caixa
 *
 * @example
 * ```typescript
 * // GET /api/fluxo-caixa/simulacoes/:id
 * {
 *   "id": 1,
 *   "tenantId": 1,
 *   "nome": "Simulação Safra 2026/2027",
 *   "descricao": "Projeção com antecipação de recebíveis",
 *   "dataInicio": "2026-07-01",
 *   "dataFim": "2027-06-30",
 *   "status": "rascunho",
 *   "itens": [...],
 *   "createdAt": "2026-03-10T10:00:00.000Z",
 *   "updatedAt": "2026-03-10T10:00:00.000Z"
 * }
 * ```
 */

import { FluxoCaixaSimulacaoItemResponseDto } from './FluxoCaixaSimulacaoItemResponseDto';

export interface FluxoCaixaSimulacaoResponseDto {
  /** ID da simulação */
  id: number;

  /** ID do tenant */
  tenantId: number;

  /** Nome da simulação */
  nome: string;

  /** Descrição da simulação */
  descricao: string | null;

  /** Data de início do período simulado */
  dataInicio: string;

  /** Data de fim do período simulado */
  dataFim: string;

  /** Status da simulação: rascunho, salvo ou arquivado */
  status: string;

  /** Data de criação */
  createdAt: Date;

  /** Data de atualização */
  updatedAt: Date;
}

/**
 * Resposta detalhada de simulação (com itens)
 */
export interface FluxoCaixaSimulacaoDetailResponseDto extends FluxoCaixaSimulacaoResponseDto {
  /** Itens de override da simulação */
  itens?: FluxoCaixaSimulacaoItemResponseDto[] | null;
}
