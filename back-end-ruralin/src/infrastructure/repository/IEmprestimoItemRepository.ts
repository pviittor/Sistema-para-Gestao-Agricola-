import { IRepository } from '../../core/repository/IRepository';
import EmprestimoItem from '../../models/EmprestimoItem';

/**
 * Interface para repositório de EmprestimoItem
 *
 * Define métodos específicos para busca de itens de empréstimo além dos
 * métodos padrão da interface IRepository.
 */
export interface IEmprestimoItemRepository extends IRepository<EmprestimoItem> {
  /**
   * Busca todos os itens de um empréstimo
   *
   * @param emprestimoId - ID do empréstimo
   * @returns Promise que resolve com array de itens do empréstimo
   *
   * @example
   * ```typescript
   * const itens = await emprestimoItemRepository.findByEmprestimo(1);
   * console.log(`Encontrados ${itens.length} itens no empréstimo`);
   * ```
   */
  findByEmprestimo(emprestimoId: number): Promise<EmprestimoItem[]>;

  /**
   * Remove todos os itens de um empréstimo
   *
   * @param emprestimoId - ID do empréstimo
   * @returns Promise que resolve com o número de registros removidos
   *
   * @example
   * ```typescript
   * const removidos = await emprestimoItemRepository.deleteByEmprestimo(1);
   * console.log(`${removidos} itens removidos do empréstimo`);
   * ```
   */
  deleteByEmprestimo(emprestimoId: number): Promise<number>;
}
