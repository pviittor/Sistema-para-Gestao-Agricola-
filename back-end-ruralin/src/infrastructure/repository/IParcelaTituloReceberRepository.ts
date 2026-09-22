import { IRepository } from '../../core/repository/IRepository';
import ParcelaTituloReceber from '../../models/ParcelaTituloReceber';
import { StatusParcela } from '../../models/ParcelaTituloReceber';

/**
 * Interface para repositório de ParcelaTituloReceber
 * 
 * Estende IRepository para fornecer métodos CRUD padrão e adiciona
 * métodos específicos para busca de parcelas de títulos a receber.
 */
export interface IParcelaTituloReceberRepository extends IRepository<ParcelaTituloReceber> {
  /**
   * Busca parcelas por título a receber
   */
  findByTituloReceber(idTituloReceber: number): Promise<ParcelaTituloReceber[]>;

  /**
   * Busca parcelas por status
   */
  findByStatus(status: StatusParcela): Promise<ParcelaTituloReceber[]>;

  /**
   * Busca parcelas por período de vencimento
   */
  findByDataVencimento(dataInicio: Date, dataFim: Date): Promise<ParcelaTituloReceber[]>;

  /**
   * Busca parcelas vencidas (data de vencimento anterior à data atual)
   */
  findVencidas(): Promise<ParcelaTituloReceber[]>;

  /**
   * Busca parcelas a vencer (data de vencimento entre hoje e data limite)
   */
  findAVencer(dataLimite: Date): Promise<ParcelaTituloReceber[]>;
}
