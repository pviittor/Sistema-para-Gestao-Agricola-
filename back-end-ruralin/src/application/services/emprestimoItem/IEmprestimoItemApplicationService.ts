import { IApplicationService } from '../IApplicationService';
import { CreateEmprestimoItemDto } from '../../dto/emprestimoItem/CreateEmprestimoItemDto';
import { UpdateEmprestimoItemDto } from '../../dto/emprestimoItem/UpdateEmprestimoItemDto';
import { EmprestimoItemResponseDto } from '../../dto/emprestimoItem/EmprestimoItemResponseDto';

/**
 * Interface para Application Service de EmprestimoItem
 *
 * Define métodos padrão CRUD e métodos customizados específicos para itens de empréstimo.
 */
export interface IEmprestimoItemApplicationService
  extends IApplicationService<EmprestimoItemResponseDto, CreateEmprestimoItemDto, UpdateEmprestimoItemDto> {
  /**
   * Lista todos os itens de um empréstimo
   *
   * @param emprestimoId - ID do empréstimo
   * @returns Promise que resolve com array de DTOs de itens do empréstimo
   */
  findByEmprestimo(emprestimoId: number): Promise<EmprestimoItemResponseDto[]>;

  /**
   * Retorna o saldo restante de devolução de um item
   *
   * @param itemId - ID do item do empréstimo
   * @returns Promise que resolve com a quantidade ainda não devolvida
   */
  retornaSaldoRestanteDevolucao(itemId: number): Promise<number>;

  /**
   * Verifica se um item possui devoluções registradas
   *
   * @param itemId - ID do item do empréstimo
   * @returns Promise que resolve com true se o item já possui devoluções
   */
  retornaProdutoPossuiDevolucao(itemId: number): Promise<boolean>;
}
