/**
 * CreateLembreteDataHoraDto - DTO para criação de data/hora de lembrete
 * 
 * DTO usado para criar datas e horários associados a um lembrete.
 * 
 * @example
 * ```typescript
 * {
 *   "dia": "Segunda-feira",
 *   "data": "2025-01-20",
 *   "horario": "09:00:00"
 * }
 * ```
 */

import {
  IsString,
  IsOptional,
  IsDateString,
  Matches,
  IsNotEmpty,
} from 'class-validator';

export class CreateLembreteDataHoraDto {
  /**
   * Dia da semana (opcional)
   */
  @IsString({ message: 'Dia deve ser uma string' })
  @IsOptional()
  dia?: string;

  /**
   * Data do lembrete (formato: YYYY-MM-DD) (opcional)
   */
  @IsDateString({}, { message: 'Data deve ser uma data válida no formato YYYY-MM-DD' })
  @IsOptional()
  data?: string;

  /**
   * Horário do lembrete (formato: HH:mm:ss)
   */
  @IsString({ message: 'Horário deve ser uma string' })
  @IsNotEmpty({ message: 'Horário é obrigatório' })
  @Matches(/^([0-1][0-9]|2[0-3]):[0-5][0-9]:[0-5][0-9]$/, {
    message: 'Horário deve estar no formato HH:mm:ss',
  })
  horario!: string;
}
