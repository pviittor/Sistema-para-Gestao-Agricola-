/**
 * UsuarioResponseDto - DTO para resposta de usuário
 * 
 * DTO usado para tipar respostas de endpoints de usuário.
 * Não inclui senha por segurança.
 * 
 * @example
 * ```typescript
 * // GET /api/usuarios/:id
 * {
 *   "id": 1,
 *   "nome": "João Silva",
 *   "username": "joao.silva",
 *   "email": "joao@example.com",
 *   "whatsapp": "+5511999999999",
 *   "tipo": "ROOT",
 *   "apiKey": "key123",
 *   "apiUrl": "https://api.example.com",
 *   "roleIds": [1, 2],
 *   "roles": [...],
 *   "subUsuarios": [...],
 *   "createdAt": "2025-01-14T10:00:00.000Z",
 *   "updatedAt": "2025-01-14T10:00:00.000Z"
 * }
 * ```
 */

import { UsuarioTipo } from './CreateUsuarioDto';

/**
 * Informações básicas do usuário (sem relacionamentos)
 */
export interface UsuarioResponseDto {
  /**
   * ID do usuário
   */
  id: number;

  /**
   * Nome completo do usuário
   */
  nome: string;

  /**
   * Username do usuário
   */
  username: string;

  /**
   * Email do usuário
   */
  email: string;

  /**
   * Número de WhatsApp
   */
  whatsapp: string;

  /**
   * Tipo do usuário
   */
  tipo: UsuarioTipo;

  /**
   * API Key do usuário
   */
  apiKey: string;

  /**
   * URL da API do usuário
   */
  apiUrl: string;

  /**
   * IDs das roles associadas
   */
  roleIds?: number[];

  /**
   * Data de criação
   */
  createdAt: Date;

  /**
   * Data de atualização
   */
  updatedAt: Date;
}

/**
 * Resposta completa de usuário (com relacionamentos)
 */
export interface UsuarioDetailResponseDto extends UsuarioResponseDto {
  /**
   * Roles associadas ao usuário
   */
  roles?: Array<{
    id: number;
    nome: string;
    [key: string]: any;
  }>;

  /**
   * Sub-usuários associados
   */
  subUsuarios?: UsuarioResponseDto[];
}
