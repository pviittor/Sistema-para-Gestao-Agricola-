import { IRepository } from '../../core/repository/IRepository';
import Safra from '../../models/Safra';
import { StatusSafra } from '../../models/Safra';

/**
 * Interface para repositório de Safra
 */
export interface ISafraRepository extends IRepository<Safra> {
  /**
   * Busca safras por cultura
   */
  findByCultura(culturaId: number): Promise<Safra[]>;

  /**
   * Busca safras por status
   */
  findByStatus(status: StatusSafra): Promise<Safra[]>;
}
