import { IRepository } from '../../core/repository/IRepository';
import MoedaCotacao from '../../models/MoedaCotacao';

/**
 * Interface para repositório de MoedaCotacao
 */
export interface IMoedaCotacaoRepository extends IRepository<MoedaCotacao> {
  /**
   * Busca todas as cotações de uma moeda específica, ordenadas por data
   */
  findByMoeda(idMoeda: number): Promise<MoedaCotacao[]>;

  /**
   * Busca cotações em uma data específica
   */
  findByData(data: string | Date): Promise<MoedaCotacao[]>;
}
