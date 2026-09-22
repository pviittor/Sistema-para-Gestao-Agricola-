import { IRepository } from '../../core/repository/IRepository';
import OrdemServicoInsumo from '../../models/OrdemServicoInsumo';

/**
 * Interface para repositório de OrdemServicoInsumo
 *
 * Repositório filho (child) do padrão master-detail.
 * Estende IRepository e adiciona métodos específicos de busca por ordem de serviço.
 */
export interface IOrdemServicoInsumoRepository extends IRepository<OrdemServicoInsumo> {
  /**
   * Busca insumos vinculados a uma ordem de serviço, incluindo Produto e UnidadeMedida
   */
  findByOrdemServico(osId: number): Promise<OrdemServicoInsumo[]>;

  /**
   * Remove todos os insumos de uma ordem de serviço
   */
  deleteByOrdemServico(osId: number): Promise<number>;
}
