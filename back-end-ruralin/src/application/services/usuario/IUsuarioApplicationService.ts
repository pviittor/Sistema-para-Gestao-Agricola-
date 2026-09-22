/**
 * IUsuarioApplicationService - Interface para Application Service de Usuario
 * 
 * Esta interface estende IApplicationService e adiciona métodos específicos
 * para busca de usuários por email e username.
 * 
 * @example
 * ```typescript
 * import { IUsuarioApplicationService } from './IUsuarioApplicationService';
 * 
 * @Injectable()
 * class UsuarioController {
 *   constructor(
 *     @Inject(TYPES.IUsuarioApplicationService)
 *     private usuarioService: IUsuarioApplicationService
 *   ) {}
 * 
 *   async getByEmail(req: Request, res: Response) {
 *     const { email } = req.params;
 *     const usuario = await this.usuarioService.findByEmail(email);
 *     return res.json(usuario);
 *   }
 * }
 * ```
 */

import { IApplicationService } from '../IApplicationService';
import { CreateUsuarioDto } from '../../dto/usuario/CreateUsuarioDto';
import { UpdateUsuarioDto } from '../../dto/usuario/UpdateUsuarioDto';
import { UsuarioResponseDto } from '../../dto/usuario/UsuarioResponseDto';

/**
 * Interface para Application Service de Usuario
 * 
 * Define métodos padrão CRUD e métodos customizados específicos para usuários.
 */
export interface IUsuarioApplicationService 
  extends IApplicationService<UsuarioResponseDto, CreateUsuarioDto, UpdateUsuarioDto> {
  /**
   * Busca um usuário por email
   * 
   * @param email - Email do usuário
   * @returns Promise que resolve com o DTO do usuário encontrado ou null
   * 
   * @example
   * ```typescript
   * const usuario = await usuarioService.findByEmail('joao@example.com');
   * if (usuario) {
   *   console.log(`Usuário encontrado: ${usuario.nome}`);
   * }
   * ```
   */
  findByEmail(email: string): Promise<UsuarioResponseDto | null>;

  /**
   * Busca um usuário por username
   * 
   * @param username - Username do usuário
   * @returns Promise que resolve com o DTO do usuário encontrado ou null
   * 
   * @example
   * ```typescript
   * const usuario = await usuarioService.findByUsername('joao.silva');
   * if (usuario) {
   *   console.log(`Usuário encontrado: ${usuario.nome}`);
   * }
   * ```
   */
  findByUsername(username: string): Promise<UsuarioResponseDto | null>;
}
