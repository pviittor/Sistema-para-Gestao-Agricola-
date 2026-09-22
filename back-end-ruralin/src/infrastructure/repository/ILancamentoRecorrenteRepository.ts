import LancamentoRecorrente from '../../models/LancamentoRecorrente';
import { IRepository } from '../../core/repository/IRepository';

/**
 * Interface para repositorio de LancamentoRecorrente
 *
 * Estende IRepository para fornecer metodos CRUD padrao e adiciona
 * metodos especificos para busca de lancamentos recorrentes.
 */
export interface ILancamentoRecorrenteRepository extends IRepository<LancamentoRecorrente> {
  /**
   * Busca lancamentos por recorrencia financeira com paginacao
   */
  findByRecorrencia(recorrenciaFinanceiraId: number, limit?: number, offset?: number): Promise<{ rows: LancamentoRecorrente[], count: number }>;

  /**
   * Verifica se ja existe lancamento gerado para a referencia informada
   */
  existeParaReferencia(recorrenciaFinanceiraId: number, dataReferencia: string): Promise<boolean>;

  /**
   * Busca o ultimo lancamento de uma recorrencia (por dataReferencia DESC)
   */
  findUltimoLancamento(recorrenciaFinanceiraId: number): Promise<LancamentoRecorrente | null>;

  /**
   * Remove todos os lancamentos de uma recorrencia
   */
  deleteByRecorrencia(recorrenciaFinanceiraId: number): Promise<number>;
}
