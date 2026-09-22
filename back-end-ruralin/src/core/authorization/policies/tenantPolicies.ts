/**
 * tenantPolicies - Políticas de autorização para Tenant
 * 
 * Define quem pode realizar operações CRUD em tenants baseado no tipo de usuário.
 */

import Usuario from '../../../models/Usuario';
import Tenant from '../../../models/Tenant';

/**
 * Políticas de autorização para Tenant
 */
export const tenantPolicies = {
  /**
   * Verifica se o usuário pode criar tenant
   * 
   * @param user - Usuário autenticado
   * @returns true se pode criar, false caso contrário
   */
  canCreate: (user: Usuario): boolean => {
    return user.tipo === 'GOD' || user.tipo === 'CONSULTOR';
  },

  /**
   * Verifica se o usuário pode ler tenant
   * 
   * @param user - Usuário autenticado
   * @param tenant - Tenant a ser lido (opcional)
   * @returns true se pode ler, false caso contrário
   */
  canRead: (user: Usuario, tenant?: Tenant): boolean => {
    // GOD pode ler todos
    if (user.tipo === 'GOD') {
      return true;
    }
    
    // CONSULTOR pode ler apenas tenants da sua consultoria
    if (user.tipo === 'CONSULTOR') {
      if (tenant) {
        return user.consultoriaId === tenant.consultoriaId;
      }
      // Se não há tenant específico, pode listar (será filtrado)
      return true;
    }
    
    // ROOT e CLIENT podem ler apenas seu tenant
    if ((user.tipo === 'ROOT' || user.tipo === 'CLIENT') && tenant) {
      return user.tenantId === tenant.id;
    }
    
    // Se não há tenant específico, ROOT e CLIENT podem listar (será filtrado)
    if (user.tipo === 'ROOT' || user.tipo === 'CLIENT') {
      return true;
    }
    
    return false;
  },

  /**
   * Verifica se o usuário pode atualizar tenant
   * 
   * @param user - Usuário autenticado
   * @param tenant - Tenant a ser atualizado
   * @returns true se pode atualizar, false caso contrário
   */
  canUpdate: (user: Usuario, tenant: Tenant): boolean => {
    // GOD pode atualizar todos
    if (user.tipo === 'GOD') {
      return true;
    }
    
    // CONSULTOR pode atualizar apenas tenants da sua consultoria
    if (user.tipo === 'CONSULTOR') {
      return user.consultoriaId === tenant.consultoriaId;
    }
    
    return false;
  },

  /**
   * Verifica se o usuário pode deletar tenant
   * 
   * @param user - Usuário autenticado
   * @param tenant - Tenant a ser deletado
   * @returns true se pode deletar, false caso contrário
   */
  canDelete: (user: Usuario, tenant: Tenant): boolean => {
    // GOD pode deletar todos
    if (user.tipo === 'GOD') {
      return true;
    }
    
    // CONSULTOR pode deletar apenas tenants da sua consultoria
    if (user.tipo === 'CONSULTOR') {
      return user.consultoriaId === tenant.consultoriaId;
    }
    
    return false;
  },

  /**
   * Verifica se o usuário pode desativar/ativar tenant
   * 
   * @param user - Usuário autenticado
   * @param tenant - Tenant a ser desativado/ativado
   * @returns true se pode desativar/ativar, false caso contrário
   */
  canToggleActive: (user: Usuario, tenant: Tenant): boolean => {
    // GOD pode desativar/ativar todos
    if (user.tipo === 'GOD') {
      return true;
    }
    
    // CONSULTOR pode desativar/ativar apenas tenants da sua consultoria
    if (user.tipo === 'CONSULTOR') {
      return user.consultoriaId === tenant.consultoriaId;
    }
    
    return false;
  },
};
