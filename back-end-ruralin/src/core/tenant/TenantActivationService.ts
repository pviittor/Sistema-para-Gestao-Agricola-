/**
 * TenantActivationService - Serviço para verificação de status de tenants e consultorias
 * 
 * Responsável por verificar se tenants e consultorias estão ativos,
 * com suporte a cache para melhor performance.
 */

import { Injectable, Inject } from '../di';
import { TYPES } from '../di/types';
import { ITenantActivationService } from './ITenantActivationService';
import { ICacheService } from '../cache/ICacheService';
import Tenant from '../../models/Tenant';
import Consultoria from '../../models/Consultoria';

/**
 * Serviço para verificação de status de tenants e consultorias
 */
@Injectable()
export class TenantActivationService implements ITenantActivationService {
  constructor(
    @Inject(TYPES.ICacheService)
    private cacheService: ICacheService
  ) {}

  /**
   * Verifica se um tenant está ativo
   * 
   * @param tenantId - ID do tenant
   * @returns Promise que resolve com true se ativo, false caso contrário
   */
  async isTenantActive(tenantId: number): Promise<boolean> {
    const cacheKey = `tenant:status:${tenantId}`;
    
    // Tentar buscar do cache primeiro
    const cached = await this.cacheService.get<boolean>(cacheKey);
    if (cached !== null && cached !== undefined) {
      return cached;
    }

    // Buscar do banco
    const tenant = await Tenant.findByPk(tenantId, {
      attributes: ['id', 'ativo', 'consultoriaId'],
    });

    if (!tenant) {
      await this.cacheService.set(cacheKey, false, 300); // 5 minutos
      return false;
    }

    const isActive = tenant.ativo === true;
    
    // Cachear resultado (5 minutos)
    await this.cacheService.set(cacheKey, isActive, 300);

    return isActive;
  }

  /**
   * Verifica se uma consultoria está ativa
   * 
   * @param consultoriaId - ID da consultoria
   * @returns Promise que resolve com true se ativa, false caso contrário
   */
  async isConsultoriaActive(consultoriaId: number): Promise<boolean> {
    const cacheKey = `consultoria:status:${consultoriaId}`;
    
    // Tentar buscar do cache primeiro
    const cached = await this.cacheService.get<boolean>(cacheKey);
    if (cached !== null && cached !== undefined) {
      return cached;
    }

    // Buscar do banco
    const consultoria = await Consultoria.findByPk(consultoriaId, {
      attributes: ['id', 'ativo'],
    });

    if (!consultoria) {
      await this.cacheService.set(cacheKey, false, 300); // 5 minutos
      return false;
    }

    const isActive = consultoria.ativo === true;
    
    // Cachear resultado (5 minutos)
    await this.cacheService.set(cacheKey, isActive, 300);

    return isActive;
  }

  /**
   * Obtém o tenant com informações de status
   * 
   * @param tenantId - ID do tenant
   * @returns Promise que resolve com o tenant ou null
   */
  async getTenantWithStatus(tenantId: number): Promise<Tenant | null> {
    return await Tenant.findByPk(tenantId);
  }

  /**
   * Obtém a consultoria com informações de status
   * 
   * @param consultoriaId - ID da consultoria
   * @returns Promise que resolve com a consultoria ou null
   */
  async getConsultoriaWithStatus(consultoriaId: number): Promise<Consultoria | null> {
    return await Consultoria.findByPk(consultoriaId);
  }

  /**
   * Invalida o cache de status do tenant
   * 
   * @param tenantId - ID do tenant
   */
  async invalidateTenantCache(tenantId: number): Promise<void> {
    await this.cacheService.delete(`tenant:status:${tenantId}`);
  }

  /**
   * Invalida o cache de status da consultoria
   * 
   * @param consultoriaId - ID da consultoria
   */
  async invalidateConsultoriaCache(consultoriaId: number): Promise<void> {
    await this.cacheService.delete(`consultoria:status:${consultoriaId}`);
  }
}
