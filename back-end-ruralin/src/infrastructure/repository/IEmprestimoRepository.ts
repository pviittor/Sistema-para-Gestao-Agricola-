/**
 * IEmprestimoRepository - Interface para repositório de Emprestimo
 *
 * Esta interface estende IRepository<Emprestimo> e adiciona métodos específicos
 * para busca de empréstimos por parceiro, por fazenda e por situação.
 *
 * @example
 * ```typescript
 * import { IEmprestimoRepository } from './IEmprestimoRepository';
 *
 * @Injectable()
 * class EmprestimoApplicationService {
 *   constructor(
 *     @Inject(TYPES.IEmprestimoRepository)
 *     private repository: IEmprestimoRepository
 *   ) {}
 *
 *   async getByParceiro(parceiroId: number) {
 *     return await this.repository.findByParceiro(parceiroId);
 *   }
 * }
 * ```
 */

import { IRepository } from '../../core/repository/IRepository';
import Emprestimo from '../../models/Emprestimo';

/**
 * Interface para repositório de Emprestimo
 *
 * Define métodos específicos para busca de empréstimos além dos métodos
 * padrão da interface IRepository.
 */
export interface IEmprestimoRepository extends IRepository<Emprestimo> {
  /**
   * Busca empréstimos por parceiro
   *
   * @param parceiroId - ID do parceiro (pessoa)
   * @returns Promise que resolve com array de empréstimos do parceiro
   *
   * @example
   * ```typescript
   * const emprestimos = await emprestimoRepository.findByParceiro(1);
   * console.log(`Encontrados ${emprestimos.length} empréstimos do parceiro`);
   * ```
   */
  findByParceiro(parceiroId: number): Promise<Emprestimo[]>;

  /**
   * Busca empréstimos por fazenda
   *
   * @param fazendaId - ID da fazenda
   * @returns Promise que resolve com array de empréstimos da fazenda
   *
   * @example
   * ```typescript
   * const emprestimos = await emprestimoRepository.findByFazenda(1);
   * console.log(`Encontrados ${emprestimos.length} empréstimos da fazenda`);
   * ```
   */
  findByFazenda(fazendaId: number): Promise<Emprestimo[]>;

  /**
   * Busca empréstimos por situação
   *
   * @param situacao - Situação do empréstimo (0=Em aberto, 1=Parcialmente devolvido, 2=Concluído)
   * @returns Promise que resolve com array de empréstimos na situação informada
   *
   * @example
   * ```typescript
   * const emprestimos = await emprestimoRepository.findBySituacao(0);
   * console.log(`Encontrados ${emprestimos.length} empréstimos em aberto`);
   * ```
   */
  findBySituacao(situacao: number): Promise<Emprestimo[]>;

  /**
   * Busca um empréstimo pelo ID com todos os filhos aninhados (itens e devoluções)
   *
   * @param id - ID do empréstimo
   * @returns Promise que resolve com o empréstimo completo ou null se não encontrado
   *
   * @example
   * ```typescript
   * const emprestimo = await emprestimoRepository.findByIdWithDetails(1);
   * console.log(`Empréstimo possui ${emprestimo?.itens?.length} itens`);
   * ```
   */
  findByIdWithDetails(id: number): Promise<Emprestimo | null>;
}
