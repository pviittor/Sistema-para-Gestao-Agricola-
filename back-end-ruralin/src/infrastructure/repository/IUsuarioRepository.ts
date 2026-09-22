/**
 * IUsuarioRepository - Interface para repositório de Usuario
 * 
 * Esta interface estende IRepository<Usuario> e adiciona métodos específicos
 * para busca de usuários por email e username.
 * 
 * @example
 * ```typescript
 * import { IUsuarioRepository } from './IUsuarioRepository';
 * 
 * @Injectable()
 * class UsuarioApplicationService {
 *   constructor(
 *     @Inject(TYPES.IUsuarioRepository)
 *     private repository: IUsuarioRepository
 *   ) {}
 * 
 *   async authenticate(email: string, senha: string) {
 *     const usuario = await this.repository.findByEmail(email);
 *     // ...
 *   }
 * }
 * ```
 */

import { IRepository } from '../../core/repository/IRepository';
import Usuario from '../../models/Usuario';

/**
 * Interface para repositório de Usuario
 * 
 * Define métodos específicos para busca de usuários além dos métodos
 * padrão da interface IRepository.
 */
export interface IUsuarioRepository extends IRepository<Usuario> {
  /**
   * Busca um usuário por email
   * 
   * @param email - Email do usuário
   * @returns Promise que resolve com o usuário encontrado ou null
   * 
   * @example
   * ```typescript
   * const usuario = await usuarioRepository.findByEmail('usuario@example.com');
   * if (usuario) {
   *   console.log(usuario.nome);
   * }
   * ```
   */
  findByEmail(email: string): Promise<Usuario | null>;

  /**
   * Busca um usuário por username
   * 
   * @param username - Username do usuário
   * @returns Promise que resolve com o usuário encontrado ou null
   * 
   * @example
   * ```typescript
   * const usuario = await usuarioRepository.findByUsername('joao.silva');
   * if (usuario) {
   *   console.log(usuario.nome);
   * }
   * ```
   */
  findByUsername(username: string): Promise<Usuario | null>;
}
