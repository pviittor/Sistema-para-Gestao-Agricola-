/**
 * IConsultoriaRepository - Interface para repositório de Consultoria
 * 
 * Esta interface estende IRepository<Consultoria> e adiciona métodos específicos
 * para busca de consultorias.
 */

import { IRepository } from '../../core/repository/IRepository';
import Consultoria from '../../models/Consultoria';

/**
 * Interface para repositório de Consultoria
 * 
 * Define métodos específicos para busca de consultorias além dos métodos
 * padrão da interface IRepository.
 */
export interface IConsultoriaRepository extends IRepository<Consultoria> {
  /**
   * Busca consultoria por CNPJ
   * 
   * @param cnpj - CNPJ da consultoria (com ou sem formatação)
   * @returns Promise que resolve com a consultoria encontrada ou null
   */
  findByCnpj(cnpj: string): Promise<Consultoria | null>;

  /**
   * Busca consultorias ativas
   * 
   * @returns Promise que resolve com lista de consultorias ativas
   */
  findAtivas(): Promise<Consultoria[]>;
}
