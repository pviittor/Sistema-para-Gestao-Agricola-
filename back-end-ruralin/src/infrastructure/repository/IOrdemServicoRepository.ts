import { IRepository } from '../../core/repository/IRepository';
import OrdemServico from '../../models/OrdemServico';
import { StatusOrdemServico } from '../../models/enums/OrdemServicoEnums';
import { PaginatedResult } from '../../core/repository/types';

/**
 * Interface para repositório de OrdemServico
 *
 * Estende IRepository para fornecer métodos CRUD padrão e adiciona
 * métodos específicos para busca de ordens de serviço.
 */
export interface IOrdemServicoRepository extends IRepository<OrdemServico> {
  /**
   * Busca ordens de serviço por status com paginação
   */
  findByStatus(status: StatusOrdemServico, page: number, limit: number): Promise<PaginatedResult<OrdemServico>>;

  /**
   * Busca ordens de serviço por fazenda com paginação
   */
  findByFazenda(fazendaId: number, page: number, limit: number): Promise<PaginatedResult<OrdemServico>>;

  /**
   * Busca uma ordem de serviço completa pelo ID, incluindo todos os filhos
   * (talhoes, insumos, maquinas, responsaveis) com seus relacionamentos aninhados
   */
  findByIdCompleto(id: number): Promise<OrdemServico | null>;

  /**
   * Obtém o próximo número sequencial de OS para o tenant
   * Calcula MAX(numero) + 1 de forma atômica
   */
  getNextNumero(tenantId: number): Promise<number>;
}
