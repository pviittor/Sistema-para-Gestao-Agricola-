/**
 * EmprestimoRepository - Repositório para entidade Emprestimo
 *
 * Implementa IEmprestimoRepository estendendo BaseRepository e adiciona
 * métodos específicos para busca de empréstimos por parceiro, por fazenda e por situação.
 *
 * @example
 * ```typescript
 * import { EmprestimoRepository } from './EmprestimoRepository';
 *
 * const repository = new EmprestimoRepository();
 * const emprestimos = await repository.findByParceiro(1);
 * ```
 */

import { Injectable, Inject } from '../../core/di';
import { TYPES } from '../../core/di/types';
import { BaseRepository } from '../../core/repository/BaseRepository';
import { IEmprestimoRepository } from '../repository/IEmprestimoRepository';
import { ICacheService } from '../../core/cache/ICacheService';
import { ITenantService } from '../../core/tenant/ITenantService';
import Emprestimo from '../../models/Emprestimo';
import EmprestimoItem from '../../models/EmprestimoItem';
import EmprestimoItemDevolucao from '../../models/EmprestimoItemDevolucao';
import Fazenda from '../../models/Fazenda';
import Pessoa from '../../models/Pessoa';
import Produto from '../../models/Produto';

/**
 * Repositório para entidade Emprestimo
 *
 * Estende BaseRepository para fornecer métodos CRUD padrão e adiciona
 * métodos específicos para busca por parceiro, fazenda e situação.
 */
@Injectable()
export class EmprestimoRepository extends BaseRepository<Emprestimo> implements IEmprestimoRepository {
  /**
   * Construtor do repositório
   *
   * Inicializa o BaseRepository com o modelo Emprestimo, cacheService e tenantService.
   */
  constructor(
    @Inject(TYPES.ICacheService) cacheService: ICacheService,
    @Inject(TYPES.ITenantService) tenantService: ITenantService
  ) {
    super(Emprestimo, cacheService, tenantService);
  }

  /**
   * Busca empréstimos por parceiro
   *
   * @param parceiroId - ID do parceiro (pessoa)
   * @returns Promise que resolve com array de empréstimos do parceiro ordenados por data DESC
   */
  async findByParceiro(parceiroId: number): Promise<Emprestimo[]> {
    return await this.findAll({
      where: { parceiroId },
      order: [['data_emp', 'DESC']],
      include: [
        { model: Fazenda, as: 'fazenda', required: false },
        { model: Pessoa, as: 'parceiro', required: false },
      ],
    });
  }

  /**
   * Busca empréstimos por fazenda
   *
   * @param fazendaId - ID da fazenda
   * @returns Promise que resolve com array de empréstimos da fazenda ordenados por data DESC
   */
  async findByFazenda(fazendaId: number): Promise<Emprestimo[]> {
    return await this.findAll({
      where: { fazendaId },
      order: [['data_emp', 'DESC']],
      include: [
        { model: Fazenda, as: 'fazenda', required: false },
        { model: Pessoa, as: 'parceiro', required: false },
      ],
    });
  }

  /**
   * Busca empréstimos por situação
   *
   * @param situacao - Situação do empréstimo (0=Em aberto, 1=Parcialmente devolvido, 2=Concluído)
   * @returns Promise que resolve com array de empréstimos na situação informada ordenados por data DESC
   */
  async findBySituacao(situacao: number): Promise<Emprestimo[]> {
    return await this.findAll({
      where: { situacao_emp: situacao },
      order: [['data_emp', 'DESC']],
      include: [
        { model: Fazenda, as: 'fazenda', required: false },
        { model: Pessoa, as: 'parceiro', required: false },
      ],
    });
  }

  /**
   * Busca um empréstimo pelo ID com todos os filhos aninhados (itens e devoluções)
   *
   * Aplica filtro de tenant no nível raiz. Os níveis filhos (EmprestimoItem e
   * EmprestimoItemDevolucao) NÃO possuem tenantId próprio — o isolamento é
   * garantido pela FK do empréstimo pai.
   *
   * @param id - ID do empréstimo
   * @returns Promise que resolve com o empréstimo completo ou null se não encontrado
   */
  async findByIdWithDetails(id: number): Promise<Emprestimo | null> {
    const tenantFilter = this.getTenantFilter();
    const where: any = { id };
    if (tenantFilter?.tenantId) where.tenantId = tenantFilter.tenantId;

    return this.model.findOne({
      where,
      include: [
        { model: Fazenda, as: 'fazenda', required: false },
        { model: Pessoa, as: 'parceiro', required: false },
        {
          model: EmprestimoItem,
          as: 'itens',
          required: false,
          include: [
            { model: Produto, as: 'produto', required: false },
            {
              model: EmprestimoItemDevolucao,
              as: 'devolucoes',
              required: false,
              include: [
                { model: Produto, as: 'produtoDevolucao', required: false },
                { model: Produto, as: 'produtoSimilar', required: false },
              ],
            },
          ],
        },
      ],
    });
  }
}
