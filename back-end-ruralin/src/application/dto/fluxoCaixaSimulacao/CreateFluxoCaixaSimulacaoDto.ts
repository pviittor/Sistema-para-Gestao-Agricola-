/**
 * CreateFluxoCaixaSimulacaoDto - DTO para criação de simulação de fluxo de caixa
 *
 * @example
 * ```typescript
 * // POST /api/fluxo-caixa/simulacoes
 * {
 *   "nome": "Simulação Safra 2026/2027",
 *   "descricao": "Projeção de fluxo com antecipação de recebíveis",
 *   "dataInicio": "2026-07-01",
 *   "dataFim": "2027-06-30"
 * }
 * ```
 */

import {
  IsNotEmpty,
  IsOptional,
  IsString,
  IsDateString,
  MinLength,
  MaxLength,
} from 'class-validator';

export class CreateFluxoCaixaSimulacaoDto {
  /**
   * Nome da simulação
   */
  @IsString({ message: 'Nome deve ser uma string' })
  @IsNotEmpty({ message: 'Nome é obrigatório' })
  @MinLength(3, { message: 'Nome deve ter no mínimo 3 caracteres' })
  @MaxLength(255, { message: 'Nome deve ter no máximo 255 caracteres' })
  nome!: string;

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
  @IsNotEmpty({ message: 'Data de início é obrigatória' })
  dataInicio!: string;

  /**
   * Data de fim do período simulado (formato: YYYY-MM-DD)
   * Deve ser posterior a dataInicio (validado no serviço)
   */
  @IsDateString({}, { message: 'Data de fim deve ser uma data válida no formato YYYY-MM-DD' })
  @IsNotEmpty({ message: 'Data de fim é obrigatória' })
  dataFim!: string;
}
