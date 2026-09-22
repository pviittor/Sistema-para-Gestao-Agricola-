import { IRepository } from '../../core/repository/IRepository';
import NumeracaoNfe from '../../models/NumeracaoNfe';

/**
 * Interface para repositório de NumeracaoNfe
 */
export interface INumeracaoNfeRepository extends IRepository<NumeracaoNfe> {
  /**
   * Busca numeração por série e modelo
   */
  findBySerieModelo(serie: string, modelo: string): Promise<NumeracaoNfe | null>;

  /**
   * Obtém próximo número sequencial com lock pessimista (SELECT FOR UPDATE)
   * Incrementa e retorna o novo número atomicamente
   */
  proximoNumero(serie: string, modelo: string, tenantId: number): Promise<number>;
}
