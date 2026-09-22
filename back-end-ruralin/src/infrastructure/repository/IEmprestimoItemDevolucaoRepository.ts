import { IRepository } from '../../core/repository/IRepository';
import EmprestimoItemDevolucao from '../../models/EmprestimoItemDevolucao';

/**
 * Interface para repositório de EmprestimoItemDevolucao
 *
 * Define métodos específicos para busca de devoluções de itens de empréstimo
 * além dos métodos padrão da interface IRepository.
 */
export interface IEmprestimoItemDevolucaoRepository extends IRepository<EmprestimoItemDevolucao> {
  /**
   * Busca todas as devoluções de um item de empréstimo
   *
   * @param itemId - ID do item do empréstimo
   * @returns Promise que resolve com array de devoluções do item
   *
   * @example
   * ```typescript
   * const devolucoes = await repository.findByItem(1);
   * console.log(`Encontradas ${devolucoes.length} devoluções para o item`);
   * ```
   */
  findByItem(itemId: number): Promise<EmprestimoItemDevolucao[]>;

  /**
   * Soma a quantidade total devolvida de um item de empréstimo
   *
   * @param itemId - ID do item do empréstimo
   * @returns Promise que resolve com a soma da quantidade devolvida
   *
   * @example
   * ```typescript
   * const totalDevolvido = await repository.sumQuantidadeDevolvida(1);
   * console.log(`Total devolvido: ${totalDevolvido}`);
   * ```
   */
  sumQuantidadeDevolvida(itemId: number): Promise<number>;

  /**
   * Remove todas as devoluções de um item de empréstimo
   *
   * @param itemDevolucaoId - ID do item do empréstimo
   * @returns Promise que resolve com o número de registros removidos
   *
   * @example
   * ```typescript
   * const removidos = await repository.deleteByItem(1);
   * console.log(`${removidos} devoluções removidas do item`);
   * ```
   */
  deleteByItem(itemDevolucaoId: number): Promise<number>;
}
