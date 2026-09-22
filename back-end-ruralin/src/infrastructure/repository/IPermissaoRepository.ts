/**
 * IPermissaoRepository - Interface para repositório de Permissao
 * 
 * Esta interface estende IRepository<Permissao> e adiciona métodos específicos
 * para busca de permissões por nome.
 * 
 * @example
 * ```typescript
 * import { IPermissaoRepository } from './IPermissaoRepository';
 * 
 * @Injectable()
 * class PermissaoApplicationService {
 *   constructor(
 *     @Inject(TYPES.IPermissaoRepository)
 *     private repository: IPermissaoRepository
 *   ) {}
 * 
 *   async getByNome(nome: string) {
 *     return await this.repository.findByNome(nome);
 *   }
 * }
 * ```
 */

import { IRepository } from '../../core/repository/IRepository';
import Permissao from '../../models/Permissao';

/**
 * Interface para repositório de Permissao
 * 
 * Define métodos específicos para busca de permissões além dos métodos
 * padrão da interface IRepository.
 */
export interface IPermissaoRepository extends IRepository<Permissao> {
  /**
   * Busca uma permissão por nome
   * 
   * @param nome - Nome da permissão
   * @returns Promise que resolve com a permissão encontrada ou null
   * 
   * @example
   * ```typescript
   * const permissao = await permissaoRepository.findByNome('usuario:create');
   * ```
   */
  findByNome(nome: string): Promise<Permissao | null>;
}
