/**
 * CreateLoginDto - DTO para autenticação de usuário
 * 
 * DTO usado no endpoint de login para validar email e senha.
 * 
 * @example
 * ```typescript
 * // POST /api/auth/login
 * {
 *   "email": "usuario@example.com",
 *   "senha": "senha123"
 * }
 * ```
 */

import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';
import { CreateDto } from '../CreateDto';

export class CreateLoginDto extends CreateDto {
  /**
   * Email do usuário
   * 
   * Deve ser um email válido e não pode estar vazio.
   */
  @IsEmail({}, { message: 'Email deve ser um email válido' })
  @IsNotEmpty({ message: 'Email é obrigatório' })
  email!: string;

  /**
   * Senha do usuário
   * 
   * Deve ter no mínimo 6 caracteres e não pode estar vazia.
   */
  @IsString({ message: 'Senha deve ser uma string' })
  @IsNotEmpty({ message: 'Senha é obrigatória' })
  @MinLength(6, { message: 'Senha deve ter no mínimo 6 caracteres' })
  senha!: string;
}
