import { IRepository } from '../../core/repository/IRepository';
import HistoricoPreco from '../../models/HistoricoPreco';

/**
 * Interface para repositório de HistoricoPreco
 */
export interface IHistoricoPrecoRepository extends IRepository<HistoricoPreco> {
  /**
   * Busca histórico de preços por produto
   */
  findByProduto(idProduto: number): Promise<HistoricoPreco[]>;

  /**
   * Busca histórico de preços por produto e fazenda
   */
  findByProdutoFazenda(idProduto: number, idFazenda: number): Promise<HistoricoPreco[]>;

  /**
   * Busca histórico de preços por produto e período
   */
  findByPeriodo(idProduto: number, dataInicio: string, dataFim: string): Promise<HistoricoPreco[]>;
}
