/**
 * ILocalApplicationService - Interface para Application Service de Local
 * 
 * Esta interface estende IApplicationService e adiciona métodos específicos
 * para busca de locais por usuário.
 * 
 * @example
 * ```typescript
 * import { ILocalApplicationService } from './ILocalApplicationService';
 * 
 * @Injectable()
 * class LocalController {
 *   constructor(
 *     @Inject(TYPES.ILocalApplicationService)
 *     private localService: ILocalApplicationService
 *   ) {}
 * 
 *   async getByUsuario(req: Request, res: Response) {
 *     const { usuarioId } = req.params;
 *     const locais = await this.localService.findByUsuario(Number(usuarioId));
 *     return res.json(locais);
 *   }
 * }
 * ```
 */

import { IApplicationService } from '../IApplicationService';
import { CreateLocalDto } from '../../dto/local/CreateLocalDto';
import { UpdateLocalDto } from '../../dto/local/UpdateLocalDto';
import { LocalResponseDto } from '../../dto/local/LocalResponseDto';

/**
 * Interface para Application Service de Local
 * 
 * Define métodos padrão CRUD e métodos customizados específicos para locais.
 */
export interface ILocalApplicationService 
  extends IApplicationService<LocalResponseDto, CreateLocalDto, UpdateLocalDto> {
  /**
   * Busca locais por usuário
   * 
   * @param usuarioId - ID do usuário
   * @returns Promise que resolve com array de DTOs de locais do usuário
   * 
   * @example
   * ```typescript
   * const locais = await localService.findByUsuario(1);
   * console.log(`Encontrados ${locais.length} locais do usuário`);
   * ```
   */
  findByUsuario(usuarioId: number): Promise<LocalResponseDto[]>;
}
