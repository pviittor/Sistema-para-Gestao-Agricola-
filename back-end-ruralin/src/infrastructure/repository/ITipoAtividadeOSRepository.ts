import { IRepository } from '../../core/repository/IRepository';
import TipoAtividadeOS from '../../models/TipoAtividadeOS';
import { CategoriaAtividadeOS } from '../../models/enums/OrdemServicoEnums';

/**
 * Interface para repositório de TipoAtividadeOS
 *
 * Estende IRepository para fornecer métodos CRUD padrão e adiciona
 * métodos específicos para busca de tipos de atividade de OS.
 */
export interface ITipoAtividadeOSRepository extends IRepository<TipoAtividadeOS> {
  /**
   * Busca tipos de atividade por categoria
   */
  findByCategoria(categoria: CategoriaAtividadeOS): Promise<TipoAtividadeOS[]>;
}
