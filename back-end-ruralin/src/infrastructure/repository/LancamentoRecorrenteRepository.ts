import { Injectable, Inject } from '../../core/di';
import { TYPES } from '../../core/di/types';
import { BaseRepository } from '../../core/repository/BaseRepository';
import { ILancamentoRecorrenteRepository } from './ILancamentoRecorrenteRepository';
import { ICacheService } from '../../core/cache/ICacheService';
import { ITenantService } from '../../core/tenant/ITenantService';
import LancamentoRecorrente, { StatusLancamentoRecorrente } from '../../models/LancamentoRecorrente';
import RecorrenciaFinanceira from '../../models/RecorrenciaFinanceira';
import TituloPagar from '../../models/TituloPagar';
import TituloReceber from '../../models/TituloReceber';

/**
 * Repositorio para entidade LancamentoRecorrente
 *
 * Estende BaseRepository para fornecer metodos CRUD padrao e adiciona
 * metodos especificos para busca de lancamentos recorrentes.
 */
@Injectable()
export class LancamentoRecorrenteRepository extends BaseRepository<LancamentoRecorrente> implements ILancamentoRecorrenteRepository {
  /**
   * Construtor do repositorio
   *
   * Inicializa o BaseRepository com o modelo LancamentoRecorrente, cacheService e tenantService.
   */
  constructor(
    @Inject(TYPES.ICacheService) cacheService: ICacheService,
    @Inject(TYPES.ITenantService) tenantService: ITenantService
  ) {
    super(LancamentoRecorrente, cacheService, tenantService);
  }

  /**
   * Busca lancamentos por recorrencia financeira com paginacao
   */
  async findByRecorrencia(recorrenciaFinanceiraId: number, limit?: number, offset?: number): Promise<{ rows: LancamentoRecorrente[], count: number }> {
    const tenantFilter = this.getTenantFilter();
    const cacheKey = `lancamentoRecorrente:findByRecorrencia:${recorrenciaFinanceiraId}:${limit}:${offset}:${JSON.stringify(tenantFilter)}`;

    const cached = await this.cacheService.get<{ rows: LancamentoRecorrente[], count: number }>(cacheKey);
    if (cached !== null) {
      return cached;
    }

    const where: any = { recorrenciaFinanceiraId };
    if (tenantFilter) {
      if (tenantFilter.tenantId) {
        where.tenantId = tenantFilter.tenantId;
      }
    }

    const result = await this.model.findAndCountAll({
      where,
      order: [['dataReferencia', 'DESC']],
      limit,
      offset,
      include: [
        {
          model: RecorrenciaFinanceira,
          as: 'recorrencia',
          required: false,
        },
        {
          model: TituloPagar,
          as: 'tituloPagar',
          required: false,
        },
        {
          model: TituloReceber,
          as: 'tituloReceber',
          required: false,
        },
      ],
    });

    await this.cacheService.set(cacheKey, result, this.DEFAULT_CACHE_TTL);
    return result;
  }

  /**
   * Verifica se ja existe lancamento gerado para a referencia informada
   */
  async existeParaReferencia(recorrenciaFinanceiraId: number, dataReferencia: string): Promise<boolean> {
    const tenantFilter = this.getTenantFilter();

    const where: any = {
      recorrenciaFinanceiraId,
      dataReferencia,
      status: StatusLancamentoRecorrente.GERADO,
    };
    if (tenantFilter) {
      if (tenantFilter.tenantId) {
        where.tenantId = tenantFilter.tenantId;
      }
    }

    const count = await this.model.count({ where });
    return count > 0;
  }

  /**
   * Busca o ultimo lancamento de uma recorrencia (por dataReferencia DESC)
   */
  async findUltimoLancamento(recorrenciaFinanceiraId: number): Promise<LancamentoRecorrente | null> {
    const tenantFilter = this.getTenantFilter();

    const where: any = { recorrenciaFinanceiraId };
    if (tenantFilter) {
      if (tenantFilter.tenantId) {
        where.tenantId = tenantFilter.tenantId;
      }
    }

    return this.model.findOne({
      where,
      order: [['dataReferencia', 'DESC']],
      include: [
        {
          model: RecorrenciaFinanceira,
          as: 'recorrencia',
          required: false,
        },
        {
          model: TituloPagar,
          as: 'tituloPagar',
          required: false,
        },
        {
          model: TituloReceber,
          as: 'tituloReceber',
          required: false,
        },
      ],
    });
  }

  /**
   * Remove todos os lancamentos de uma recorrencia
   */
  async deleteByRecorrencia(recorrenciaFinanceiraId: number): Promise<number> {
    const where: any = { recorrenciaFinanceiraId };
    const tenantFilter = this.getTenantFilter();
    if (tenantFilter) {
      if (tenantFilter.tenantId) {
        where.tenantId = tenantFilter.tenantId;
      }
    }

    return this.model.destroy({ where });
  }
}
