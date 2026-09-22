/**
 * PermissaoResponseDto - DTO para resposta de permissão
 * 
 * DTO usado para tipar respostas de endpoints de permissão.
 * 
 * @example
 * ```typescript
 * // GET /api/permissoes/:id
 * {
 *   "id": 1,
 *   "nome": "usuarios.criar",
 *   "createdAt": "2025-01-14T10:00:00.000Z",
 *   "updatedAt": "2025-01-14T10:00:00.000Z"
 * }
 * ```
 */

/**
 * Informações da permissão
 */
export interface PermissaoResponseDto {
  /**
   * ID da permissão
   */
  id: number;

  /**
   * Nome da permissão
   */
  nome: string;

  /**
   * Data de criação
   */
  createdAt: Date;

  /**
   * Data de atualização
   */
  updatedAt: Date;
}
