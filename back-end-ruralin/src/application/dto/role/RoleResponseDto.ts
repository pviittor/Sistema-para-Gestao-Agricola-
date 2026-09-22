/**
 * RoleResponseDto - DTO para resposta de role
 * 
 * DTO usado para tipar respostas de endpoints de role.
 * 
 * @example
 * ```typescript
 * // GET /api/roles/:id
 * {
 *   "id": 1,
 *   "nome": "Administrador",
 *   "createdAt": "2025-01-14T10:00:00.000Z",
 *   "updatedAt": "2025-01-14T10:00:00.000Z"
 * }
 * ```
 */

/**
 * Informações da role
 */
export interface RoleResponseDto {
  /**
   * ID da role
   */
  id: number;

  /**
   * Nome da role
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
