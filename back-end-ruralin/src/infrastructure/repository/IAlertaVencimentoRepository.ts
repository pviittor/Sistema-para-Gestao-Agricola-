import AlertaVencimento from '../../models/AlertaVencimento';
import { IRepository } from '../../core/repository/IRepository';

/**
 * Interface para repositório de AlertaVencimento
 *
 * Estende IRepository para fornecer métodos CRUD padrão e adiciona
 * métodos específicos para busca de alertas de vencimento.
 */
export interface IAlertaVencimentoRepository extends IRepository<AlertaVencimento> {
  /**
   * Busca alertas por usuário e tenant
   */
  findByUsuario(usuarioId: number, tenantId: number): Promise<AlertaVencimento[]>;

  /**
   * Busca alertas não lidos por usuário e tenant
   */
  findNaoLidos(usuarioId: number, tenantId: number): Promise<AlertaVencimento[]>;

  /**
   * Verifica se já existe alerta para uma parcela em uma data específica
   */
  existeAlertaParaParcela(tipoParcela: string, idParcela: number, dataAlerta: string): Promise<boolean>;

  /**
   * Marca um alerta como lido
   */
  marcarComoLido(id: number): Promise<void>;
}
