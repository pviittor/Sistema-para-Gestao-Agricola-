import { IRepository } from '../../core/repository/IRepository';
import ConfiguradorCiclo from '../../models/ConfiguradorCiclo';

/**
 * Interface para repositório de ConfiguradorCiclo
 */
export interface IConfiguradorCicloRepository extends IRepository<ConfiguradorCiclo> {
  /**
   * Busca configuradores de ciclo por fazenda e safra
   */
  findByFazendaAndSafra(fazendaId: number, safraId: number): Promise<ConfiguradorCiclo[]>;
}
