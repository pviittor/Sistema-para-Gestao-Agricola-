import { IRepository } from '../../core/repository/IRepository';
import RateioPlanoContaTituloReceber from '../../models/RateioPlanoContaTituloReceber';

/**
 * Interface para repositório de RateioPlanoContaTituloReceber
 * 
 * Estende IRepository para fornecer métodos CRUD padrão e adiciona
 * métodos específicos para busca de rateios de planos de contas por título a receber.
 */
export interface IRateioPlanoContaTituloReceberRepository extends IRepository<RateioPlanoContaTituloReceber> {
  /**
   * Busca rateios por título a receber
   */
  findByTituloReceber(idTituloReceber: number): Promise<RateioPlanoContaTituloReceber[]>;

  /**
   * Busca rateios por plano de contas gerencial
   */
  findByPlanoContaGerencial(idPlanoContaGerencial: number): Promise<RateioPlanoContaTituloReceber[]>;
}
