import { IRepository } from '../../core/repository/IRepository';
import RegistroArmazenagem from '../../models/RegistroArmazenagem';

/**
 * Interface para repositório de RegistroArmazenagem
 */
export interface IRegistroArmazenagemRepository extends IRepository<RegistroArmazenagem> {
  /**
   * Busca todos os registros de uma unidade de depósito específica
   */
  findByUnidadeDeposito(idUnidadeDeposito: number, tenantId: number): Promise<RegistroArmazenagem[]>;

  /**
   * Busca registros por período (data início e data fim)
   */
  findByPeriodo(dataInicio: string, dataFim: string, tenantId: number): Promise<RegistroArmazenagem[]>;

  /**
   * Busca todos os registros de um produto específico
   */
  findByProduto(idProduto: number, tenantId: number): Promise<RegistroArmazenagem[]>;

  /**
   * Calcula o saldo atual de uma unidade de depósito
   * (soma das cargas - soma das descargas)
   */
  getSaldoByUnidade(idUnidadeDeposito: number, tenantId: number): Promise<number>;
}
