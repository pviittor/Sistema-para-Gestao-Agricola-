import { IRepository } from '../../core/repository/IRepository'
import CotacaoItem from '../../models/CotacaoItem'

/**
 * Interface para repositorio de CotacaoItem
 */
export interface ICotacaoItemRepository extends IRepository<CotacaoItem> {
  /**
   * Busca itens por cotacao
   */
  findByCotacao(cotacaoId: number): Promise<CotacaoItem[]>

  /**
   * Remove todos os itens de uma cotacao (delete-and-recreate)
   */
  deleteByCotacao(cotacaoId: number): Promise<number>
}
