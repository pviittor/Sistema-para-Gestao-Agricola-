import { IApplicationService } from '../IApplicationService';
import { CreateEmprestimoItemDevolucaoDto } from '../../dto/emprestimoItemDevolucao/CreateEmprestimoItemDevolucaoDto';
import { UpdateEmprestimoItemDevolucaoDto } from '../../dto/emprestimoItemDevolucao/UpdateEmprestimoItemDevolucaoDto';
import { EmprestimoItemDevolucaoResponseDto } from '../../dto/emprestimoItemDevolucao/EmprestimoItemDevolucaoResponseDto';

/**
 * Interface para Application Service de EmprestimoItemDevolucao
 *
 * Define métodos padrão CRUD e métodos customizados específicos para
 * devoluções de itens de empréstimo.
 */
export interface IEmprestimoItemDevolucaoApplicationService
  extends IApplicationService<
    EmprestimoItemDevolucaoResponseDto,
    CreateEmprestimoItemDevolucaoDto,
    UpdateEmprestimoItemDevolucaoDto
  > {
  /**
   * Lista todas as devoluções de um item de empréstimo
   *
   * @param itemId - ID do item do empréstimo
   * @returns Promise que resolve com array de DTOs de devoluções do item
   *
   * @example
   * ```typescript
   * const devolucoes = await service.findByItem(1);
   * console.log(`Encontradas ${devolucoes.length} devoluções para o item`);
   * ```
   */
  findByItem(itemId: number): Promise<EmprestimoItemDevolucaoResponseDto[]>;
}
