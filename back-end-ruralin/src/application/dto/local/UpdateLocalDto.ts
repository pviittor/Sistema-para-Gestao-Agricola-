/**
 * UpdateLocalDto - DTO para atualização de local
 * 
 * DTO usado no endpoint de atualização de local.
 * Todos os campos são opcionais, permitindo atualizações parciais.
 * 
 * @example
 * ```typescript
 * // PUT /api/locais/:id
 * {
 *   "desc_simples": "Sala Atualizada",
 *   "desc_completa": "Nova descrição completa do local"
 * }
 * ```
 */

import {
  IsString,
  IsOptional,
  MinLength,
  MaxLength,
} from 'class-validator';
import { UpdateDto } from '../UpdateDto';

export class UpdateLocalDto extends UpdateDto {
  /**
   * Descrição simples do local
   */
  @IsString({ message: 'Descrição simples deve ser uma string' })
  @IsOptional()
  @MinLength(3, { message: 'Descrição simples deve ter no mínimo 3 caracteres' })
  @MaxLength(255, { message: 'Descrição simples deve ter no máximo 255 caracteres' })
  desc_simples?: string;

  /**
   * Descrição completa do local
   */
  @IsString({ message: 'Descrição completa deve ser uma string' })
  @IsOptional()
  @MinLength(10, { message: 'Descrição completa deve ter no mínimo 10 caracteres' })
  desc_completa?: string;
}
