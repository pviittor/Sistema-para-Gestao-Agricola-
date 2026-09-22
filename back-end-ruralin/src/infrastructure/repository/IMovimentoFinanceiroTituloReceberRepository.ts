import { IRepository } from '../../core/repository/IRepository';
import MovimentoFinanceiroTituloReceber from '../../models/MovimentoFinanceiroTituloReceber';

/**
 * Interface para repositório de MovimentoFinanceiroTituloReceber
 * 
 * Estende IRepository para fornecer métodos CRUD padrão e adiciona
 * métodos específicos para busca e agregação de movimentos financeiros de títulos a receber.
 */
export interface IMovimentoFinanceiroTituloReceberRepository extends IRepository<MovimentoFinanceiroTituloReceber> {
  /**
   * Busca movimentos por parcela
   */
  findByParcela(idParcelaTituloReceber: number): Promise<MovimentoFinanceiroTituloReceber[]>;

  /**
   * Busca movimentos por título a receber
   */
  findByTituloReceber(idTituloReceber: number): Promise<MovimentoFinanceiroTituloReceber[]>;

  /**
   * Busca movimentos por período de movimento
   */
  findByDataMovimento(dataInicio: Date, dataFim: Date): Promise<MovimentoFinanceiroTituloReceber[]>;

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
