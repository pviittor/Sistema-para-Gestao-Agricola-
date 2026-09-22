/**
 * UpdateRoleDto - DTO para atualização de role
 * 
 * DTO usado no endpoint de atualização de role.
 * Todos os campos são opcionais, permitindo atualizações parciais.
 * 
 * @example
 * ```typescript
 * // PUT /api/roles/:id
 * {
 *   "nome": "Administrador Atualizado"
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
import { IsUnique } from '../../validators/IsUnique';

export class UpdateRoleDto extends UpdateDto {
  /**
   * Nome da role
   */
  @IsString({ message: 'Nome deve ser uma string' })
  @IsOptional()
  @MinLength(3, { message: 'Nome deve ter no mínimo 3 caracteres' })
  @MaxLength(100, { message: 'Nome deve ter no máximo 100 caracteres' })
  @IsUnique('Role', 'nome', 'id', { message: 'Nome da role já está em uso' })
  nome?: string;
}
