import { IRepository } from '../../core/repository/IRepository';
import TituloPagar from '../../models/TituloPagar';
import { StatusTituloPagar } from '../../models/TituloPagar';

/**
 * Interface para repositório de TituloPagar
 * 
 * Estende IRepository para fornecer métodos CRUD padrão e adiciona
 * métodos específicos para busca de títulos a pagar.
 */
export interface ITituloPagarRepository extends IRepository<TituloPagar> {
  /**
   * Busca títulos a pagar por safra
   */
  findBySafra(idSafra: number): Promise<TituloPagar[]>;

  /**
   * Busca títulos a pagar por fazenda
   */
  findByFazenda(idFazenda: number): Promise<TituloPagar[]>;

  /**
   * Busca títulos a pagar por fornecedor
   */
  findByFornecedor(idFornecedor: number): Promise<TituloPagar[]>;

  /**
   * Busca títulos a pagar por status
   */
  findByStatus(status: StatusTituloPagar): Promise<TituloPagar[]>;

  /**
   * Busca título a pagar por número do título
   * Usado para validar unicidade do número do título por tenant
   */
  findByNumeroTitulo(numeroTitulo: string): Promise<TituloPagar | null>;

  /**
   * Busca títulos a pagar por período de lançamento
   */
  findByDataLancamento(dataInicio: Date, dataFim: Date): Promise<TituloPagar[]>;
}
