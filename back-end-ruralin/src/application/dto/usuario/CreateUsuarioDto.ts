/**
 * CreateUsuarioDto - DTO para criação de usuário
 * 
 * DTO usado no endpoint de criação de usuário com todas as validações necessárias.
 * 
 * @example
 * ```typescript
 * // POST /api/usuarios
 * {
 *   "nome": "João Silva",
 *   "username": "joao.silva",
 *   "email": "joao@example.com",
 *   "senha": "Senha123",
 *   "whatsapp": "+5511999999999",
 *   "tipo": "ROOT",
 *   "apiKey": "key123",
 *   "apiUrl": "https://api.example.com",
 *   "roleIds": [1, 2]
 * }
 * ```
 */

import {
  IsString,
  IsEmail,
  IsNotEmpty,
  MinLength,
  Matches,
  IsEnum,
  IsArray,
  IsOptional,
  ArrayMinSize,
  IsInt,
} from 'class-validator';
import { CreateDto } from '../CreateDto';
import { IsUnique } from '../../validators/IsUnique';

/**
 * Tipos de usuário disponíveis
 */
export enum UsuarioTipo {
  ROOT = 'ROOT',
  CLIENT = 'CLIENT',
}

export class CreateUsuarioDto extends CreateDto {
  /**
   * Nome completo do usuário
   */
  @IsString({ message: 'Nome deve ser uma string' })
  @IsNotEmpty({ message: 'Nome é obrigatório' })
  nome!: string;

  /**
   * Email do usuário (deve ser único)
   */
  @IsEmail({}, { message: 'Email deve ser um email válido' })
  @IsNotEmpty({ message: 'Email é obrigatório' })
  @IsUnique('Usuario', 'email', undefined, { message: 'Email já está em uso' })
  email!: string;

  /**
   * Username do usuário (deve ser único)
   */
  @IsString({ message: 'Username deve ser uma string' })
  @IsNotEmpty({ message: 'Username é obrigatório' })
  @IsUnique('Usuario', 'username', undefined, { message: 'Username já está em uso' })
  username!: string;

  /**
   * Senha do usuário
   * 
   * Deve ter no mínimo 8 caracteres e conter:
   * - Pelo menos uma letra minúscula
   * - Pelo menos uma letra maiúscula
   * - Pelo menos um número
   */
  @IsString({ message: 'Senha deve ser uma string' })
  @IsNotEmpty({ message: 'Senha é obrigatória' })
  @MinLength(8, { message: 'Senha deve ter no mínimo 8 caracteres' })
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, {
    message: 'Senha deve conter pelo menos uma letra maiúscula, uma minúscula e um número',
  })
  senha!: string;

  /**
   * Número de WhatsApp
   */
  @IsString({ message: 'WhatsApp deve ser uma string' })
  @IsNotEmpty({ message: 'WhatsApp é obrigatório' })
  whatsapp!: string;

  /**
   * Tipo do usuário (ROOT ou CLIENT)
   */
  @IsEnum(UsuarioTipo, { message: 'Tipo deve ser ROOT ou CLIENT' })
  @IsNotEmpty({ message: 'Tipo é obrigatório' })
  tipo!: UsuarioTipo;

  /**
   * API Key do usuário
   */
  @IsString({ message: 'API Key deve ser uma string' })
  @IsNotEmpty({ message: 'API Key é obrigatória' })
  apiKey!: string;

  /**
   * URL da API do usuário
   */
  @IsString({ message: 'API URL deve ser uma string' })
  @IsNotEmpty({ message: 'API URL é obrigatória' })
  apiUrl!: string;

  /**
   * IDs das roles associadas ao usuário (opcional)
   */
  @IsArray({ message: 'Role IDs deve ser um array' })
  @IsOptional()
  @IsInt({ each: true, message: 'Cada Role ID deve ser um número inteiro' })
  roleIds?: number[];
}
