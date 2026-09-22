/**
 * CreateRoleDto - DTO para criação de role
 * 
 * DTO usado no endpoint de criação de role com todas as validações necessárias.
 * 
 * @example
 * ```typescript
 * // POST /api/roles
 * {
 *   "nome": "Administrador"
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
import { IsUnique } from '../../validators/IsUnique';

export class CreateRoleDto extends CreateDto {
  /**
   * Nome da role
   */
  @IsString({ message: 'Nome deve ser uma string' })
  @IsNotEmpty({ message: 'Nome é obrigatório' })
  @MinLength(3, { message: 'Nome deve ter no mínimo 3 caracteres' })
  @MaxLength(100, { message: 'Nome deve ter no máximo 100 caracteres' })
  @IsUnique('Role', 'nome', undefined, { message: 'Nome da role já está em uso' })
  nome!: string;
}
