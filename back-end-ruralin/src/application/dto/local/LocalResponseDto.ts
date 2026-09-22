/**
 * LocalResponseDto - DTO para resposta de local
 * 
 * DTO usado para tipar respostas de endpoints de local.
 * 
 * @example
 * ```typescript
 * // GET /api/locais/:id
 * {
 *   "id": 1,
 *   "usuarioId": 1,
 *   "desc_simples": "Sala de Reuniões",
 *   "desc_completa": "Sala de reuniões principal no primeiro andar, capacidade para 20 pessoas",
 *   "createdAt": "2025-01-14T10:00:00.000Z",
 *   "updatedAt": "2025-01-14T10:00:00.000Z"
 * }
 * ```
 */

/**
 * Informações do local
 */
export interface LocalResponseDto {
  /**
   * ID do local
   */
  id: number;

  /**
   * ID do usuário dono do local
   */
  usuarioId: number;

  /**
   * Descrição simples do local
   */
  desc_simples: string;

  /**
   * Descrição completa do local
   */
  desc_completa: string;

  /**
   * Data de criação
   */
  createdAt: Date;

  /**
   * Data de atualização
   */
  updatedAt: Date;
}
