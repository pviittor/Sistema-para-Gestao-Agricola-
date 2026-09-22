/**
 * IRoleApplicationService - Interface para Application Service de Role
 * 
 * Esta interface estende IApplicationService e adiciona métodos específicos
 * para busca de roles por nome.
 * 
 * @example
 * ```typescript
 * import { IRoleApplicationService } from './IRoleApplicationService';
 * 
 * @Injectable()
 * class RoleController {
 *   constructor(
 *     @Inject(TYPES.IRoleApplicationService)
 *     private roleService: IRoleApplicationService
 *   ) {}
 * 
 *   async getByNome(req: Request, res: Response) {
 *     const { nome } = req.params;
 *     const role = await this.roleService.findByNome(nome);
 *     return res.json(role);
 *   }
 * }
 * ```
 */

import { IApplicationService } from '../IApplicationService';
import { CreateRoleDto } from '../../dto/role/CreateRoleDto';
import { UpdateRoleDto } from '../../dto/role/UpdateRoleDto';
import { RoleResponseDto } from '../../dto/role/RoleResponseDto';

/**
 * Interface para Application Service de Role
 * 
 * Define métodos padrão CRUD e métodos customizados específicos para roles.
 */
export interface IRoleApplicationService 
  extends IApplicationService<RoleResponseDto, CreateRoleDto, UpdateRoleDto> {
  /**
   * Busca uma role por nome
   * 
   * @param nome - Nome da role
   * @returns Promise que resolve com o DTO da role encontrada ou null
   * 
   * @example
   * ```typescript
   * const role = await roleService.findByNome('ADMIN');
   * ```
   */
  findByNome(nome: string): Promise<RoleResponseDto | null>;
}
