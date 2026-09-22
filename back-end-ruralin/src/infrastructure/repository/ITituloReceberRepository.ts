import { IRepository } from '../../core/repository/IRepository';
import TituloReceber from '../../models/TituloReceber';
import { StatusTituloReceber } from '../../models/TituloReceber';

/**
 * Interface para repositório de TituloReceber
 * 
 * Estende IRepository para fornecer métodos CRUD padrão e adiciona
 * métodos específicos para busca de títulos a receber.
 */
export interface ITituloReceberRepository extends IRepository<TituloReceber> {
  /**
   * Busca títulos a receber por safra
   */
  findBySafra(idSafra: number): Promise<TituloReceber[]>;

  /**
   * Busca títulos a receber por fazenda
   */
  findByFazenda(idFazenda: number): Promise<TituloReceber[]>;

  /**
   * Busca títulos a receber por cliente
   */
  findByCliente(idCliente: number): Promise<TituloReceber[]>;

  /**
   * Busca títulos a receber por status
   */
  findByStatus(status: StatusTituloReceber): Promise<TituloReceber[]>;

  /**
   * Busca título a receber por número do título
   * Usado para validar unicidade do número do título por tenant
   */
  findByNumeroTitulo(numeroTitulo: string): Promise<TituloReceber | null>;

  /**
   * Busca títulos a receber por período de lançamento
   */
  findByDataLancamento(dataInicio: Date, dataFim: Date): Promise<TituloReceber[]>;
}
