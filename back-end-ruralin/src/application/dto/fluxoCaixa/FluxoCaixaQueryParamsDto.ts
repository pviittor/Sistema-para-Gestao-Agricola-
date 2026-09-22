/**
 * FluxoCaixaQueryParamsDto - DTO para parâmetros de consulta do fluxo de caixa consolidado
 *
 * @example
 * ```typescript
 * // GET /api/fluxo-caixa?dataInicio=2026-03-01&dataFim=2026-06-30&periodicidade=mensal
 * ```
 */

import {
  IsNotEmpty,
  IsOptional,
  IsString,
  IsDateString,
  IsArray,
  IsIn,
} from 'class-validator';

export class FluxoCaixaQueryParamsDto {
  /**
   * Data de início do período consultado (formato: YYYY-MM-DD)
   */
  @IsDateString({}, { message: 'Data de início deve ser uma data válida no formato YYYY-MM-DD' })
  @IsNotEmpty({ message: 'Data de início é obrigatória' })
  dataInicio!: string;

  /**
   * Data de fim do período consultado (formato: YYYY-MM-DD)
   */
  @IsDateString({}, { message: 'Data de fim deve ser uma data válida no formato YYYY-MM-DD' })
  @IsNotEmpty({ message: 'Data de fim é obrigatória' })
  dataFim!: string;

  /**
   * Periodicidade de agrupamento: diario, semanal, mensal ou safra
   */
  @IsString({ message: 'Periodicidade deve ser uma string' })
  @IsNotEmpty({ message: 'Periodicidade é obrigatória' })
  @IsIn(['diario', 'semanal', 'mensal', 'safra'], {
    message: 'Periodicidade deve ser: diario, semanal, mensal ou safra',
  })
  periodicidade!: string;

  /**
   * IDs das contas bancárias para filtro (opcional)
   */
  @IsArray({ message: 'Contas bancárias IDs deve ser um array' })
  @IsOptional()
  contaBancariaIds?: number[];
}
