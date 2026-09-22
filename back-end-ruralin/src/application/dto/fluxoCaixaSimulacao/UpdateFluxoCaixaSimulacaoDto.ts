/**
 * UpdateFluxoCaixaSimulacaoDto - DTO para atualização de simulação de fluxo de caixa
 *
 * Todos os campos são opcionais, permitindo atualizações parciais.
 *
 * @example
 * ```typescript
 * // PUT /api/fluxo-caixa/simulacoes/:id
 * {
 *   "nome": "Simulação Safra 2026/2027 - Revisado",
 *   "status": "salvo"
 * }
 * ```
 */

import {
  IsOptional,
  IsString,
  IsDateString,
  IsIn,
  MinLength,
  MaxLength,
} from 'class-validator';

export class UpdateFluxoCaixaSimulacaoDto {
  /**
   * Nome da simulação
   */
  @IsString({ message: 'Nome deve ser uma string' })
  @MinLength(3, { message: 'Nome deve ter no mínimo 3 caracteres' })
  @MaxLength(255, { message: 'Nome deve ter no máximo 255 caracteres' })
  @IsOptional()
  nome?: string;

  /**
   * Descrição da simulação
   */
  @IsString({ message: 'Descrição deve ser uma string' })
  @MaxLength(1000, { message: 'Descrição deve ter no máximo 1000 caracteres' })
  @IsOptional()
  descricao?: string;

  /**
   * Data de início do período simulado (formato: YYYY-MM-DD)
   */
  @IsDateString({}, { message: 'Data de início deve ser uma data válida no formato YYYY-MM-DD' })
  @IsOptional()
  dataInicio?: string;

  /**
   * Data de fim do período simulado (formato: YYYY-MM-DD)
   */
  @IsDateString({}, { message: 'Data de fim deve ser uma data válida no formato YYYY-MM-DD' })
  @IsOptional()
  dataFim?: string;

  /**
   * Status da simulação: rascunho, salvo ou arquivado
   */
  @IsString({ message: 'Status deve ser uma string' })
  @IsIn(['rascunho', 'salvo', 'arquivado'], {
    message: 'Status deve ser: rascunho, salvo ou arquivado',
  })
  @IsOptional()
  status?: string;
}
