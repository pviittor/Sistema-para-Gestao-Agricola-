import { IRepository } from '../../core/repository/IRepository';
import GrupoProduto from '../../models/GrupoProduto';

/**
 * Interface para repositório de GrupoProduto
 * 
 * Estende IRepository para fornecer métodos CRUD padrão e adiciona
 * métodos específicos para busca de grupos de produto.
 */
export interface IGrupoProdutoRepository extends IRepository<GrupoProduto> {
  // TODO: Adicionar métodos customizados se necessário
}
