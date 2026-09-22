import { IRepository } from '../../core/repository/IRepository';
import OrdemServicoTalhao from '../../models/OrdemServicoTalhao';

/**
 * Interface para repositório de OrdemServicoTalhao
 *
 * Repositório filho (child) do padrão master-detail.
 * Estende IRepository e adiciona métodos específicos de busca por ordem de serviço.
 */
export interface IOrdemServicoTalhaoRepository extends IRepository<OrdemServicoTalhao> {
  /**
   * Busca talhões vinculados a uma ordem de serviço, incluindo os dados do Talhao
   */
  findByOrdemServico(osId: number): Promise<OrdemServicoTalhao[]>;

  /**
   * Remove todos os talhões de uma ordem de serviço
   */
  deleteByOrdemServico(osId: number): Promise<number>;
}
