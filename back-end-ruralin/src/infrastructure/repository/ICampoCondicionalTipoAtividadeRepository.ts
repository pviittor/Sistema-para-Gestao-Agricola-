import { IRepository } from '../../core/repository/IRepository';
import CampoCondicionalTipoAtividade from '../../models/CampoCondicionalTipoAtividade';

/**
 * Interface para repositório de CampoCondicionalTipoAtividade
 *
 * Repositório filho (child) do padrão master-detail.
 * Estende IRepository e adiciona métodos específicos de busca por tipo de atividade OS.
 */
export interface ICampoCondicionalTipoAtividadeRepository extends IRepository<CampoCondicionalTipoAtividade> {
  /**
   * Busca campos condicionais por tipo de atividade OS, ordenados por `ordem ASC`
   */
  findByTipoAtividade(tipoAtividadeOSId: number): Promise<CampoCondicionalTipoAtividade[]>;

  /**
   * Remove todos os campos condicionais de um tipo de atividade OS
   */
  deleteByTipoAtividade(tipoAtividadeOSId: number): Promise<number>;
}
