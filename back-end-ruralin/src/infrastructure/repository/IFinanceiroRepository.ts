/**
 * IFinanceiroRepository - Interface para repositório de Financeiro
 * 
 * Esta interface estende IRepository<Financeiro> e adiciona métodos específicos
 * para busca de registros financeiros por período e por tipo.
 * 
 * @example
 * ```typescript
 * import { IFinanceiroRepository } from './IFinanceiroRepository';
 * 
 * @Injectable()
 * class FinanceiroApplicationService {
 *   constructor(
 *     @Inject(TYPES.IFinanceiroRepository)
 *     private repository: IFinanceiroRepository
 *   ) {}
 * 
 *   async getByPeriodo(dataInicio: Date, dataFim: Date) {
 *     return await this.repository.findByPeriodo(dataInicio, dataFim);
 *   }
 * }
 * ```
 */

import { IRepository } from '../../core/repository/IRepository';
import Financeiro from '../../models/Financeiro';

/**
 * Interface para repositório de Financeiro
 * 
 * Define métodos específicos para busca de registros financeiros além dos métodos
 * padrão da interface IRepository.
 */
export interface IFinanceiroRepository extends IRepository<Financeiro> {
  /**
   * Busca registros financeiros por período de datas
   * 
   * @param dataInicio - Data de início do período (inclusive)
   * @param dataFim - Data de fim do período (inclusive)
   * @returns Promise que resolve com array de registros financeiros no período
   * 
   * @example
   * ```typescript
   * const registros = await financeiroRepository.findByPeriodo(
   *   new Date('2025-01-01'),
   *   new Date('2025-01-31')
   * );
   * ```
   */
  findByPeriodo(dataInicio: Date | string, dataFim: Date | string): Promise<Financeiro[]>;

  /**
   * Busca registros financeiros por tipo
   * 
   * @param tipo - Tipo do registro financeiro (ex: 'RECEITA', 'DESPESA')
   * @returns Promise que resolve com array de registros financeiros do tipo
   * 
   * @example
   * ```typescript
   * const receitas = await financeiroRepository.findByTipo('RECEITA');
   * ```
   */
  findByTipo(tipo: string): Promise<Financeiro[]>;
}
