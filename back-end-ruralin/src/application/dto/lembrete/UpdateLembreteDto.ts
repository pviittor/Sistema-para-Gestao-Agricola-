/**
 * UpdateLembreteDto - DTO para atualização de lembrete
 * 
 * DTO usado no endpoint de atualização de lembrete.
 * Todos os campos são opcionais, permitindo atualizações parciais.
 * 
 * @example
 * ```typescript
 * // PUT /api/lembretes/:id
 * {
 *   "desc_simples": "Reunião Atualizada",
 *   "lembrete_data_hora": [
 *     {
 *       "data": "2025-01-21",
 *       "horario": "10:00:00"
 *     }
 *   ]
 * }
 * ```
 */

import {
  IsString,
  IsOptional,
  IsArray,
  ValidateNested,
  ArrayMinSize,
} from 'class-validator';
import { Type } from 'class-transformer';
import { UpdateDto } from '../UpdateDto';
import { UpdateLembreteDataHoraDto } from './UpdateLembreteDataHoraDto';

export class UpdateLembreteDto extends UpdateDto {
  /**
   * Descrição simples do lembrete
   */
  @IsString({ message: 'Descrição simples deve ser uma string' })
  @IsOptional()
  desc_simples?: string;

  /**
   * Descrição completa do lembrete
   */
  @IsString({ message: 'Descrição completa deve ser uma string' })
  @IsOptional()
  desc_completa?: string;

  /**
   * Array de datas e horários do lembrete (opcional)
   */
  @IsArray({ message: 'Lembrete data hora deve ser um array' })
  @IsOptional()
  @ArrayMinSize(1, { message: 'Lembrete data hora deve ter pelo menos um item se fornecido' })
  @ValidateNested({ each: true })
  @Type(() => UpdateLembreteDataHoraDto)
  lembrete_data_hora?: UpdateLembreteDataHoraDto[];
}
