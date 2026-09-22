import { IRepository } from '../../core/repository/IRepository';
import Conta from '../../models/Conta';

/**
 * Interface para repositório de Conta
 * 
 * Estende IRepository para fornecer métodos CRUD padrão e adiciona
 * métodos específicos para busca de contas.
 */
export interface IContaRepository extends IRepository<Conta> {
  /**
   * Busca contas por tipo
   * 
   * @param tipo - Tipo da conta (BANCO ou CAIXA)
   * @returns Promise que resolve com array de contas do tipo especificado
   */
  findByTipo(tipo: string): Promise<Conta[]>;
}
