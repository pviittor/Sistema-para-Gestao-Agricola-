import { Injectable, Inject } from '../../../core/di';
import { TYPES } from '../../../core/di/types';
import { IEmprestimoItemApplicationService } from './IEmprestimoItemApplicationService';
import { IEmprestimoItemRepository } from '../../../infrastructure/repository/IEmprestimoItemRepository';
import { EmprestimoItemMapper } from '../../mappers/EmprestimoItemMapper';
import { CreateEmprestimoItemDto } from '../../dto/emprestimoItem/CreateEmprestimoItemDto';
import { UpdateEmprestimoItemDto } from '../../dto/emprestimoItem/UpdateEmprestimoItemDto';
import { EmprestimoItemResponseDto } from '../../dto/emprestimoItem/EmprestimoItemResponseDto';
import { PaginatedResult } from '../../../core/repository/types';
import { NotFoundException } from '../../../core/exceptions/NotFoundException';
import { BusinessException } from '../../../core/exceptions/BusinessException';
import { Transactional } from '../../../core/unitofwork/Transactional';
import { RequirePermission } from '../../../core/authorization';
import { Auditable } from '../../../core/audit';
import EmprestimoItemDevolucao from '../../../models/EmprestimoItemDevolucao';
import { fn, col } from 'sequelize';

/**
 * Application Service para entidade EmprestimoItem
 *
 * Implementa lógica de negócio para operações com itens de empréstimo:
 * - Cálculo automático de total_empi
 * - Verificação de devoluções antes de excluir
 * - Consulta de saldo restante de devolução
 */
@Injectable()
export class EmprestimoItemApplicationService implements IEmprestimoItemApplicationService {
  private mapper: EmprestimoItemMapper;

  constructor(
    @Inject(TYPES.IEmprestimoItemRepository)
    private repository: IEmprestimoItemRepository
  ) {
    this.mapper = new EmprestimoItemMapper();
  }

  /**
   * Cria um novo item de empréstimo
   *
   * Calcula automaticamente total_empi = quantidade_empi × unitario_empi.
   */
  @RequirePermission('emprestimo.create')
  @Transactional()
  @Auditable('EmprestimoItem')
  async create(dto: CreateEmprestimoItemDto): Promise<EmprestimoItemResponseDto> {
    const entity = await this.mapper.toEntity(dto);

    // Garantir que total_empi está calculado
    if (entity.quantidade_empi !== undefined && entity.unitario_empi !== undefined) {
      (entity as any).total_empi = Number((entity.quantidade_empi * entity.unitario_empi).toFixed(2));
    }

    const created = await this.repository.create(entity as any);
    return this.mapper.toDto(created);
  }

  /**
   * Atualiza um item de empréstimo existente
   *
   * Recalcula total_empi quando quantidade_empi ou unitario_empi forem atualizados.
   */
  @RequirePermission('emprestimo.update')
  @Transactional()
  @Auditable('EmprestimoItem')
  async update(id: number | string, dto: UpdateEmprestimoItemDto): Promise<EmprestimoItemResponseDto> {
    const existing = await this.repository.findById(id);
    if (!existing) {
      throw new NotFoundException('Item de empréstimo', id);
    }

    const entity = await this.mapper.toEntity(dto);

    // Recalcular total_empi se algum dos fatores for atualizado
    const novaQuantidade = entity.quantidade_empi !== undefined ? entity.quantidade_empi : Number(existing.quantidade_empi);
    const novoUnitario = entity.unitario_empi !== undefined ? entity.unitario_empi : Number(existing.unitario_empi);
    (entity as any).total_empi = Number((novaQuantidade * novoUnitario).toFixed(2));

    const updated = await this.repository.update(id, entity as any);
    return this.mapper.toDto(updated);
  }

  /**
   * Remove um item de empréstimo
   *
   * Verifica se o item possui devoluções registradas antes de excluir.
   */
  @RequirePermission('emprestimo.delete')
  @Transactional()
  @Auditable('EmprestimoItem')
  async delete(id: number | string): Promise<boolean> {
    const existing = await this.repository.findById(id);
    if (!existing) {
      return false;
    }

    // Verificar se possui devoluções antes de excluir
    const possuiDevolucoes = await this.retornaProdutoPossuiDevolucao(Number(id));
    if (possuiDevolucoes) {
      throw new BusinessException(
        'Não é possível excluir o item pois existem devoluções registradas para ele'
      );
    }

    return await this.repository.delete(id);
  }

  /**
   * Busca um item de empréstimo por ID
   */
  @RequirePermission('emprestimo.read')
  async getById(id: number | string): Promise<EmprestimoItemResponseDto | null> {
    const entity = await this.repository.findById(id);
    return entity ? this.mapper.toDto(entity) : null;
  }

  /**
   * Lista itens de empréstimo com paginação
   */
  @RequirePermission('emprestimo.read')
  async list(page: number = 1, limit: number = 10): Promise<PaginatedResult<EmprestimoItemResponseDto>> {
    const result = await this.repository.findAllPaginated(page, limit);
    return {
      ...result,
      data: result.data.map(entity => this.mapper.toDto(entity)),
    };
  }

  /**
   * Lista todos os itens de um empréstimo
   *
   * @param emprestimoId - ID do empréstimo
   * @returns Promise com array de DTOs de itens do empréstimo
   */
  @RequirePermission('emprestimo.read')
  async findByEmprestimo(emprestimoId: number): Promise<EmprestimoItemResponseDto[]> {
    const entities = await this.repository.findByEmprestimo(emprestimoId);
    return entities.map(entity => this.mapper.toDto(entity));
  }

  /**
   * Retorna o saldo restante de devolução de um item
   *
   * Calcula: quantidade_empi - soma de quantidadedevolvida_empdev
   *
   * @param itemId - ID do item do empréstimo
   * @returns Promise com a quantidade ainda não devolvida
   */
  @RequirePermission('emprestimo.read')
  async retornaSaldoRestanteDevolucao(itemId: number): Promise<number> {
    const item = await this.repository.findById(itemId);
    if (!item) {
      throw new NotFoundException('Item de empréstimo', itemId);
    }

    const resultado = await EmprestimoItemDevolucao.findOne({
      where: { itemDevolucaoId: itemId },
      attributes: [
        [fn('SUM', col('quantidadedevolvida_empdev')), 'totalDevolvido'],
      ],
      raw: true,
    }) as any;

    const totalDevolvido = resultado?.totalDevolvido ? Number(resultado.totalDevolvido) : 0;
    return Math.max(0, Number(item.quantidade_empi) - totalDevolvido);
  }

  /**
   * Verifica se um item possui devoluções registradas
   *
   * @param itemId - ID do item do empréstimo
   * @returns Promise com true se o item já possui devoluções
   */
  @RequirePermission('emprestimo.read')
  async retornaProdutoPossuiDevolucao(itemId: number): Promise<boolean> {
    const count = await EmprestimoItemDevolucao.count({
      where: { itemDevolucaoId: itemId },
    });
    return count > 0;
  }
}
