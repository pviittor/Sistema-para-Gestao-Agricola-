import { IRepository } from '../../core/repository/IRepository';
import RateioPlanoContaTituloPagar from '../../models/RateioPlanoContaTituloPagar';

/**
 * Interface para repositório de RateioPlanoContaTituloPagar
 * 
 * Estende IRepository para fornecer métodos CRUD padrão e adiciona
 * métodos específicos para busca de rateios de planos de contas por título a pagar.
 */
export interface IRateioPlanoContaTituloPagarRepository extends IRepository<RateioPlanoContaTituloPagar> {
  /**
   * Busca rateios por título a pagar
   */
  findByTituloPagar(idTituloPagar: number): Promise<RateioPlanoContaTituloPagar[]>;

  /**
   * Busca rateios por plano de contas gerencial
   */
  findByPlanoContaGerencial(idPlanoContaGerencial: number): Promise<RateioPlanoContaTituloPagar[]>;
}
