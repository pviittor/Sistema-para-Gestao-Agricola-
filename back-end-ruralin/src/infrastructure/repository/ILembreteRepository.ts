/**
 * ILembreteRepository - Interface para repositório de Lembrete
 * 
 * Esta interface estende IRepository<Lembrete> e adiciona métodos específicos
 * para busca de lembretes por usuário e próximos lembretes.
 * 
 * @example
 * ```typescript
 * import { ILembreteRepository } from './ILembreteRepository';
 * 
 * @Injectable()
 * class LembreteApplicationService {
 *   constructor(
 *     @Inject(TYPES.ILembreteRepository)
 *     private repository: ILembreteRepository
 *   ) {}
 * 
 *   async getByUsuario(usuarioId: number) {
 *     return await this.repository.findByUsuario(usuarioId);
 *   }
 * }
 * ```
 */

import { IRepository } from '../../core/repository/IRepository';
import Lembrete from '../../models/Lembrete';

/**
 * Interface para repositório de Lembrete
 * 
 * Define métodos específicos para busca de lembretes além dos métodos
 * padrão da interface IRepository.
 */
export interface ILembreteRepository extends IRepository<Lembrete> {
  /**
   * Busca lembretes por usuário
   * 
   * @param usuarioId - ID do usuário
   * @returns Promise que resolve com array de lembretes do usuário
   * 
   * @example
   * ```typescript
   * const lembretes = await lembreteRepository.findByUsuario(1);
   * console.log(`Encontrados ${lembretes.length} lembretes do usuário`);
   * ```
   */
  findByUsuario(usuarioId: number): Promise<Lembrete[]>;

  /**
   * Busca próximos lembretes
   * 
   * Retorna os lembretes mais próximos baseado nas datas/horários dos
   * LembreteDataHora relacionados, ordenados por data e horário.
   * 
   * @param limite - Número máximo de lembretes a retornar (padrão: 10)
   * @returns Promise que resolve com array de próximos lembretes
   * 
   * @example
   * ```typescript
   * const proximos = await lembreteRepository.findProximos(5);
   * console.log(`Próximos ${proximos.length} lembretes`);
   * ```
   */
  findProximos(limite?: number): Promise<Lembrete[]>;
}
