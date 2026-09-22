/**
 * consultoriaPolicies - Políticas de autorização para Consultoria
 * 
 * Define quem pode realizar operações CRUD em consultorias baseado no tipo de usuário.
 */

import Usuario from '../../../models/Usuario';
import Consultoria from '../../../models/Consultoria';

/**
 * Políticas de autorização para Consultoria
 */
export const consultoriaPolicies = {
  /**
   * Verifica se o usuário pode criar consultoria
   * 
   * @param user - Usuário autenticado
   * @returns true se pode criar, false caso contrário
   */
  canCreate: (user: Usuario): boolean => {
    return user.tipo === 'GOD';
  },

  /**
   * Verifica se o usuário pode ler consultoria
   * 
   * @param user - Usuário autenticado
   * @param consultoria - Consultoria a ser lida (opcional)
   * @returns true se pode ler, false caso contrário
   */
  canRead: (user: Usuario, consultoria?: Consultoria): boolean => {
    // GOD pode ler todas
    if (user.tipo === 'GOD') {
      return true;
    }
    
    // CONSULTOR pode ler apenas sua consultoria
    if (user.tipo === 'CONSULTOR' && consultoria) {
      return user.consultoriaId === consultoria.id;
    }
    
    // Se não há consultoria específica, CONSULTOR pode listar (será filtrado)
    if (user.tipo === 'CONSULTOR' && !consultoria) {
      return true;
    }
    
    return false;
  },

  /**
   * Verifica se o usuário pode atualizar consultoria
   * 
   * @param user - Usuário autenticado
   * @param consultoria - Consultoria a ser atualizada
   * @returns true se pode atualizar, false caso contrário
   */
  canUpdate: (user: Usuario, consultoria: Consultoria): boolean => {
    return user.tipo === 'GOD';
  },

  /**
   * Verifica se o usuário pode deletar consultoria
   * 
   * @param user - Usuário autenticado
   * @param consultoria - Consultoria a ser deletada
   * @returns true se pode deletar, false caso contrário
   */
  canDelete: (user: Usuario, consultoria: Consultoria): boolean => {
    return user.tipo === 'GOD';
  },

  /**
   * Verifica se o usuário pode desativar/ativar consultoria
   * 
   * @param user - Usuário autenticado
   * @param consultoria - Consultoria a ser desativada/ativada
   * @returns true se pode desativar/ativar, false caso contrário
   */
  canToggleActive: (user: Usuario, consultoria: Consultoria): boolean => {
    return user.tipo === 'GOD';
  },
};
