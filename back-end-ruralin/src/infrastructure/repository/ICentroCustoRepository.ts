import { IRepository } from '../../core/repository/IRepository';
import CentroCusto from '../../models/CentroCusto';

/**
 * Interface para repositório de CentroCusto
 */
export interface ICentroCustoRepository extends IRepository<CentroCusto> {
  /**
   * Busca uma entidade por ID sem aplicar filtro de tenant
   */
  findByIdWithoutTenant(id: number | string): Promise<CentroCusto | null>;

  /**
   * Busca centros de custo filhos de um pai específico
   */
  findByPai(centroCustoPaiId: number): Promise<CentroCusto[]>;
}
