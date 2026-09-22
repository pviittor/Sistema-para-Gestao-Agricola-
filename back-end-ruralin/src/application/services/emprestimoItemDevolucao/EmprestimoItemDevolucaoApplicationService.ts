import { Injectable, Inject } from '../../../core/di';
import { TYPES } from '../../../core/di/types';
import { IEmprestimoItemDevolucaoApplicationService } from './IEmprestimoItemDevolucaoApplicationService';
import { IEmprestimoItemDevolucaoRepository } from '../../../infrastructure/repository/IEmprestimoItemDevolucaoRepository';
import { IEmprestimoItemRepository } from '../../../infrastructure/repository/IEmprestimoItemRepository';
import { IEmprestimoApplicationService } from '../emprestimo/IEmprestimoApplicationService';
import { EmprestimoItemDevolucaoMapper } from '../../mappers/EmprestimoItemDevolucaoMapper';
import { CreateEmprestimoItemDevolucaoDto } from '../../dto/emprestimoItemDevolucao/CreateEmprestimoItemDevolucaoDto';
import { UpdateEmprestimoItemDevolucaoDto } from '../../dto/emprestimoItemDevolucao/UpdateEmprestimoItemDevolucaoDto';
import { EmprestimoItemDevolucaoResponseDto } from '../../dto/emprestimoItemDevolucao/EmprestimoItemDevolucaoResponseDto';
import { PaginatedResult } from '../../../core/repository/types';
import { NotFoundException } from '../../../core/exceptions/NotFoundException';
import { BusinessException } from '../../../core/exceptions/BusinessException';
import { Transactional } from '../../../core/unitofwork/Transactional';
import { RequirePermission } from '../../../core/authorization';
import { Auditable } from '../../../core/audit';

/**
 * Application Service para entidade EmprestimoItemDevolucao
 *
 * Implementa lógica de negócio para operações com devoluções de itens de empréstimo:
 * - Validação de quantidade devolvida (não pode exceder o saldo restante)
 * - Validação de produto similar obrigatório quando devolucaoProdutoSimilar_empdev = true
 * - Recalculo da situação do empréstimo pai após criar/excluir devolução
 */
@Injectable()
export class EmprestimoItemDevolucaoApplicationService implements IEmprestimoItemDevolucaoApplicationService {
  private mapper: EmprestimoItemDevolucaoMapper;

  constructor(
    @Inject(TYPES.IEmprestimoItemDevolucaoRepository)
    private repository: IEmprestimoItemDevolucaoRepository,
    @Inject(TYPES.IEmprestimoItemRepository)
    private itemRepository: IEmprestimoItemRepository,
    @Inject(TYPES.IEmprestimoApplicationService)
    private emprestimoService: IEmprestimoApplicationService
  ) {
    this.mapper = new EmprestimoItemDevolucaoMapper();
  }

  /**
   * Cria uma nova devolução de item de empréstimo
   *
   * Regras de negócio:
   * 1. Valida se a quantidade devolvida não excede o saldo restante
   * 2. Valida produto similar obrigatório quando devolucaoProdutoSimilar_empdev = true
   * 3. Após salvar, recalcula a situação do empréstimo pai
   */
  @RequirePermission('emprestimo.create')
  @Transactional()
  @Auditable('EmprestimoItemDevolucao')
  async create(dto: CreateEmprestimoItemDevolucaoDto): Promise<EmprestimoItemDevolucaoResponseDto> {
    // Buscar o item do empréstimo para validações
    const item = await this.itemRepository.findById(dto.itemDevolucaoId);
    if (!item) {
      throw new NotFoundException('Item de empréstimo', dto.itemDevolucaoId);
    }

    // Validar produto similar obrigatório
    if (dto.devolucaoProdutoSimilar_empdev && !dto.produtoSimilarId) {
      throw new BusinessException(
        'Produto similar ID é obrigatório quando a devolução é de produto similar'
      );
    }

    // Calcular saldo restante e validar quantidade devolvida
    const totalJaDevolvido = await this.repository.sumQuantidadeDevolvida(dto.itemDevolucaoId);
    const saldoRestante = Number(item.quantidade_empi) - totalJaDevolvido;

    if (dto.quantidadedevolvida_empdev > saldoRestante) {
      throw new BusinessException(
        `A quantidade devolvida (${dto.quantidadedevolvida_empdev}) excede o saldo restante para devolução (${saldoRestante.toFixed(4)})`
      );
    }

    const entity = await this.mapper.toEntity(dto);
    const created = await this.repository.create(entity as any);

    // Recalcular situação do empréstimo pai
    await this.emprestimoService.recalcularSituacao(item.emprestimoId);

    return this.mapper.toDto(created);
  }

  /**
   * Atualiza uma devolução de item de empréstimo
   */
  @RequirePermission('emprestimo.update')
  @Transactional()
  @Auditable('EmprestimoItemDevolucao')
  async update(id: number | string, dto: UpdateEmprestimoItemDevolucaoDto): Promise<EmprestimoItemDevolucaoResponseDto> {
    const existing = await this.repository.findById(id);
    if (!existing) {
      throw new NotFoundException('Devolução de item de empréstimo', id);
    }

    const entity = await this.mapper.toEntity(dto);
    const updated = await this.repository.update(id, entity as any);
    return this.mapper.toDto(updated);
  }

  /**
   * Remove uma devolução de item de empréstimo
   *
   * Após excluir, recalcula a situação do empréstimo pai.
   */
  @RequirePermission('emprestimo.delete')
  @Transactional()
  @Auditable('EmprestimoItemDevolucao')
  async delete(id: number | string): Promise<boolean> {
    const existing = await this.repository.findById(id);
    if (!existing) {
      return false;
    }

    // Guardar o itemDevolucaoId antes de excluir para buscar o emprestimoId
    const itemDevolucaoId = existing.itemDevolucaoId;

    const deleted = await this.repository.delete(id);

    if (deleted) {
      // Buscar o item para obter o emprestimoId e recalcular a situação
      const item = await this.itemRepository.findById(itemDevolucaoId);
      if (item) {
        await this.emprestimoService.recalcularSituacao(item.emprestimoId);
      }
    }

    return deleted;
  }

  /**
   * Busca uma devolução de item de empréstimo por ID
   */
  @RequirePermission('emprestimo.read')
  async getById(id: number | string): Promise<EmprestimoItemDevolucaoResponseDto | null> {
    const entity = await this.repository.findById(id);
    return entity ? this.mapper.toDto(entity) : null;
  }

  /**
   * Lista devoluções de itens de empréstimo com paginação
   */
  @RequirePermission('emprestimo.read')
  async list(page: number = 1, limit: number = 10): Promise<PaginatedResult<EmprestimoItemDevolucaoResponseDto>> {
    const result = await this.repository.findAllPaginated(page, limit);
    return {
      ...result,
      data: result.data.map(entity => this.mapper.toDto(entity)),
    };
  }

  /**
   * Lista todas as devoluções de um item de empréstimo
   *
   * @param itemId - ID do item do empréstimo
   * @returns Promise com array de DTOs de devoluções do item
   */
  @RequirePermission('emprestimo.read')
  async findByItem(itemId: number): Promise<EmprestimoItemDevolucaoResponseDto[]> {
    const entities = await this.repository.findByItem(itemId);
    return entities.map(entity => this.mapper.toDto(entity));
  }
}
