import { IRepository } from '../../core/repository/IRepository';
import GrupoEquipamento from '../../models/GrupoEquipamento';

/**
 * Interface para repositório de GrupoEquipamento
 *
 * Estende IRepository para fornecer métodos CRUD padrão e adiciona
 * métodos específicos para busca de grupos de equipamento.
 */
export interface IGrupoEquipamentoRepository extends IRepository<GrupoEquipamento> {
  // TODO: Adicionar métodos customizados se necessário
}
