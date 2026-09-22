/**
 * IEventoRepository - Interface para repositório de Evento
 * 
 * Esta interface estende IRepository<Evento> e adiciona métodos específicos
 * para busca de eventos por local e por período de datas.
 * 
 * @example
 * ```typescript
 * import { IEventoRepository } from './IEventoRepository';
 * 
 * @Injectable()
 * class EventoApplicationService {
 *   constructor(
 *     @Inject(TYPES.IEventoRepository)
 *     private repository: IEventoRepository
 *   ) {}
 * 
 *   async getByLocal(localId: number) {
 *     return await this.repository.findByLocal(localId);
 *   }
 * }
 * ```
 */

import { IRepository } from '../../core/repository/IRepository';
import Evento from '../../models/Evento';

/**
 * Interface para repositório de Evento
 * 
 * Define métodos específicos para busca de eventos além dos métodos
 * padrão da interface IRepository.
 */
export interface IEventoRepository extends IRepository<Evento> {
  /**
   * Busca eventos por local
   * 
   * @param localId - ID do local
   * @returns Promise que resolve com array de eventos do local
   * 
   * @example
   * ```typescript
   * const eventos = await eventoRepository.findByLocal(1);
   * console.log(`Encontrados ${eventos.length} eventos no local`);
   * ```
   */
  findByLocal(localId: number): Promise<Evento[]>;

  /**
   * Busca eventos por período de datas
   * 
   * @param dataInicio - Data de início do período (inclusive)
   * @param dataFim - Data de fim do período (inclusive)
   * @returns Promise que resolve com array de eventos no período
   * 
   * @example
   * ```typescript
   * const eventos = await eventoRepository.findByData(
   *   new Date('2025-01-01'),
   *   new Date('2025-01-31')
   * );
   * ```
   */
  findByData(dataInicio: Date | string, dataFim: Date | string): Promise<Evento[]>;
}
