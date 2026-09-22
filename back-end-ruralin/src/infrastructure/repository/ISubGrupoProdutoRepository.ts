import { IRepository } from '../../core/repository/IRepository';
import SubGrupoProduto from '../../models/SubGrupoProduto';

/**
 * Interface para repositório de SubGrupoProduto
 * 
 * Estende IRepository para fornecer métodos CRUD padrão e adiciona
 * métodos específicos para busca de subgrupos de produto.
 */
export interface ISubGrupoProdutoRepository extends IRepository<SubGrupoProduto> {
  /**
   * Busca todos os subgrupos de um grupo de produto específico
   * 
   * @param idGrupo - ID do grupo de produto
   * @returns Promise que resolve com array de subgrupos do grupo especificado
   */
  findByGrupo(idGrupo: number): Promise<SubGrupoProduto[]>;
}
