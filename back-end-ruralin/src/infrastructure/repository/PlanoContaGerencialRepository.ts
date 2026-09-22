import { Injectable, Inject } from '../../core/di';
import { TYPES } from '../../core/di/types';
import { BaseRepository } from '../../core/repository/BaseRepository';
import { IPlanoContaGerencialRepository } from './IPlanoContaGerencialRepository';
import { ICacheService } from '../../core/cache/ICacheService';
import { ITenantService } from '../../core/tenant/ITenantService';
import PlanoContaGerencial from '../../models/PlanoContaGerencial';
import { Op } from 'sequelize';

/**
 * Repositório para entidade PlanoContaGerencial
 */
@Injectable()
export class PlanoContaGerencialRepository extends BaseRepository<PlanoContaGerencial> implements IPlanoContaGerencialRepository {
  constructor(
    @Inject(TYPES.ICacheService) cacheService: ICacheService,
    @Inject(TYPES.ITenantService) tenantService: ITenantService
  ) {
    super(PlanoContaGerencial, cacheService, tenantService);
  }

  /**
   * Busca todas as contas de um nível específico
   */
  async findByNivel(nivel: number): Promise<PlanoContaGerencial[]> {
    const tenantFilter = this.getTenantFilter();
    if (!tenantFilter) {
      return [];
    }

    const cacheKey = `planoContaGerencial:findByNivel:${nivel}:${tenantFilter.tenantId}`;
    const cached = await this.cacheService.get<PlanoContaGerencial[]>(cacheKey);
    if (cached !== null) {
      return cached;
    }

    const result = await this.model.findAll({
      where: {
        nivel,
        ...tenantFilter,
      } as any,
      order: [['item', 'ASC']],
    });

    await this.cacheService.set(cacheKey, result, this.DEFAULT_CACHE_TTL);
    return result;
  }

  /**
   * Busca todas as contas de um tipo específico
   */
  async findByTipo(tipo: 'SINTETICA' | 'ANALITICA'): Promise<PlanoContaGerencial[]> {
    const tenantFilter = this.getTenantFilter();
    if (!tenantFilter) {
      return [];
    }

    const cacheKey = `planoContaGerencial:findByTipo:${tipo}:${tenantFilter.tenantId}`;
    const cached = await this.cacheService.get<PlanoContaGerencial[]>(cacheKey);
    if (cached !== null) {
      return cached;
    }

    const result = await this.model.findAll({
      where: {
        tipo,
        ...tenantFilter,
      } as any,
      order: [['item', 'ASC']],
    });

    await this.cacheService.set(cacheKey, result, this.DEFAULT_CACHE_TTL);
    return result;
  }

  /**
   * Busca todas as contas filhas de uma conta pai
   */
  async findByContaPai(contaPaiId: number): Promise<PlanoContaGerencial[]> {
    const tenantFilter = this.getTenantFilter();
    if (!tenantFilter) {
      return [];
    }

    const cacheKey = `planoContaGerencial:findByContaPai:${contaPaiId}:${tenantFilter.tenantId}`;
    const cached = await this.cacheService.get<PlanoContaGerencial[]>(cacheKey);
    if (cached !== null) {
      return cached;
    }

    const result = await this.model.findAll({
      where: {
        contaPaiId,
        ...tenantFilter,
      } as any,
      order: [['item', 'ASC']],
    });

    await this.cacheService.set(cacheKey, result, this.DEFAULT_CACHE_TTL);
    return result;
  }

  /**
   * Busca contas por tipo de fluxo financeiro (RECEITA ou DESPESA)
   */
  async findByTipoFluxo(tipoFluxo: 'RECEITA' | 'DESPESA', apenasAnaliticas: boolean = false, apenasAtivas: boolean = true): Promise<PlanoContaGerencial[]> {
    const tenantFilter = this.getTenantFilter();
    if (!tenantFilter) {
      return [];
    }

    const cacheKey = `planoContaGerencial:findByTipoFluxo:${tipoFluxo}:${apenasAnaliticas}:${apenasAtivas}:${tenantFilter.tenantId}`;
    const cached = await this.cacheService.get<PlanoContaGerencial[]>(cacheKey);
    if (cached !== null) {
      return cached;
    }

    const where: any = {
      tipoFluxo,
      ...tenantFilter,
    };

    if (apenasAnaliticas) {
      where.tipo = 'ANALITICA';
    }

    if (apenasAtivas) {
      where.ativo = true;
    }

    const result = await this.model.findAll({
      where,
      order: [['item', 'ASC']],
    });

    await this.cacheService.set(cacheKey, result, this.DEFAULT_CACHE_TTL);
    return result;
  }

  /**
   * Busca a árvore completa de contas a partir de uma conta raiz
   */
  async findArvore(contaId: number): Promise<PlanoContaGerencial | null> {
    const tenantFilter = this.getTenantFilter();
    if (!tenantFilter) {
      return null;
    }

    const cacheKey = `planoContaGerencial:findArvore:${contaId}:${tenantFilter.tenantId}`;
    const cached = await this.cacheService.get<PlanoContaGerencial>(cacheKey);
    if (cached !== null) {
      return cached;
    }

    const result = await this.model.findOne({
      where: {
        id: contaId,
        ...tenantFilter,
      } as any,
      include: [
        {
          model: PlanoContaGerencial,
          as: 'contasFilhas',
          required: false,
          where: tenantFilter as any,
          include: [
            {
              model: PlanoContaGerencial,
              as: 'contasFilhas',
              required: false,
              where: tenantFilter as any,
              include: [
                {
                  model: PlanoContaGerencial,
                  as: 'contasFilhas',
                  required: false,
                  where: tenantFilter as any,
                },
              ],
            },
          ],
        },
      ],
      order: [
        [{ model: PlanoContaGerencial, as: 'contasFilhas' }, 'item', 'ASC'],
        [
          { model: PlanoContaGerencial, as: 'contasFilhas' },
          { model: PlanoContaGerencial, as: 'contasFilhas' },
          'item',
          'ASC',
        ],
        [
          { model: PlanoContaGerencial, as: 'contasFilhas' },
          { model: PlanoContaGerencial, as: 'contasFilhas' },
          { model: PlanoContaGerencial, as: 'contasFilhas' },
          'item',
          'ASC',
        ],
      ],
    });

    if (result) {
      await this.cacheService.set(cacheKey, result, this.DEFAULT_CACHE_TTL);
    }

    return result;
  }
}
