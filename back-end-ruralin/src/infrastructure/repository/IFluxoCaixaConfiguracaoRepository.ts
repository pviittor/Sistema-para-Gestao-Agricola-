import { IRepository } from '../../core/repository/IRepository';
import FluxoCaixaConfiguracao from '../../models/FluxoCaixaConfiguracao';

/**
 * Interface para repositório de FluxoCaixaConfiguracao
 *
 * Estende IRepository para fornecer métodos CRUD padrão e adiciona
 * método específico para busca de configuração por tenant.
 */
export interface IFluxoCaixaConfiguracaoRepository extends IRepository<FluxoCaixaConfiguracao> {
  /**
   * Busca a configuração de fluxo de caixa de um tenant
   *
   * @param tenantId - ID do tenant
   * @returns Promise que resolve com a configuração ou null se não encontrada
   */
  findByTenant(tenantId: number): Promise<FluxoCaixaConfiguracao | null>;
}
