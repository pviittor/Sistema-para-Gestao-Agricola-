import AlertaVencimentoConfig from '../../models/AlertaVencimentoConfig';
import { IRepository } from '../../core/repository/IRepository';

/**
 * Interface para repositório de AlertaVencimentoConfig
 *
 * Estende IRepository para fornecer métodos CRUD padrão e adiciona
 * métodos específicos para busca de configurações de alerta de vencimento.
 */
export interface IAlertaVencimentoConfigRepository extends IRepository<AlertaVencimentoConfig> {
  /**
   * Busca configurações de alerta por usuário e tenant
   */
  findByUsuario(usuarioId: number, tenantId: number): Promise<AlertaVencimentoConfig[]>;

  /**
   * Busca todas as configurações ativas
   */
  findAtivas(): Promise<AlertaVencimentoConfig[]>;
}
