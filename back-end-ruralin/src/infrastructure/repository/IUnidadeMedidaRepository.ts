import { IRepository } from '../../core/repository/IRepository';
import UnidadeMedida from '../../models/UnidadeMedida';

/**
 * Interface para repositório de UnidadeMedida
 * 
 * Estende IRepository para fornecer métodos CRUD padrão e adiciona
 * métodos específicos para busca de unidades de medida.
 */
export interface IUnidadeMedidaRepository extends IRepository<UnidadeMedida> {
  // TODO: Adicionar métodos customizados se necessário
}
