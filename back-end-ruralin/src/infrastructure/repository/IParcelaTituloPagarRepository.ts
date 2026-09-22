import { IRepository } from '../../core/repository/IRepository';
import ParcelaTituloPagar from '../../models/ParcelaTituloPagar';
import { StatusParcela } from '../../models/ParcelaTituloPagar';

/**
 * Interface para repositório de ParcelaTituloPagar
 * 
 * Estende IRepository para fornecer métodos CRUD padrão e adiciona
 * métodos específicos para busca de parcelas de títulos a pagar.
 */
export interface IParcelaTituloPagarRepository extends IRepository<ParcelaTituloPagar> {
  /**
   * Busca parcelas por título a pagar
   */
  findByTituloPagar(idTituloPagar: number): Promise<ParcelaTituloPagar[]>;

  /**
   * Busca parcelas por status
   */
  findByStatus(status: StatusParcela): Promise<ParcelaTituloPagar[]>;

  /**
   * Busca parcelas por período de vencimento
   */
  findByDataVencimento(dataInicio: Date, dataFim: Date): Promise<ParcelaTituloPagar[]>;

  /**
   * Busca parcelas vencidas (data de vencimento anterior à data atual)
   */
  findVencidas(): Promise<ParcelaTituloPagar[]>;

  /**
   * Busca parcelas a vencer (data de vencimento entre hoje e data limite)
   */
  findAVencer(dataLimite: Date): Promise<ParcelaTituloPagar[]>;
}
