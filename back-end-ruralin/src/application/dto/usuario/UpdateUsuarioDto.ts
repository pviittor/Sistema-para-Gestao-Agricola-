/**
 * UpdateUsuarioDto - DTO para atualização de usuário
 * 
 * DTO usado no endpoint de atualização de usuário.
 * Todos os campos são opcionais, permitindo atualizações parciais.
 * 
 * @example
 * ```typescript
 * // PUT /api/usuarios/:id
 * {
 *   "nome": "João Silva Atualizado",
 *   "email": "novoemail@example.com"
 * }
 * ```
 */

import {
  IsString,
  IsEmail,
  IsOptional,
  MinLength,
  Matches,
  IsEnum,
  IsArray,
  IsInt,
} from 'class-validator';
import { UpdateDto } from '../UpdateDto';
import { IsUnique } from '../../validators/IsUnique';
import { UsuarioTipo } from './CreateUsuarioDto';

export class UpdateUsuarioDto extends UpdateDto {
  /**
   * Nome completo do usuário
   */
  @IsString({ message: 'Nome deve ser uma string' })
  @IsOptional()
  nome?: string;

  /**
   * Email do usuário (deve ser único, excluindo o próprio registro)
   */
  @IsEmail({}, { message: 'Email deve ser um email válido' })
  @IsOptional()
  @IsUnique('Usuario', 'email', 'id', { message: 'Email já está em uso' })
  email?: string;

  /**
   * Username do usuário (deve ser único, excluindo o próprio registro)
   */
  @IsString({ message: 'Username deve ser uma string' })
  @IsOptional()
  @IsUnique('Usuario', 'username', 'id', { message: 'Username já está em uso' })
  username?: string;

  /**
   * Senha do usuário
   * 
   * Se fornecida, deve ter no mínimo 8 caracteres e conter:
   * - Pelo menos uma letra minúscula
   * - Pelo menos uma letra maiúscula
   * - Pelo menos um número
   */
  @IsString({ message: 'Senha deve ser uma string' })
  @IsOptional()
  @MinLength(8, { message: 'Senha deve ter no mínimo 8 caracteres' })
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, {
    message: 'Senha deve conter pelo menos uma letra maiúscula, uma minúscula e um número',
  })
  senha?: string;

  /**
   * Número de WhatsApp
   */
  @IsString({ message: 'WhatsApp deve ser uma string' })
  @IsOptional()
  whatsapp?: string;

  /**
   * Tipo do usuário (ROOT ou CLIENT)
   */
  @IsEnum(UsuarioTipo, { message: 'Tipo deve ser ROOT ou CLIENT' })
  @IsOptional()
  tipo?: UsuarioTipo;

  /**
   * API Key do usuário
   */
  @IsString({ message: 'API Key deve ser uma string' })
  @IsOptional()
  apiKey?: string;

  /**
   * URL da API do usuário
   */
  @IsString({ message: 'API URL deve ser uma string' })
  @IsOptional()
  apiUrl?: string;

  /**
   * IDs das roles associadas ao usuário
   */
  @IsArray({ message: 'Role IDs deve ser um array' })
  @IsOptional()
  @IsInt({ each: true, message: 'Cada Role ID deve ser um número inteiro' })
  roleIds?: number[];
}
