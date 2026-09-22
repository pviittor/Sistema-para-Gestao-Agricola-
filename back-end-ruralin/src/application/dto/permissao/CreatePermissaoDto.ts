/**
 * CreatePermissaoDto - DTO para criação de permissão
 * 
 * DTO usado no endpoint de criação de permissão com todas as validações necessárias.
 * 
 * @example
 * ```typescript
 * // POST /api/permissoes
 * {
 *   "nome": "usuarios.criar"
 * }
 * ```
 */

import {
  IsString,
  IsNotEmpty,
  MinLength,
  MaxLength,
  Matches,
} from 'class-validator';
import { CreateDto } from '../CreateDto';
import { IsUnique } from '../../validators/IsUnique';

export class CreatePermissaoDto extends CreateDto {
  /**
   * Nome da permissão
   * Formato recomendado: recurso.acao (ex: usuarios.criar, eventos.editar)
   */
  @IsString({ message: 'Nome deve ser uma string' })
  @IsNotEmpty({ message: 'Nome é obrigatório' })
  @MinLength(3, { message: 'Nome deve ter no mínimo 3 caracteres' })
  @MaxLength(100, { message: 'Nome deve ter no máximo 100 caracteres' })
  @Matches(/^[a-z0-9._-]+$/, {
    message: 'Nome deve conter apenas letras minúsculas, números, pontos, underscores e hífens',
  })
  @IsUnique('Permissao', 'nome', undefined, { message: 'Nome da permissão já está em uso' })
  nome!: string;
}
