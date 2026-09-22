import { IRepository } from '../../core/repository/IRepository';
import FluxoCaixaSimulacao from '../../models/FluxoCaixaSimulacao';

/**
 * Interface para repositório de FluxoCaixaSimulacao
 *
 * Estende IRepository para fornecer métodos CRUD padrão e adiciona
 * métodos específicos para busca de simulações de fluxo de caixa.
 */
export interface IFluxoCaixaSimulacaoRepository extends IRepository<FluxoCaixaSimulacao> {
  /**
   * Busca simulações de um usuário em um tenant
   *
   * @param usuarioId - ID do usuário
   * @param tenantId - ID do tenant
   * @returns Promise que resolve com array de simulações do usuário
   */
  findByUsuario(usuarioId: number, tenantId: number): Promise<FluxoCaixaSimulacao[]>;

  /**
   * Busca uma simulação pelo ID com seus itens incluídos
   *
   * @param id - ID da simulação
   * @param tenantId - ID do tenant
   * @returns Promise que resolve com a simulação completa ou null se não encontrada
   */
  findByIdWithItens(id: number, tenantId: number): Promise<FluxoCaixaSimulacao | null>;
}
