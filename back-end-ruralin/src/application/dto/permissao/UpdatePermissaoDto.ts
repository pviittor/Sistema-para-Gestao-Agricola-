/**
 * UpdatePermissaoDto - DTO para atualização de permissão
 * 
 * DTO usado no endpoint de atualização de permissão.
 * Todos os campos são opcionais, permitindo atualizações parciais.
 * 
 * @example
 * ```typescript
 * // PUT /api/permissoes/:id
 * {
 *   "nome": "usuarios.atualizar"
 * }
 * ```
 */

import {
  IsString,
  IsOptional,
  MinLength,
  MaxLength,
  Matches,
} from 'class-validator';
import { UpdateDto } from '../UpdateDto';
import { IsUnique } from '../../validators/IsUnique';

export class UpdatePermissaoDto extends UpdateDto {
  /**
   * Nome da permissão
   * Formato recomendado: recurso.acao (ex: usuarios.criar, eventos.editar)
   */
  @IsString({ message: 'Nome deve ser uma string' })
  @IsOptional()
  @MinLength(3, { message: 'Nome deve ter no mínimo 3 caracteres' })
  @MaxLength(100, { message: 'Nome deve ter no máximo 100 caracteres' })
  @Matches(/^[a-z0-9._-]+$/, {
    message: 'Nome deve conter apenas letras minúsculas, números, pontos, underscores e hífens',
  })
  @IsUnique('Permissao', 'nome', 'id', { message: 'Nome da permissão já está em uso' })
  nome?: string;
}
