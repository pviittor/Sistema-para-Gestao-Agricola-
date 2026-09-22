/**
 * ILocalRepository - Interface para repositório de Local
 * 
 * Esta interface estende IRepository<Local> e adiciona métodos específicos
 * para busca de locais por usuário.
 * 
 * @example
 * ```typescript
 * import { ILocalRepository } from './ILocalRepository';
 * 
 * @Injectable()
 * class LocalApplicationService {
 *   constructor(
 *     @Inject(TYPES.ILocalRepository)
 *     private repository: ILocalRepository
 *   ) {}
 * 
 *   async getByUsuario(usuarioId: number) {
 *     return await this.repository.findByUsuario(usuarioId);
 *   }
 * }
 * ```
 */

import { IRepository } from '../../core/repository/IRepository';
import Local from '../../models/Local';

/**
 * Interface para repositório de Local
 * 
 * Define métodos específicos para busca de locais além dos métodos
 * padrão da interface IRepository.
 */
export interface ILocalRepository extends IRepository<Local> {
  /**
   * Busca locais por usuário
   * 
   * @param usuarioId - ID do usuário
   * @returns Promise que resolve com array de locais do usuário
   * 
   * @example
   * ```typescript
   * const locais = await localRepository.findByUsuario(1);
   * console.log(`Encontrados ${locais.length} locais do usuário`);
   * ```
   */
  findByUsuario(usuarioId: number): Promise<Local[]>;
}
