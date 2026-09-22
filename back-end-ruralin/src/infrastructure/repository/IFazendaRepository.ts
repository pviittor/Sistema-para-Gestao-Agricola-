import { IRepository } from '../../core/repository/IRepository';
import Fazenda from '../../models/Fazenda';

/**
 * Interface para repositório de Fazenda
 */
export interface IFazendaRepository extends IRepository<Fazenda> {
  /**
   * Busca fazendas por pessoa (produtor)
   */
  findByPessoa(idPessoa: number): Promise<Fazenda[]>;

  /**
   * Busca fazendas por município
   */
  findByMunicipio(idMunicipio: number): Promise<Fazenda[]>;
}
