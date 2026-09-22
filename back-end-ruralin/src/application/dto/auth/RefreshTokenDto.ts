/**
 * RefreshTokenDto - DTO para renovação de token
 * 
 * DTO usado no endpoint de refresh token para validar o refresh token.
 * 
 * @example
 * ```typescript
 * // POST /api/auth/refresh
 * {
 *   "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 * }
 * ```
 */

import { IsNotEmpty, IsString } from 'class-validator';
import { CreateDto } from '../CreateDto';

export class RefreshTokenDto extends CreateDto {
  /**
   * Refresh token para renovação do token de acesso
   * 
   * Deve ser uma string não vazia contendo o refresh token JWT.
   */
  @IsString({ message: 'Refresh token deve ser uma string' })
  @IsNotEmpty({ message: 'Refresh token é obrigatório' })
  refreshToken!: string;
}
