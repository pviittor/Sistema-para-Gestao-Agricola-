/**
 * EventoRepository - Repositório para entidade Evento
 * 
 * Implementa IEventoRepository estendendo BaseRepository e adiciona
 * métodos específicos para busca de eventos por local e por período de datas.
 * 
 * @example
 * ```typescript
 * import { EventoRepository } from './EventoRepository';
 * 
 * const repository = new EventoRepository();
 * const eventos = await repository.findByLocal(1);
 * ```
 */

import { Injectable, Inject } from '../../core/di';
import { TYPES } from '../../core/di/types';
import { BaseRepository } from '../../core/repository/BaseRepository';
import { IEventoRepository } from '../repository/IEventoRepository';
import { ICacheService } from '../../core/cache/ICacheService';
import { ITenantService } from '../../core/tenant/ITenantService';
import Evento from '../../models/Evento';
import { Op } from 'sequelize';

/**
 * Repositório para entidade Evento
 * 
 * Estende BaseRepository para fornecer métodos CRUD padrão e adiciona
 * métodos específicos para busca por local e por período de datas.
 */
@Injectable()
export class EventoRepository extends BaseRepository<Evento> implements IEventoRepository {
  /**
   * Construtor do repositório
   * 
   * Inicializa o BaseRepository com o modelo Evento, cacheService e tenantService.
   */
  constructor(
    @Inject(TYPES.ICacheService) cacheService: ICacheService,
    @Inject(TYPES.ITenantService) tenantService: ITenantService
  ) {
    super(Evento, cacheService, tenantService);
  }

  /**
   * Busca eventos por local
   * 
   * @param localId - ID do local
   * @returns Promise que resolve com array de eventos do local
   */
  async findByLocal(localId: number): Promise<Evento[]> {
    return await this.findAll({
      where: { localId },
      order: [['data', 'ASC'], ['horario_inicio', 'ASC']],
    });
  }

  /**
   * Busca eventos por período de datas
   * 
   * @param dataInicio - Data de início do período (inclusive)
   * @param dataFim - Data de fim do período (inclusive)
   * @returns Promise que resolve com array de eventos no período
   */
  async findByData(dataInicio: Date | string, dataFim: Date | string): Promise<Evento[]> {
    // Converter para string no formato YYYY-MM-DD se necessário
    const dataInicioStr = dataInicio instanceof Date 
      ? dataInicio.toISOString().split('T')[0]
      : dataInicio;
    const dataFimStr = dataFim instanceof Date
      ? dataFim.toISOString().split('T')[0]
      : dataFim;

    return await this.findAll({
      where: {
        data: {
          [Op.between]: [dataInicioStr, dataFimStr],
        },
      },
      order: [['data', 'ASC'], ['horario_inicio', 'ASC']],
    });
  }
}
