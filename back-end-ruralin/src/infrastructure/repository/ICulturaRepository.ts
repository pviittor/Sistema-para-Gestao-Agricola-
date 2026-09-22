import { IRepository } from '../../core/repository/IRepository';
import Cultura from '../../models/Cultura';

/**
 * Interface para repositório de Cultura
 */
export interface ICulturaRepository extends IRepository<Cultura> {
  /**
   * Busca todas as culturas de um produto específico
   */
  findByProduto(idProduto: number): Promise<Cultura[]>;
}
