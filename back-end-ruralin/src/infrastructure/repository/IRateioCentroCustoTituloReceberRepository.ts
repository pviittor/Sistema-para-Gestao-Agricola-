import { IRepository } from '../../core/repository/IRepository';
import RateioCentroCustoTituloReceber from '../../models/RateioCentroCustoTituloReceber';

/**
 * Interface para repositório de RateioCentroCustoTituloReceber
 * 
 * Estende IRepository para fornecer métodos CRUD padrão e adiciona
 * métodos específicos para busca de rateios de centros de custo por título a receber.
 */
export interface IRateioCentroCustoTituloReceberRepository extends IRepository<RateioCentroCustoTituloReceber> {
  /**
   * Busca rateios por título a receber
   */
  findByTituloReceber(idTituloReceber: number): Promise<RateioCentroCustoTituloReceber[]>;

  /**
   * Busca rateios por centro de custo
   */
  findByCentroCusto(idCentroCusto: number): Promise<RateioCentroCustoTituloReceber[]>;
}
