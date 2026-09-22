/**
 * CreateLocalDto - DTO para criação de local
 * 
 * DTO usado no endpoint de criação de local com todas as validações necessárias.
 * 
 * @example
 * ```typescript
 * // POST /api/locais
 * {
 *   "desc_simples": "Sala de Reuniões",
 *   "desc_completa": "Sala de reuniões principal no primeiro andar, capacidade para 20 pessoas"
 * }
 * ```
 */

import {
  IsString,
  IsNotEmpty,
  MinLength,
  MaxLength,
} from 'class-validator';
import { CreateDto } from '../CreateDto';

export class CreateLocalDto extends CreateDto {
  /**
   * Descrição simples do local
   */
  @IsString({ message: 'Descrição simples deve ser uma string' })
  @IsNotEmpty({ message: 'Descrição simples é obrigatória' })
  @MinLength(3, { message: 'Descrição simples deve ter no mínimo 3 caracteres' })
  @MaxLength(255, { message: 'Descrição simples deve ter no máximo 255 caracteres' })
  desc_simples!: string;

  /**
   * Descrição completa do local
   */
  @IsString({ message: 'Descrição completa deve ser uma string' })
  @IsNotEmpty({ message: 'Descrição completa é obrigatória' })
  @MinLength(10, { message: 'Descrição completa deve ter no mínimo 10 caracteres' })
  desc_completa!: string;
}
