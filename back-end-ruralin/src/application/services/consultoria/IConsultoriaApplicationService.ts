/**
 * IConsultoriaApplicationService - Interface para Application Service de Consultoria
 * 
 * Esta interface estende IApplicationService e adiciona métodos específicos
 * para gerenciamento de consultorias.
 */

import { IApplicationService } from '../IApplicationService';
import { CreateConsultoriaDto } from '../../dto/consultoria/CreateConsultoriaDto';
import { UpdateConsultoriaDto } from '../../dto/consultoria/UpdateConsultoriaDto';
import { ConsultoriaResponseDto } from '../../dto/consultoria/ConsultoriaResponseDto';

/**
 * Interface para Application Service de Consultoria
 * 
 * Define métodos padrão CRUD e métodos customizados específicos para consultorias.
 */
export interface IConsultoriaApplicationService 
  extends IApplicationService<ConsultoriaResponseDto, CreateConsultoriaDto, UpdateConsultoriaDto> {
  /**
   * Desativa uma consultoria
   * 
   * @param id - ID da consultoria
   * @returns Promise que resolve com o DTO da consultoria desativada
   */
  desativar(id: number): Promise<ConsultoriaResponseDto>;

  /**
   * Ativa uma consultoria
   * 
   * @param id - ID da consultoria
   * @returns Promise que resolve com o DTO da consultoria ativada
   */
  ativar(id: number): Promise<ConsultoriaResponseDto>;

  /**
   * Aumenta o limite de tenants de uma consultoria
   * 
   * @param id - ID da consultoria
   * @param novoLimite - Novo limite de tenants
   * @returns Promise que resolve com o DTO da consultoria atualizada
   */
  aumentarLimiteTenants(id: number, novoLimite: number): Promise<ConsultoriaResponseDto>;
}
