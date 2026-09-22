/**
 * ITenantRepository - Interface para repositório de Tenant
 * 
 * Esta interface estende IRepository<Tenant> e adiciona métodos específicos
 * para busca de tenants.
 */

import { IRepository } from '../../core/repository/IRepository';
import Tenant from '../../models/Tenant';

/**
 * Interface para repositório de Tenant
 * 
 * Define métodos específicos para busca de tenants além dos métodos
 * padrão da interface IRepository.
 */
export interface ITenantRepository extends IRepository<Tenant> {
  /**
   * Busca tenant por slug
   * 
   * @param slug - Slug do tenant
   * @returns Promise que resolve com o tenant encontrado ou null
   */
  findBySlug(slug: string): Promise<Tenant | null>;

  /**
   * Busca tenants por consultoria
   * 
   * @param consultoriaId - ID da consultoria
   * @returns Promise que resolve com lista de tenants da consultoria
   */
  findByConsultoria(consultoriaId: number): Promise<Tenant[]>;

  /**
   * Busca tenants ativos
   * 
   * @returns Promise que resolve com lista de tenants ativos
   */
  findAtivos(): Promise<Tenant[]>;
}
