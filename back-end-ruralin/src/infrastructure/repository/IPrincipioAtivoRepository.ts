import { IRepository } from '../../core/repository/IRepository';
import PrincipioAtivo from '../../models/PrincipioAtivo';

/**
 * Interface para repositório de PrincipioAtivo
 * 
 * Estende IRepository para fornecer métodos CRUD padrão e adiciona
 * métodos específicos para busca de princípios ativos.
 */
export interface IPrincipioAtivoRepository extends IRepository<PrincipioAtivo> {
  // TODO: Adicionar métodos customizados se necessário
}
