/**
 * IRoleRepository - Interface para repositório de Role
 * 
 * Esta interface estende IRepository<Role> e adiciona métodos específicos
 * para busca de roles por nome.
 * 
 * @example
 * ```typescript
 * import { IRoleRepository } from './IRoleRepository';
 * 
 * @Injectable()
 * class RoleApplicationService {
 *   constructor(
 *     @Inject(TYPES.IRoleRepository)
 *     private repository: IRoleRepository
 *   ) {}
 * 
 *   async getByNome(nome: string) {
 *     return await this.repository.findByNome(nome);
 *   }
 * }
 * ```
 */

import { IRepository } from '../../core/repository/IRepository';
import Role from '../../models/Role';

/**
 * Interface para repositório de Role
 * 
 * Define métodos específicos para busca de roles além dos métodos
 * padrão da interface IRepository.
 */
export interface IRoleRepository extends IRepository<Role> {
  /**
   * Busca uma role por nome
   * 
   * @param nome - Nome da role
   * @returns Promise que resolve com a role encontrada ou null
   * 
   * @example
   * ```typescript
   * const role = await roleRepository.findByNome('ADMIN');
   * ```
   */
  findByNome(nome: string): Promise<Role | null>;
}
