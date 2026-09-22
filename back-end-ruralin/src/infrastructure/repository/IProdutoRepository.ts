import { IRepository } from '../../core/repository/IRepository';
import Produto from '../../models/Produto';

/**
 * Interface para repositório de Produto
 */
export interface IProdutoRepository extends IRepository<Produto> {
  /**
   * Busca todos os produtos de um grupo específico
   */
  findByGrupo(idGrupo: number): Promise<Produto[]>;

  /**
   * Busca todos os produtos de um subgrupo específico
   */
  findBySubGrupo(idSubGrupo: number): Promise<Produto[]>;
}
