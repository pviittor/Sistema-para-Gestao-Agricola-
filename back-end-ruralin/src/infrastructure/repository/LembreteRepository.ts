/**
 * LembreteRepository - Repositório para entidade Lembrete
 * 
 * Implementa ILembreteRepository estendendo BaseRepository e adiciona
 * métodos específicos para busca de lembretes por usuário e próximos lembretes.
 * 
 * @example
 * ```typescript
 * import { LembreteRepository } from './LembreteRepository';
 * 
 * const repository = new LembreteRepository();
 * const lembretes = await repository.findByUsuario(1);
 * ```
 */

import { Injectable, Inject } from '../../core/di';
import { TYPES } from '../../core/di/types';
import { BaseRepository } from '../../core/repository/BaseRepository';
import { ILembreteRepository } from './ILembreteRepository';
import { ICacheService } from '../../core/cache/ICacheService';
import { ITenantService } from '../../core/tenant/ITenantService';
import Lembrete from '../../models/Lembrete';
import LembreteDataHora from '../../models/LembreteDataHora';
import { Op } from 'sequelize';

/**
 * Repositório para entidade Lembrete
 * 
 * Estende BaseRepository para fornecer métodos CRUD padrão e adiciona
 * métodos específicos para busca por usuário e próximos lembretes.
 */
@Injectable()
export class LembreteRepository extends BaseRepository<Lembrete> implements ILembreteRepository {
  /**
   * Construtor do repositório
   * 
   * Inicializa o BaseRepository com o modelo Lembrete, cacheService e tenantService.
   */
  constructor(
    @Inject(TYPES.ICacheService) cacheService: ICacheService,
    @Inject(TYPES.ITenantService) tenantService: ITenantService
  ) {
    super(Lembrete, cacheService, tenantService);
  }

  /**
   * Busca lembretes por usuário
   * 
   * @param usuarioId - ID do usuário
   * @returns Promise que resolve com array de lembretes do usuário
   */
  async findByUsuario(usuarioId: number): Promise<Lembrete[]> {
    return await this.findAll({
      where: { usuarioId },
      include: [
        {
          model: LembreteDataHora,
          as: 'lembrete_data_hora',
          required: false,
        },
      ],
      order: [['createdAt', 'DESC']],
    });
  }

  /**
   * Busca próximos lembretes
   * 
   * Retorna os lembretes mais próximos baseado nas datas/horários dos
   * LembreteDataHora relacionados, ordenados por data e horário.
   * 
   * IMPORTANTE: Filtra automaticamente por tenantId para garantir isolamento de dados.
   * 
   * @param limite - Número máximo de lembretes a retornar (padrão: 10)
   * @returns Promise que resolve com array de próximos lembretes
   */
  async findProximos(limite: number = 10): Promise<Lembrete[]> {
    const tenantFilter = this.getTenantFilter();
    if (!tenantFilter) {
      return []; // Sem tenantId, retorna array vazio
    }

    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);
    const hojeStr = hoje.toISOString().split('T')[0];

    // Usar findAll com filtro de tenant para garantir isolamento
    const resultados = await this.model.findAll({
      where: {
        ...tenantFilter,
      } as any,
      include: [
        {
          model: LembreteDataHora,
          as: 'lembrete_data_hora',
          required: true,
          where: {
            [Op.or]: [
              {
                data: {
                  [Op.gte]: hojeStr,
                },
              },
              {
                data: null,
                dia: {
                  [Op.ne]: null,
                },
              },
            ],
          },
        },
      ],
      order: [
        [LembreteDataHora, 'data', 'ASC'],
        [LembreteDataHora, 'horario', 'ASC'],
      ] as any,
      limit: limite,
    });

    return resultados as Lembrete[];
  }
}
