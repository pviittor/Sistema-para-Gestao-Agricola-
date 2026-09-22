import { IRepository } from '../../core/repository/IRepository';
import Maquina from '../../models/Maquina';

/**
 * Interface para repositório de Maquina
 */
export interface IMaquinaRepository extends IRepository<Maquina> {
  /**
   * Busca uma máquina pela placa
   */
  findByPlaca(placa: string): Promise<Maquina | null>;

  /**
   * Busca máquinas por grupo de equipamento
   */
  findByGrupo(idGrupo: number): Promise<Maquina[]>;
}
