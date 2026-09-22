/**
 * EventoResponseDto - DTO para resposta de evento
 * 
 * DTO usado para tipar respostas de endpoints de evento.
 * 
 * @example
 * ```typescript
 * // GET /api/eventos/:id
 * {
 *   "id": 1,
 *   "usuarioId": 1,
 *   "titulo": "Reunião de Planejamento",
 *   "descricao": "Reunião para planejar as atividades do mês",
 *   "data": "2025-01-20",
 *   "horario_inicio": "09:00:00",
 *   "horario_fim": "11:00:00",
 *   "localId": 1,
 *   "local": {
 *     "id": 1,
 *     "nome": "Sala de Reuniões"
 *   },
 *   "createdAt": "2025-01-14T10:00:00.000Z",
 *   "updatedAt": "2025-01-14T10:00:00.000Z"
 * }
 * ```
 */

/**
 * Informações básicas do evento (sem relacionamentos)
 */
export interface EventoResponseDto {
  /**
   * ID do evento
   */
  id: number;

  /**
   * ID do usuário dono do evento
   */
  usuarioId: number;

  /**
   * Título do evento
   */
  titulo: string;

  /**
   * Descrição do evento
   */
  descricao: string;

  /**
   * Data do evento (formato: YYYY-MM-DD)
   */
  data: string;

  /**
   * Horário de início (formato: HH:mm:ss)
   */
  horario_inicio: string;

  /**
   * Horário de fim (formato: HH:mm:ss)
   */
  horario_fim: string;

  /**
   * ID do local
   */
  localId: number;

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
 * Resposta completa de evento (com relacionamentos)
 */
export interface EventoDetailResponseDto extends EventoResponseDto {
  /**
   * Local associado ao evento
   */
  local?: {
    id: number;
    nome: string;
    [key: string]: any;
  };
}
