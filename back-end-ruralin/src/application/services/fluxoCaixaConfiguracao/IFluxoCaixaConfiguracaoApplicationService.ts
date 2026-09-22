import { FluxoCaixaConfiguracaoResponseDto } from '../../dto/fluxoCaixaConfiguracao/FluxoCaixaConfiguracaoResponseDto';
import { UpdateFluxoCaixaConfiguracaoDto } from '../../dto/fluxoCaixaConfiguracao/UpdateFluxoCaixaConfiguracaoDto';

/**
 * Interface para Application Service de FluxoCaixaConfiguracao
 *
 * Define os métodos disponíveis para operações de negócio com configuração do fluxo de caixa.
 * Cada tenant possui no máximo uma configuração (singleton por tenant).
 */
export interface IFluxoCaixaConfiguracaoApplicationService {
  /**
   * Busca a configuração de fluxo de caixa do tenant
   *
   * Se não existir configuração persistida, retorna os valores padrão sem persistir (RN-16).
   *
   * @param tenantId - ID do tenant
   * @returns Promise que resolve com o DTO da configuração
   */
  getByTenant(tenantId: number): Promise<FluxoCaixaConfiguracaoResponseDto>;

  /**
   * Cria ou atualiza a configuração de fluxo de caixa do tenant (upsert)
   *
   * Se já existir configuração para o tenant, atualiza os campos informados.
   * Se não existir, cria uma nova configuração com os valores informados.
   *
   * @param tenantId - ID do tenant
   * @param dto - DTO com dados para atualização/criação
   * @returns Promise que resolve com o DTO da configuração atualizada
   */
  upsertByTenant(tenantId: number, dto: UpdateFluxoCaixaConfiguracaoDto): Promise<FluxoCaixaConfiguracaoResponseDto>;
}
