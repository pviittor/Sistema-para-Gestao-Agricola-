/**
 * ITenantActivationService - Interface para serviço de ativação/desativação de tenants
 * 
 * Este serviço é responsável por:
 * - Verificar se um tenant está ativo
 * - Verificar se uma consultoria está ativa
 * - Gerenciar cache de status
 */

import Tenant from '../../models/Tenant';
import Consultoria from '../../models/Consultoria';

/**
 * Interface para serviço de ativação/desativação de tenants
 */
export interface ITenantActivationService {
  /**
   * Verifica se um tenant está ativo
   * 
   * @param tenantId - ID do tenant
   * @returns Promise que resolve com true se ativo, false caso contrário
   */
  isTenantActive(tenantId: number): Promise<boolean>;

  /**
   * Verifica se uma consultoria está ativa
   * 
   * @param consultoriaId - ID da consultoria
   * @returns Promise que resolve com true se ativa, false caso contrário
   */
  isConsultoriaActive(consultoriaId: number): Promise<boolean>;

  /**
   * Obtém o tenant com informações de status
   * 
   * @param tenantId - ID do tenant
   * @returns Promise que resolve com o tenant ou null
   */
  getTenantWithStatus(tenantId: number): Promise<Tenant | null>;

  /**
   * Obtém a consultoria com informações de status
   * 
   * @param consultoriaId - ID da consultoria
   * @returns Promise que resolve com a consultoria ou null
   */
  getConsultoriaWithStatus(consultoriaId: number): Promise<Consultoria | null>;

  /**
   * Invalida o cache de status do tenant
   * 
   * @param tenantId - ID do tenant
   */
  invalidateTenantCache(tenantId: number): Promise<void>;

  /**
   * Invalida o cache de status da consultoria
   * 
   * @param consultoriaId - ID da consultoria
   */
  invalidateConsultoriaCache(consultoriaId: number): Promise<void>;
}
