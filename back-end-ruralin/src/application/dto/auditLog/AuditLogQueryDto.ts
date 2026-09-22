/**
 * DTOs para consulta de logs de auditoria
 */

import { AuditAction } from '../../../models/AuditLog';

/**
 * DTO para filtros de consulta de logs de auditoria
 */
export interface AuditLogQueryDto {
  /**
   * ID do usuário (opcional)
   */
  userId?: number;

  /**
   * Nome da entidade (opcional)
   */
  entity?: string;

  /**
   * ID da entidade (opcional)
   */
  entityId?: number;

  /**
   * Tipo de ação (opcional)
   */
  action?: AuditAction;

  /**
   * Data de início do período (opcional)
   */
  startDate?: Date | string;

  /**
   * Data de fim do período (opcional)
   */
  endDate?: Date | string;

  /**
   * IP de origem (opcional)
   */
  ip?: string;

  /**
   * Número da página (padrão: 1)
   */
  page?: number;

  /**
   * Limite de registros por página (padrão: 10)
   */
  limit?: number;
}

/**
 * DTO de resposta para log de auditoria
 */
export interface AuditLogResponseDto {
  id: number;
  userId: number;
  action: AuditAction;
  entity: string;
  entityId: number | null;
  changes: {
    before?: any;
    after?: any;
    changes?: Record<string, any>;
  } | null;
  ip: string | null;
  userAgent: string | null;
  timestamp: Date;
  createdAt: Date;
  updatedAt: Date;
}
