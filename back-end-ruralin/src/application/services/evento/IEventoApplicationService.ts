/**
 * IEventoApplicationService - Interface para Application Service de Evento
 * 
 * Esta interface estende IApplicationService e adiciona métodos específicos
 * para busca de eventos por local e por período de datas.
 * 
 * @example
 * ```typescript
 * import { IEventoApplicationService } from './IEventoApplicationService';
 * 
 * @Injectable()
 * class EventoController {
 *   constructor(
 *     @Inject(TYPES.IEventoApplicationService)
 *     private eventoService: IEventoApplicationService
 *   ) {}
 * 
 *   async getByLocal(req: Request, res: Response) {
 *     const { localId } = req.params;
 *     const eventos = await this.eventoService.findByLocal(Number(localId));
 *     return res.json(eventos);
 *   }
 * }
 * ```
 */

import { IApplicationService } from '../IApplicationService';
import { CreateEventoDto } from '../../dto/evento/CreateEventoDto';
import { UpdateEventoDto } from '../../dto/evento/UpdateEventoDto';
import { EventoResponseDto } from '../../dto/evento/EventoResponseDto';

/**
 * Interface para Application Service de Evento
 * 
 * Define métodos padrão CRUD e métodos customizados específicos para eventos.
 */
export interface IEventoApplicationService 
  extends IApplicationService<EventoResponseDto, CreateEventoDto, UpdateEventoDto> {
  /**
   * Busca eventos por local
   * 
   * @param localId - ID do local
   * @returns Promise que resolve com array de DTOs de eventos do local
   * 
   * @example
   * ```typescript
   * const eventos = await eventoService.findByLocal(1);
   * console.log(`Encontrados ${eventos.length} eventos no local`);
   * ```
   */
  findByLocal(localId: number): Promise<EventoResponseDto[]>;

  /**
   * Busca eventos por período de datas
   * 
   * @param dataInicio - Data de início do período (inclusive)
   * @param dataFim - Data de fim do período (inclusive)
   * @returns Promise que resolve com array de DTOs de eventos no período
   * 
   * @example
   * ```typescript
   * const eventos = await eventoService.findByData(
   *   '2025-01-01',
   *   '2025-01-31'
   * );
   * ```
   */
  findByData(dataInicio: Date | string, dataFim: Date | string): Promise<EventoResponseDto[]>;
}
