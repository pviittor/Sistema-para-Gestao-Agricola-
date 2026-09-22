/**
 * LembreteResponseDto - DTO para resposta de lembrete
 * 
 * DTO usado para tipar respostas de endpoints de lembrete.
 * 
 * @example
 * ```typescript
 * // GET /api/lembretes/:id
 * {
 *   "id": 1,
 *   "usuarioId": 1,
 *   "desc_simples": "Reunião importante",
 *   "desc_completa": "Reunião com a equipe para discutir o planejamento",
 *   "lembrete_data_hora": [
 *     {
 *       "id": 1,
 *       "lembreteId": 1,
 *       "dia": "Segunda-feira",
 *       "data": "2025-01-20",
 *       "horario": "09:00:00",
 *       "createdAt": "2025-01-14T10:00:00.000Z",
 *       "updatedAt": "2025-01-14T10:00:00.000Z"
 *     }
 *   ],
 *   "createdAt": "2025-01-14T10:00:00.000Z",
 *   "updatedAt": "2025-01-14T10:00:00.000Z"
 * }
 * ```
 */

/**
 * Informações de data/hora do lembrete
 */
export interface LembreteDataHoraResponseDto {
  /**
   * ID da data/hora
   */
  id: number;

  /**
   * ID do lembrete
   */
  lembreteId: number;

  /**
   * Dia da semana
   */
  dia?: string;

  /**
   * Data do lembrete (formato: YYYY-MM-DD)
   */
  data?: string;

  /**
   * Horário do lembrete (formato: HH:mm:ss)
   */
  horario: string;

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
 * Informações do lembrete
 */
export interface LembreteResponseDto {
  /**
   * ID do lembrete
   */
  id: number;

  /**
   * ID do usuário dono do lembrete
   */
  usuarioId: number;

  /**
   * Descrição simples do lembrete
   */
  desc_simples: string;

  /**
   * Descrição completa do lembrete
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

/**
 * Resposta completa de lembrete (com relacionamentos)
 */
export interface LembreteDetailResponseDto extends LembreteResponseDto {
  /**
   * Datas e horários associados ao lembrete
   */
  lembrete_data_hora?: LembreteDataHoraResponseDto[];
}
