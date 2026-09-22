import { IRepository } from '../../core/repository/IRepository';
import Talhao from '../../models/Talhao';

/**
 * Interface para repositório de Talhao
 */
export interface ITalhaoRepository extends IRepository<Talhao> {
  findByFazenda(fazendaId: number): Promise<Talhao[]>;
}
