import { Injectable, Inject } from '../../core/di';
import { TYPES } from '../../core/di/types';
import { BaseRepository } from '../../core/repository/BaseRepository';
import { IOrdemServicoRepository } from './IOrdemServicoRepository';
import { ICacheService } from '../../core/cache/ICacheService';
import { ITenantService } from '../../core/tenant/ITenantService';
import OrdemServico from '../../models/OrdemServico';
import OrdemServicoTalhao from '../../models/OrdemServicoTalhao';
import OrdemServicoInsumo from '../../models/OrdemServicoInsumo';
import OrdemServicoMaquina from '../../models/OrdemServicoMaquina';
import OrdemServicoResponsavel from '../../models/OrdemServicoResponsavel';
import TipoAtividadeOS from '../../models/TipoAtividadeOS';
import Safra from '../../models/Safra';
import Fazenda from '../../models/Fazenda';
import Talhao from '../../models/Talhao';
import Produto from '../../models/Produto';
import UnidadeMedida from '../../models/UnidadeMedida';
import Maquina from '../../models/Maquina';
import Pessoa from '../../models/Pessoa';
import { StatusOrdemServico } from '../../models/enums/OrdemServicoEnums';
import { PaginatedResult } from '../../core/repository/types';
import { fn, col } from 'sequelize';

/**
 * Repositório para entidade OrdemServico
 *
 * Estende BaseRepository para fornecer métodos CRUD padrão e adiciona
 * métodos específicos para busca de ordens de serviço, incluindo a busca completa
 * com todos os filhos (talhoes, insumos, maquinas, responsaveis).
 */
@Injectable()
export class OrdemServicoRepository extends BaseRepository<OrdemServico> implements IOrdemServicoRepository {
  constructor(
    @Inject(TYPES.ICacheService) cacheService: ICacheService,
    @Inject(TYPES.ITenantService) tenantService: ITenantService
  ) {
    super(OrdemServico, cacheService, tenantService);
  }

  /**
   * Busca ordens de serviço por status com paginação
   */
  async findByStatus(status: StatusOrdemServico, page: number, limit: number): Promise<PaginatedResult<OrdemServico>> {
    const offset = (page - 1) * limit;
    const tenantFilter = this.getTenantFilter();
    const cacheKey = `ordemServico:findByStatus:${status}:${page}:${limit}:${JSON.stringify(tenantFilter)}`;

    const cached = await this.cacheService.get<PaginatedResult<OrdemServico>>(cacheKey);
    if (cached !== null) {
      return cached;
    }

    const where: any = { status };
    if (tenantFilter) {
      if (tenantFilter.tenantId) {
        where.tenantId = tenantFilter.tenantId;
      }
    }

    const { count, rows } = await this.model.findAndCountAll({
      where,
      limit,
      offset,
      order: [['dataPlanejadaInicio', 'DESC']],
      include: [
        { model: TipoAtividadeOS, as: 'tipoAtividade', required: false },
        { model: Safra, as: 'safra', required: false },
        { model: Fazenda, as: 'fazenda', required: false },
      ],
    });

    const result: PaginatedResult<OrdemServico> = {
      data: rows,
      page,
      limit,
      total: count,
      totalPages: Math.ceil(count / limit),
    };

    await this.cacheService.set(cacheKey, result, this.DEFAULT_CACHE_TTL);
    return result;
  }

  /**
   * Busca ordens de serviço por fazenda com paginação
   */
  async findByFazenda(fazendaId: number, page: number, limit: number): Promise<PaginatedResult<OrdemServico>> {
    const offset = (page - 1) * limit;
    const tenantFilter = this.getTenantFilter();
    const cacheKey = `ordemServico:findByFazenda:${fazendaId}:${page}:${limit}:${JSON.stringify(tenantFilter)}`;

    const cached = await this.cacheService.get<PaginatedResult<OrdemServico>>(cacheKey);
    if (cached !== null) {
      return cached;
    }

    const where: any = { fazendaId };
    if (tenantFilter) {
      if (tenantFilter.tenantId) {
        where.tenantId = tenantFilter.tenantId;
      }
    }

    const { count, rows } = await this.model.findAndCountAll({
      where,
      limit,
      offset,
      order: [['dataPlanejadaInicio', 'DESC']],
      include: [
        { model: TipoAtividadeOS, as: 'tipoAtividade', required: false },
        { model: Safra, as: 'safra', required: false },
        { model: Fazenda, as: 'fazenda', required: false },
      ],
    });

    const result: PaginatedResult<OrdemServico> = {
      data: rows,
      page,
      limit,
      total: count,
      totalPages: Math.ceil(count / limit),
    };

    await this.cacheService.set(cacheKey, result, this.DEFAULT_CACHE_TTL);
    return result;
  }

  /**
   * Busca uma ordem de serviço completa pelo ID, incluindo todos os filhos
   */
  async findByIdCompleto(id: number): Promise<OrdemServico | null> {
    const tenantFilter = this.getTenantFilter();
    const cacheKey = `ordemServico:findByIdCompleto:${id}:${JSON.stringify(tenantFilter)}`;

    const cached = await this.cacheService.get<OrdemServico>(cacheKey);
    if (cached !== null) {
      return cached;
    }

    const where: any = { id };
    if (tenantFilter) {
      if (tenantFilter.tenantId) {
        where.tenantId = tenantFilter.tenantId;
      }
    }

    const result = await this.model.findOne({
      where,
      include: [
        { model: TipoAtividadeOS, as: 'tipoAtividade', required: false },
        { model: Safra, as: 'safra', required: false },
        { model: Fazenda, as: 'fazenda', required: false },
        {
          model: OrdemServicoTalhao,
          as: 'talhoes',
          required: false,
          include: [
            { model: Talhao, as: 'talhao', required: false },
          ],
        },
        {
          model: OrdemServicoInsumo,
          as: 'insumos',
          required: false,
          include: [
            { model: Produto, as: 'produto', required: false },
            { model: UnidadeMedida, as: 'unidadeMedida', required: false },
          ],
        },
        {
          model: OrdemServicoMaquina,
          as: 'maquinas',
          required: false,
          include: [
            { model: Maquina, as: 'maquina', required: false },
            { model: Maquina, as: 'implemento', required: false },
            { model: Pessoa, as: 'operador', required: false },
          ],
        },
        {
          model: OrdemServicoResponsavel,
          as: 'responsaveis',
          required: false,
          include: [
            { model: Pessoa, as: 'pessoa', required: false },
          ],
        },
      ],
    });

    if (result) {
      await this.cacheService.set(cacheKey, result, this.DEFAULT_CACHE_TTL);
    }

    return result;
  }

  /**
   * Obtém o próximo número sequencial de OS para o tenant
   * Calcula MAX(numero) + 1 de forma atômica
   */
  async getNextNumero(tenantId: number): Promise<number> {
    const result = await this.model.findOne({
      where: { tenantId } as any,
      attributes: [[fn('MAX', col('numero')), 'maxNumero']],
      raw: true,
    });

    const maxNumero = (result as any)?.maxNumero;
    return maxNumero ? Number(maxNumero) + 1 : 1;
  }
}
