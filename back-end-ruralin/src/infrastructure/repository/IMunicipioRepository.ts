import { IRepository } from '../../core/repository/IRepository';
import Municipio from '../../models/Municipio';

/**
 * Interface para repositório de Municipio
 * 
 * Dados globais - não aplica filtro de tenant
 */
export interface IMunicipioRepository extends IRepository<Municipio> {
  /**
   * Busca todos os municípios de um estado específico
   */
  findByEstado(idEstado: number): Promise<Municipio[]>;

  /**
   * Busca um município pelo código IBGE
   */
  findByCodigoIBGE(codigoIBGE: number): Promise<Municipio | null>;
}
