/**
 * CreateEventoDto - DTO para criação de evento
 * 
 * DTO usado no endpoint de criação de evento com todas as validações necessárias.
 * 
 * @example
 * ```typescript
 * // POST /api/eventos
 * {
 *   "titulo": "Reunião de Planejamento",
 *   "descricao": "Reunião para planejar as atividades do mês",
 *   "data": "2025-01-20",
 *   "horario_inicio": "09:00:00",
 *   "horario_fim": "11:00:00",
 *   "localId": 1
 * }
 * ```
 */

import {
  IsString,
  IsNotEmpty,
  IsDateString,
  Matches,
  IsInt,
  Min,
  ValidateIf,
  Validate,
} from 'class-validator';
import { CreateDto } from '../CreateDto';
import { IsExists } from '../../validators/IsExists';
import { IsTimeAfter } from '../../validators/IsTimeAfter';

export class CreateEventoDto extends CreateDto {
  /**
   * Título do evento
   */
  @IsString({ message: 'Título deve ser uma string' })
  @IsNotEmpty({ message: 'Título é obrigatório' })
  titulo!: string;

  /**
   * Descrição do evento
   */
  @IsString({ message: 'Descrição deve ser uma string' })
  @IsNotEmpty({ message: 'Descrição é obrigatória' })
  descricao!: string;

  /**
   * Data do evento (formato: YYYY-MM-DD)
   */
  @IsDateString({}, { message: 'Data deve ser uma data válida no formato YYYY-MM-DD' })
  @IsNotEmpty({ message: 'Data é obrigatória' })
  data!: string;

  /**
   * Horário de início do evento (formato: HH:mm:ss)
   */
  @IsString({ message: 'Horário de início deve ser uma string' })
  @IsNotEmpty({ message: 'Horário de início é obrigatório' })
  @Matches(/^([0-1][0-9]|2[0-3]):[0-5][0-9]:[0-5][0-9]$/, {
    message: 'Horário de início deve estar no formato HH:mm:ss',
  })
  horario_inicio!: string;

  /**
   * Horário de fim do evento (formato: HH:mm:ss)
   * Deve ser posterior ao horário de início
   */
  @IsString({ message: 'Horário de fim deve ser uma string' })
  @IsNotEmpty({ message: 'Horário de fim é obrigatório' })
  @Matches(/^([0-1][0-9]|2[0-3]):[0-5][0-9]:[0-5][0-9]$/, {
    message: 'Horário de fim deve estar no formato HH:mm:ss',
  })
  @Validate(IsTimeAfter, ['horario_inicio', 'data'])
  horario_fim!: string;

  /**
   * ID do local onde o evento ocorrerá
   * Deve existir no banco de dados
   */
  @IsInt({ message: 'Local ID deve ser um número inteiro' })
  @Min(1, { message: 'Local ID deve ser maior que zero' })
  @IsNotEmpty({ message: 'Local ID é obrigatório' })
  @Validate(IsExists, ['Local', 'id'])
  localId!: number;
}
