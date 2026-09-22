/**
 * IPermissaoApplicationService - Interface para Application Service de Permissao
 * 
 * Esta interface estende IApplicationService e adiciona métodos específicos
 * para busca de permissões por nome.
 * 
 * @example
 * ```typescript
 * import { IPermissaoApplicationService } from './IPermissaoApplicationService';
 * 
 * @Injectable()
 * class PermissaoController {
 *   constructor(
 *     @Inject(TYPES.IPermissaoApplicationService)
 *     private permissaoService: IPermissaoApplicationService
 *   ) {}
 * 
 *   async getByNome(req: Request, res: Response) {
 *     const { nome } = req.params;
 *     const permissao = await this.permissaoService.findByNome(nome);
 *     return res.json(permissao);
 *   }
 * }
 * ```
 */

import { IApplicationService } from '../IApplicationService';
import { CreatePermissaoDto } from '../../dto/permissao/CreatePermissaoDto';
import { UpdatePermissaoDto } from '../../dto/permissao/UpdatePermissaoDto';
import { PermissaoResponseDto } from '../../dto/permissao/PermissaoResponseDto';

/**
 * Interface para Application Service de Permissao
 * 
 * Define métodos padrão CRUD e métodos customizados específicos para permissões.
 */
export interface IPermissaoApplicationService 
  extends IApplicationService<PermissaoResponseDto, CreatePermissaoDto, UpdatePermissaoDto> {
  /**
   * Busca uma permissão por nome
   * 
   * @param nome - Nome da permissão
   * @returns Promise que resolve com o DTO da permissão encontrada ou null
   * 
   * @example
   * ```typescript
   * const permissao = await permissaoService.findByNome('usuarios.criar');
   * ```
   */
  findByNome(nome: string): Promise<PermissaoResponseDto | null>;
}
