import { IRepository } from '../../core/repository/IRepository';
import UnidadeDeposito from '../../models/UnidadeDeposito';

/**
 * Interface para repositório de UnidadeDeposito
 */
export interface IUnidadeDepositoRepository extends IRepository<UnidadeDeposito> {
  /**
   * Busca todas as unidades de depósito de um produto específico
   */
  findByProduto(idProduto: number, tenantId: number): Promise<UnidadeDeposito[]>;

  /**
   * Busca todas as unidades de depósito com saldo calculado
   */
  findComSaldo(tenantId: number): Promise<any[]>;
}
