import { IRepository } from '../../core/repository/IRepository';
import MovimentoFinanceiroTituloPagar from '../../models/MovimentoFinanceiroTituloPagar';

/**
 * Interface para repositório de MovimentoFinanceiroTituloPagar
 * 
 * Estende IRepository para fornecer métodos CRUD padrão e adiciona
 * métodos específicos para busca e agregação de movimentos financeiros de títulos a pagar.
 */
export interface IMovimentoFinanceiroTituloPagarRepository extends IRepository<MovimentoFinanceiroTituloPagar> {
  /**
   * Busca movimentos por parcela
   */
  findByParcela(idParcelaTituloPagar: number): Promise<MovimentoFinanceiroTituloPagar[]>;

  /**
   * Busca movimentos por título a pagar
   */
  findByTituloPagar(idTituloPagar: number): Promise<MovimentoFinanceiroTituloPagar[]>;

  /**
   * Busca movimentos por período de movimento
   */
  findByDataMovimento(dataInicio: Date, dataFim: Date): Promise<MovimentoFinanceiroTituloPagar[]>;

  /**
   * Soma valores de movimentos por plano de contas gerencial
   */
  sumByPlanoConta(idPlanoContaGerencial: number, dataInicio?: Date, dataFim?: Date): Promise<number>;

  /**
   * Soma valores de movimentos por centro de custo
   */
  sumByCentroCusto(idCentroCusto: number, dataInicio?: Date, dataFim?: Date): Promise<number>;

  /**
   * Soma valores de movimentos por plano de contas e centro de custo
   */
  sumByPlanoContaECentroCusto(idPlanoContaGerencial: number, idCentroCusto: number, dataInicio?: Date, dataFim?: Date): Promise<number>;

  /**
   * Agrega valores de movimentos agrupados por plano de contas
   */
  aggregateByPlanoConta(dataInicio?: Date, dataFim?: Date): Promise<Array<{ idPlanoContaGerencial: number; total: number }>>;

  /**
   * Agrega valores de movimentos agrupados por centro de custo
   */
  aggregateByCentroCusto(dataInicio?: Date, dataFim?: Date): Promise<Array<{ idCentroCusto: number; total: number }>>;
}
