/**
 * CreateLembreteDto - DTO para criação de lembrete
 * 
 * DTO usado no endpoint de criação de lembrete com todas as validações necessárias.
 * 
 * @example
 * ```typescript
 * // POST /api/lembretes
 * {
 *   "desc_simples": "Reunião importante",
 *   "desc_completa": "Reunião com a equipe para discutir o planejamento do próximo trimestre",
 *   "lembrete_data_hora": [
 *     {
 *       "dia": "Segunda-feira",
 *       "data": "2025-01-20",
 *       "horario": "09:00:00"
 *     },
 *     {
 *       "data": "2025-01-25",
 *       "horario": "14:00:00"
 *     }
 *   ]
 * }
 * ```
 */

import {
  IsString,
  IsNotEmpty,
  IsArray,
  IsOptional,
  ValidateNested,
  ArrayMinSize,
} from 'class-validator';
import { Type } from 'class-transformer';
import { CreateDto } from '../CreateDto';
import { CreateLembreteDataHoraDto } from './CreateLembreteDataHoraDto';

export class CreateLembreteDto extends CreateDto {
  /**
   * Descrição simples do lembrete
   */
  @IsString({ message: 'Descrição simples deve ser uma string' })
  @IsNotEmpty({ message: 'Descrição simples é obrigatória' })
  desc_simples!: string;

  /**
   * Descrição completa do lembrete
   */
  @IsString({ message: 'Descrição completa deve ser uma string' })
  @IsNotEmpty({ message: 'Descrição completa é obrigatória' })
  desc_completa!: string;

  /**
   * Array de datas e horários do lembrete (opcional)
   */
  @IsArray({ message: 'Lembrete data hora deve ser um array' })
  @IsOptional()
  @ArrayMinSize(1, { message: 'Lembrete data hora deve ter pelo menos um item se fornecido' })
  @ValidateNested({ each: true })
  @Type(() => CreateLembreteDataHoraDto)
  lembrete_data_hora?: CreateLembreteDataHoraDto[];
}
