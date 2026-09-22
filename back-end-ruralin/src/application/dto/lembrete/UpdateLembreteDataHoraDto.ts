/**
 * UpdateLembreteDataHoraDto - DTO para atualização de data/hora de lembrete
 * 
 * DTO usado para atualizar datas e horários associados a um lembrete.
 * 
 * @example
 * ```typescript
 * {
 *   "dia": "Terça-feira",
 *   "data": "2025-01-21",
 *   "horario": "10:00:00"
 * }
 * ```
 */

import {
  IsString,
  IsOptional,
  IsDateString,
  Matches,
} from 'class-validator';

export class UpdateLembreteDataHoraDto {
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
   * Horário do lembrete (formato: HH:mm:ss) (opcional)
   */
  @IsString({ message: 'Horário deve ser uma string' })
  @IsOptional()
  @Matches(/^([0-1][0-9]|2[0-3]):[0-5][0-9]:[0-5][0-9]$/, {
    message: 'Horário deve estar no formato HH:mm:ss',
  })
  horario?: string;
}
