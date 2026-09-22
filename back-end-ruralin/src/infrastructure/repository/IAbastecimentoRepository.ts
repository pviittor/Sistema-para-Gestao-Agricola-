import { IRepository } from '../../core/repository/IRepository';
import Abastecimento from '../../models/Abastecimento';

/**
 * Interface para repositório de Abastecimento
 */
export interface IAbastecimentoRepository extends IRepository<Abastecimento> {
  /**
   * Busca abastecimentos por máquina
   */
  findByMaquina(idMaquina: number): Promise<Abastecimento[]>;

  /**
   * Busca abastecimentos por período
   */
  findByPeriodo(dataInicio: string, dataFim: string): Promise<Abastecimento[]>;
}
