/**
 * IEmprestimoApplicationService - Interface para Application Service de Emprestimo
 *
 * Esta interface estende IApplicationService e adiciona métodos específicos
 * para busca de empréstimos por parceiro, por fazenda e por situação,
 * além do método de recalcularSituacao.
 *
 * @example
 * ```typescript
 * import { IEmprestimoApplicationService } from './IEmprestimoApplicationService';
 *
 * @Injectable()
 * class EmprestimoController {
 *   constructor(
 *     @Inject(TYPES.IEmprestimoApplicationService)
 *     private emprestimoService: IEmprestimoApplicationService
 *   ) {}
 *
 *   async getByParceiro(req: Request, res: Response) {
 *     const { parceiroId } = req.params;
 *     const emprestimos = await this.emprestimoService.findByParceiro(Number(parceiroId));
 *     return res.json(emprestimos);
 *   }
 * }
 * ```
 */

import { IApplicationService } from '../IApplicationService';
import { CreateEmprestimoDto } from '../../dto/emprestimo/CreateEmprestimoDto';
import { UpdateEmprestimoDto } from '../../dto/emprestimo/UpdateEmprestimoDto';
import { CreateEmprestimoCompletoDto } from '../../dto/emprestimo/CreateEmprestimoCompletoDto';
import { UpdateEmprestimoCompletoDto } from '../../dto/emprestimo/UpdateEmprestimoCompletoDto';
import { EmprestimoResponseDto, EmprestimoDetailResponseDto } from '../../dto/emprestimo/EmprestimoResponseDto';

/**
 * Interface para Application Service de Emprestimo
 *
 * Define métodos padrão CRUD, métodos customizados específicos para empréstimos,
 * e métodos master-detail para operações atômicas com itens.
 */
export interface IEmprestimoApplicationService
  extends IApplicationService<EmprestimoResponseDto, CreateEmprestimoDto, UpdateEmprestimoDto> {
  /**
   * Busca empréstimos por parceiro
   *
   * @param parceiroId - ID do parceiro (pessoa)
   * @returns Promise que resolve com array de DTOs de empréstimos do parceiro
   *
   * @example
   * ```typescript
   * const emprestimos = await emprestimoService.findByParceiro(1);
   * console.log(`Encontrados ${emprestimos.length} empréstimos do parceiro`);
   * ```
   */
  findByParceiro(parceiroId: number): Promise<EmprestimoResponseDto[]>;

  /**
   * Busca empréstimos por fazenda
   *
   * @param fazendaId - ID da fazenda
   * @returns Promise que resolve com array de DTOs de empréstimos da fazenda
   *
   * @example
   * ```typescript
   * const emprestimos = await emprestimoService.findByFazenda(1);
   * console.log(`Encontrados ${emprestimos.length} empréstimos da fazenda`);
   * ```
   */
  findByFazenda(fazendaId: number): Promise<EmprestimoResponseDto[]>;

  /**
   * Busca empréstimos por situação
   *
   * @param situacao - Situação do empréstimo (0=Em aberto, 1=Parcialmente devolvido, 2=Concluído)
   * @returns Promise que resolve com array de DTOs de empréstimos na situação informada
   *
   * @example
   * ```typescript
   * const emprestimos = await emprestimoService.findBySituacao(0);
   * console.log(`Encontrados ${emprestimos.length} empréstimos em aberto`);
   * ```
   */
  findBySituacao(situacao: number): Promise<EmprestimoResponseDto[]>;

  /**
   * Recalcula a situação de um empréstimo com base nas devoluções dos itens
   *
   * @param emprestimoId - ID do empréstimo
   * @returns Promise que resolve quando a situação for atualizada
   *
   * @example
   * ```typescript
   * await emprestimoService.recalcularSituacao(1);
   * ```
   */
  recalcularSituacao(emprestimoId: number): Promise<void>;

  /**
   * Cria um empréstimo completo com itens em uma única operação atômica
   *
   * @param dto - DTO com dados do empréstimo e array de itens
   * @returns Promise que resolve com o DTO detalhado do empréstimo criado (com itens)
   */
  createCompleto(dto: CreateEmprestimoCompletoDto): Promise<EmprestimoDetailResponseDto>;

  /**
   * Atualiza um empréstimo completo com itens (delete-and-recreate) em uma única operação atômica
   *
   * @param id - ID do empréstimo
   * @param dto - DTO com dados atualizados do empréstimo e array de itens
   * @returns Promise que resolve com o DTO detalhado do empréstimo atualizado (com itens)
   */
  updateCompleto(id: number, dto: UpdateEmprestimoCompletoDto): Promise<EmprestimoDetailResponseDto>;

  /**
   * Busca um empréstimo por ID com todos os detalhes (itens + devoluções)
   *
   * @param id - ID do empréstimo
   * @returns Promise que resolve com o DTO detalhado ou null
   */
  getByIdDetalhado(id: number): Promise<EmprestimoDetailResponseDto | null>;
}
