import { IRepository } from '../../core/repository/IRepository';
import RateioCentroCustoTituloPagar from '../../models/RateioCentroCustoTituloPagar';

/**
 * Interface para repositório de RateioCentroCustoTituloPagar
 * 
 * Estende IRepository para fornecer métodos CRUD padrão e adiciona
 * métodos específicos para busca de rateios de centros de custo por título a pagar.
 */
export interface IRateioCentroCustoTituloPagarRepository extends IRepository<RateioCentroCustoTituloPagar> {
  /**
   * Busca rateios por título a pagar
   */
  findByTituloPagar(idTituloPagar: number): Promise<RateioCentroCustoTituloPagar[]>;

  /**
   * Busca rateios por centro de custo
   */
  findByCentroCusto(idCentroCusto: number): Promise<RateioCentroCustoTituloPagar[]>;
}
