import { IRepository } from '../../core/repository/IRepository';
import Estado from '../../models/Estado';

/**
 * Interface para repositório de Estado
 * 
 * Dados globais - não aplica filtro de tenant
 */
export interface IEstadoRepository extends IRepository<Estado> {
  /**
   * Busca um estado pela sigla
   */
  findBySigla(sigla: string): Promise<Estado | null>;
}
