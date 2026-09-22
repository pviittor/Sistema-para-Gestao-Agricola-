import { IRepository } from '../../core/repository/IRepository';
import FluxoCaixaSimulacaoItem from '../../models/FluxoCaixaSimulacaoItem';

/**
 * Interface para repositório de FluxoCaixaSimulacaoItem
 *
 * Estende IRepository para fornecer métodos CRUD padrão e adiciona
 * métodos específicos para busca e remoção de itens por simulação.
 */
export interface IFluxoCaixaSimulacaoItemRepository extends IRepository<FluxoCaixaSimulacaoItem> {
  /**
   * Busca todos os itens de uma simulação
   *
   * @param simulacaoId - ID da simulação
   * @returns Promise que resolve com array de itens da simulação
   */
  findBySimulacao(simulacaoId: number): Promise<FluxoCaixaSimulacaoItem[]>;

  /**
   * Remove todos os itens de uma simulação
   *
   * @param simulacaoId - ID da simulação
   * @returns Promise que resolve com o número de registros removidos
   */
  deleteBySimulacao(simulacaoId: number): Promise<number>;
}
