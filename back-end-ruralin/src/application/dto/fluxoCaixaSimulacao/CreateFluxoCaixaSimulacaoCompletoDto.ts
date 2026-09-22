/**
 * CreateFluxoCaixaSimulacaoCompletoDto - DTO para criação atômica de simulação com itens
 *
 * Estende CreateFluxoCaixaSimulacaoDto adicionando a coleção de itens opcional.
 * O serviço cria a simulação pai e os itens filhos em uma única transação.
 *
 * @example
 * ```typescript
 * // POST /api/fluxo-caixa/simulacoes/completo
 * {
 *   "nome": "Simulação Safra 2026/2027",
 *   "dataInicio": "2026-07-01",
 *   "dataFim": "2027-06-30",
 *   "itens": [
 *     {
 *       "tipoOverride": "antecipar_recebimento",
 *       "descricao": "Antecipar recebimento",
 *       "tipoFluxo": "entrada",
 *       "valorOriginal": 50000,
 *       "valorNovo": 48000
 *     }
 *   ]
 * }
 * ```
 */

import { IsArray, IsOptional, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { CreateFluxoCaixaSimulacaoDto } from './CreateFluxoCaixaSimulacaoDto';
import { FluxoCaixaSimulacaoItemSemIdDto } from './FluxoCaixaSimulacaoItemSemIdDto';

export class CreateFluxoCaixaSimulacaoCompletoDto extends CreateFluxoCaixaSimulacaoDto {
  /**
   * Lista de itens de override da simulação (opcional na criação)
   */
  @IsArray({ message: 'Itens deve ser um array' })
  @ValidateNested({ each: true })
  @Type(() => FluxoCaixaSimulacaoItemSemIdDto)
  @IsOptional()
  itens?: FluxoCaixaSimulacaoItemSemIdDto[];
}
