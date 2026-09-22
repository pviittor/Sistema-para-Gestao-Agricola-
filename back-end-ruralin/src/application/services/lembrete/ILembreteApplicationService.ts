/**
 * ILembreteApplicationService - Interface para Application Service de Lembrete
 * 
 * Esta interface estende IApplicationService e adiciona métodos específicos
 * para busca de lembretes por usuário e próximos lembretes.
 * 
 * @example
 * ```typescript
 * import { ILembreteApplicationService } from './ILembreteApplicationService';
 * 
 * @Injectable()
 * class LembreteController {
 *   constructor(
 *     @Inject(TYPES.ILembreteApplicationService)
 *     private lembreteService: ILembreteApplicationService
 *   ) {}
 * 
 *   async getByUsuario(req: Request, res: Response) {
 *     const { usuarioId } = req.params;
 *     const lembretes = await this.lembreteService.findByUsuario(Number(usuarioId));
 *     return res.json(lembretes);
 *   }
 * }
 * ```
 */

import { IApplicationService } from '../IApplicationService';
import { CreateLembreteDto } from '../../dto/lembrete/CreateLembreteDto';
import { UpdateLembreteDto } from '../../dto/lembrete/UpdateLembreteDto';
import { LembreteResponseDto } from '../../dto/lembrete/LembreteResponseDto';

/**
 * Interface para Application Service de Lembrete
 * 
 * Define métodos padrão CRUD e métodos customizados específicos para lembretes.
 */
export interface ILembreteApplicationService 
  extends IApplicationService<LembreteResponseDto, CreateLembreteDto, UpdateLembreteDto> {
  /**
   * Busca lembretes por usuário
   * 
   * @param usuarioId - ID do usuário
   * @returns Promise que resolve com array de DTOs de lembretes do usuário
   * 
   * @example
   * ```typescript
   * const lembretes = await lembreteService.findByUsuario(1);
   * console.log(`Encontrados ${lembretes.length} lembretes do usuário`);
   * ```
   */
  findByUsuario(usuarioId: number): Promise<LembreteResponseDto[]>;

  /**
   * Busca próximos lembretes
   * 
   * Retorna os lembretes mais próximos baseado nas datas/horários dos
   * LembreteDataHora relacionados, ordenados por data e horário.
   * 
   * @param limite - Número máximo de lembretes a retornar (padrão: 10)
   * @returns Promise que resolve com array de DTOs de próximos lembretes
   * 
   * @example
   * ```typescript
   * const proximos = await lembreteService.findProximos(5);
   * console.log(`Próximos ${proximos.length} lembretes`);
   * ```
   */
  findProximos(limite?: number): Promise<LembreteResponseDto[]>;
}
