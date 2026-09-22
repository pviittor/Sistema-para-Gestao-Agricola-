/**
 * ITenantApplicationService - Interface para Application Service de Tenant
 * 
 * Esta interface estende IApplicationService e adiciona métodos específicos
 * para gerenciamento de tenants.
 */

import { IApplicationService } from '../IApplicationService';
import { CreateTenantDto } from '../../dto/tenant/CreateTenantDto';
import { UpdateTenantDto } from '../../dto/tenant/UpdateTenantDto';
import { TenantResponseDto } from '../../dto/tenant/TenantResponseDto';

/**
 * Interface para Application Service de Tenant
 * 
 * Define métodos padrão CRUD e métodos customizados específicos para tenants.
 */
export interface ITenantApplicationService 
  extends IApplicationService<TenantResponseDto, CreateTenantDto, UpdateTenantDto> {
  /**
   * Desativa um tenant
   * 
   * @param id - ID do tenant
   * @returns Promise que resolve com o DTO do tenant desativado
   */
  desativar(id: number): Promise<TenantResponseDto>;

  /**
   * Ativa um tenant
   * 
   * @param id - ID do tenant
   * @returns Promise que resolve com o DTO do tenant ativado
   */
  ativar(id: number): Promise<TenantResponseDto>;

  /**
   * Obtém o status de um tenant
   * 
   * @param id - ID do tenant
   * @returns Promise que resolve com informações de status
   */
  getStatus(id: number): Promise<{ id: number; ativo: boolean; dataAtivacao: Date; dataDesativacao: Date | null } | null>;
}
