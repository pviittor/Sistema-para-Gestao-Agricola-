import { IRepository } from '../../core/repository/IRepository';
import OrdemServicoResponsavel from '../../models/OrdemServicoResponsavel';

/**
 * Interface para repositório de OrdemServicoResponsavel
 *
 * Repositório filho (child) do padrão master-detail.
 * Estende IRepository e adiciona métodos específicos de busca por ordem de serviço.
 */
export interface IOrdemServicoResponsavelRepository extends IRepository<OrdemServicoResponsavel> {
  /**
   * Busca responsáveis vinculados a uma ordem de serviço, incluindo os dados da Pessoa
   */
  findByOrdemServico(osId: number): Promise<OrdemServicoResponsavel[]>;

  /**
   * Remove todos os responsáveis de uma ordem de serviço
   */
  deleteByOrdemServico(osId: number): Promise<number>;
}
