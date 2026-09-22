/**
 * UpdateEventoDto - DTO para atualização de evento
 * 
 * DTO usado no endpoint de atualização de evento.
 * Todos os campos são opcionais, permitindo atualizações parciais.
 * 
 * @example
 * ```typescript
 * // PUT /api/eventos/:id
 * {
 *   "titulo": "Reunião Atualizada",
 *   "data": "2025-01-21"
 * }
 * ```
 */

import {
  IsString,
  IsOptional,
  IsDateString,
  Matches,
  IsInt,
  Min,
  ValidateIf,
  Validate,
} from 'class-validator';
import { UpdateDto } from '../UpdateDto';
import { IsExists } from '../../validators/IsExists';
import { IsTimeAfter } from '../../validators/IsTimeAfter';

export class UpdateEventoDto extends UpdateDto {
  /**
   * Título do evento
   */
  @IsString({ message: 'Título deve ser uma string' })
  @IsOptional()
  titulo?: string;

  /**
   * Descrição do evento
   */
  @IsString({ message: 'Descrição deve ser uma string' })
  @IsOptional()
  descricao?: string;

  /**
   * Data do evento (formato: YYYY-MM-DD)
   */
  @IsDateString({}, { message: 'Data deve ser uma data válida no formato YYYY-MM-DD' })
  @IsOptional()
  data?: string;

  /**
   * Horário de início do evento (formato: HH:mm:ss)
   */
  @IsString({ message: 'Horário de início deve ser uma string' })
  @IsOptional()
  @Matches(/^([0-1][0-9]|2[0-3]):[0-5][0-9]:[0-5][0-9]$/, {
    message: 'Horário de início deve estar no formato HH:mm:ss',
  })
  horario_inicio?: string;

  /**
   * Horário de fim do evento (formato: HH:mm:ss)
   * Se fornecido junto com horario_inicio, deve ser posterior ao horário de início
   */
  @IsString({ message: 'Horário de fim deve ser uma string' })
  @IsOptional()
  @Matches(/^([0-1][0-9]|2[0-3]):[0-5][0-9]:[0-5][0-9]$/, {
    message: 'Horário de fim deve estar no formato HH:mm:ss',
  })
  @ValidateIf((o) => o.horario_fim !== undefined && (o.horario_inicio !== undefined || o.data !== undefined))
  @Validate(IsTimeAfter, ['horario_inicio', 'data'])
  horario_fim?: string;

  /**
   * ID do local onde o evento ocorrerá
   * Deve existir no banco de dados
   */
  @IsInt({ message: 'Local ID deve ser um número inteiro' })
  @Min(1, { message: 'Local ID deve ser maior que zero' })
  @IsOptional()
  @ValidateIf((o) => o.localId !== undefined)
  @Validate(IsExists, ['Local', 'id'])
  localId?: number;
}
