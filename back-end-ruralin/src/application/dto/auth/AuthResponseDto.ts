/**
 * AuthResponseDto - DTO para resposta de autenticação
 * 
 * DTO usado para tipar a resposta dos endpoints de autenticação.
 * Não é usado para validação, apenas para documentação e tipagem.
 * 
 * @example
 * ```typescript
 * // Resposta do POST /api/auth/login
 * {
 *   "user": {
 *     "id": 1,
 *     "email": "usuario@example.com",
 *     "nome": "João Silva",
 *     "apiUrl": "https://api.example.com"
 *   },
 *   "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
 *   "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 * }
 * ```
 */

/**
 * Informações do usuário autenticado
 */
export interface AuthUserDto {
  /**
   * ID do usuário
   */
  id: number;

  /**
   * Email do usuário
   */
  email: string;

  /**
   * Nome do usuário
   */
  nome: string;

  /**
   * URL da API do usuário (se aplicável)
   */
  apiUrl?: string;
}

/**
 * Resposta completa de autenticação (login)
 */
export interface AuthResponseDto {
  /**
   * Informações do usuário autenticado
   */
  user: AuthUserDto;

  /**
   * Token JWT de acesso (expira em 15 minutos)
   */
  token: string;

  /**
   * Refresh token para renovação (expira em 7 dias)
   */
  refreshToken: string;
}

/**
 * Resposta de renovação de token
 */
export interface RefreshResponseDto {
  /**
   * Novo token JWT de acesso (expira em 15 minutos)
   */
  token: string;

  /**
   * Novo refresh token (expira em 7 dias)
   */
  refreshToken: string;
}
