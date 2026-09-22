import { Op } from 'sequelize';
import { Injectable, Inject } from '../../core/di';
import { TYPES } from '../../core/di/types';
import { BaseRepository } from '../../core/repository/BaseRepository';
import { IAbastecimentoRepository } from './IAbastecimentoRepository';
import { ICacheService } from '../../core/cache/ICacheService';
import { ITenantService } from '../../core/tenant/ITenantService';
import { PaginatedResult } from '../../core/repository/types';
import Abastecimento from '../../models/Abastecimento';
import Maquina from '../../models/Maquina';
import Pessoa from '../../models/Pessoa';
import Produto from '../../models/Produto';
import Fazenda from '../../models/Fazenda';
import Safra from '../../models/Safra';
import Usuario from '../../models/Usuario';

/**
 * Repositório para entidade Abastecimento
 */
@Injectable()
export class AbastecimentoRepository extends BaseRepository<Abastecimento> implements IAbastecimentoRepository {
  constructor(
    @Inject(TYPES.ICacheService) cacheService: ICacheService,
    @Inject(TYPES.ITenantService) tenantService: ITenantService
  ) {
    super(Abastecimento, cacheService, tenantService);
  }

  /**
   * Busca um abastecimento por ID com todas as associações
   */
  async findById(id: number | string): Promise<Abastecimento | null> {
    const tenantFilter = this.getTenantFilter();
    if (!tenantFilter) {
      return null;
    }

    const cacheKey = `abastecimento:findById:${id}:${JSON.stringify(tenantFilter)}`;
    const cached = await this.cacheService.get<Abastecimento>(cacheKey);
    if (cached !== null) {
      return cached;
    }

    const where: any = { id_abast: id };
    if (tenantFilter.tenantId) {
      where.tenantId = tenantFilter.tenantId;
    }

    const result = await this.model.findOne({
      where,
      include: [
        {
          model: Maquina,
          as: 'maquina',
          required: false,
        },
        {
          model: Pessoa,
          as: 'operador',
          required: false,
        },
        {
          model: Produto,
          as: 'combustivel',
          required: false,
        },
        {
          model: Fazenda,
          as: 'fazenda',
          required: false,
        },
        {
          model: Safra,
          as: 'cicloAbastecimento',
          required: false,
        },
        {
          model: Pessoa,
          as: 'operadorAbastecimento',
          required: false,
        },
        {
          model: Usuario,
          as: 'usuarioCriador',
          required: false,
        },
      ],
    });

    if (result) {
      await this.cacheService.set(cacheKey, result, this.DEFAULT_CACHE_TTL);
    }

    return result;
  }

  /**
   * Busca todos os abastecimentos paginados com associações resumidas
   */
  async findAllPaginated(page: number = 1, limit: number = 10): Promise<PaginatedResult<Abastecimento>> {
    const offset = (page - 1) * limit;
    const tenantFilter = this.getTenantFilter();
    const cacheKey = `abastecimento:list:${page}:${limit}:${JSON.stringify(tenantFilter)}`;

    const cached = await this.cacheService.get<PaginatedResult<Abastecimento>>(cacheKey);
    if (cached !== null) {
      return cached;
    }

    const where: any = {};
    if (tenantFilter) {
      if (tenantFilter.tenantId) {
        where.tenantId = tenantFilter.tenantId;
      }
    }

    const { count, rows } = await this.model.findAndCountAll({
      where,
      limit,
      offset,
      order: [['data', 'DESC'], ['id_abast', 'DESC']],
      include: [
        {
          model: Maquina,
          as: 'maquina',
          required: false,
        },
        {
          model: Fazenda,
          as: 'fazenda',
          required: false,
        },
      ],
    });

    const result: PaginatedResult<Abastecimento> = {
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
   * Busca abastecimentos por máquina
   */
  async findByMaquina(idMaquina: number): Promise<Abastecimento[]> {
    const tenantFilter = this.getTenantFilter();
    if (!tenantFilter) {
      return [];
    }

    const cacheKey = `abastecimento:findByMaquina:${idMaquina}:${JSON.stringify(tenantFilter)}`;
    const cached = await this.cacheService.get<Abastecimento[]>(cacheKey);
    if (cached !== null) {
      return cached;
    }

    const where: any = { idMaquina };
    if (tenantFilter.tenantId) {
      where.tenantId = tenantFilter.tenantId;
    }

    const result = await this.model.findAll({
      where,
      order: [['data', 'DESC'], ['id_abast', 'DESC']],
      include: [
        {
          model: Maquina,
          as: 'maquina',
          required: false,
        },
        {
          model: Fazenda,
          as: 'fazenda',
          required: false,
        },
      ],
    });

    await this.cacheService.set(cacheKey, result, this.DEFAULT_CACHE_TTL);
    return result;
  }

  /**
   * Busca abastecimentos por período
   */
  async findByPeriodo(dataInicio: string, dataFim: string): Promise<Abastecimento[]> {
    const tenantFilter = this.getTenantFilter();
    if (!tenantFilter) {
      return [];
    }

    const cacheKey = `abastecimento:findByPeriodo:${dataInicio}:${dataFim}:${JSON.stringify(tenantFilter)}`;
    const cached = await this.cacheService.get<Abastecimento[]>(cacheKey);
    if (cached !== null) {
      return cached;
    }

    const where: any = {
      data: {
        [Op.between]: [dataInicio, dataFim],
      },
    };
    if (tenantFilter.tenantId) {
      where.tenantId = tenantFilter.tenantId;
    }

    const result = await this.model.findAll({
      where,
      order: [['data', 'DESC'], ['id_abast', 'DESC']],
      include: [
        {
          model: Maquina,
          as: 'maquina',
          required: false,
        },
        {
          model: Fazenda,
          as: 'fazenda',
          required: false,
        },
      ],
    });

    await this.cacheService.set(cacheKey, result, this.DEFAULT_CACHE_TTL);
    return result;
  }

  /**
   * Sobrescreve create para invalidar caches relevantes
   */
  async create(entity: Partial<Abastecimento>): Promise<Abastecimento> {
    const result = await super.create(entity);

    await this.cacheService.deleteByPattern('abastecimento:list:*');
    await this.cacheService.deleteByPattern('abastecimento:findByMaquina:*');
    await this.cacheService.deleteByPattern('abastecimento:findByPeriodo:*');

    return result;
  }

  /**
   * Sobrescreve update para usar id_abast ao invés de id
   */
  async update(id: number | string, entity: Partial<Abastecimento>): Promise<Abastecimento> {
    const tenantFilter = this.getTenantFilter();
    if (!tenantFilter) {
      throw new Error('Tenant não identificado. Não é possível atualizar entidade sem tenantId.');
    }

    const where: any = { id_abast: id };
    if (tenantFilter.tenantId) {
      where.tenantId = tenantFilter.tenantId;
    }

    const instance = await this.model.findOne({ where });

    if (!instance) {
      throw new Error('Abastecimento não encontrado');
    }

    const entityWithoutAudit = { ...entity };
    if ('tenantId' in entityWithoutAudit) {
      delete (entityWithoutAudit as any).tenantId;
    }
    if ('id_abast' in entityWithoutAudit) {
      delete (entityWithoutAudit as any).id_abast;
    }

    await instance.update(entityWithoutAudit);

    await this.cacheService.deleteByPattern('abastecimento:findById:*');
    await this.cacheService.deleteByPattern('abastecimento:list:*');
    await this.cacheService.deleteByPattern('abastecimento:findByMaquina:*');
    await this.cacheService.deleteByPattern('abastecimento:findByPeriodo:*');

    return instance;
  }

  /**
   * Sobrescreve delete para usar id_abast ao invés de id
   */
  async delete(id: number | string): Promise<boolean> {
    const tenantFilter = this.getTenantFilter();
    if (!tenantFilter) {
      throw new Error('Tenant não identificado. Não é possível deletar entidade sem tenantId.');
    }

    const where: any = { id_abast: id };
    if (tenantFilter.tenantId) {
      where.tenantId = tenantFilter.tenantId;
    }

    const instance = await this.model.findOne({ where });

    if (!instance) {
      return false;
    }

    await instance.destroy();

    await this.cacheService.deleteByPattern('abastecimento:findById:*');
    await this.cacheService.deleteByPattern('abastecimento:list:*');
    await this.cacheService.deleteByPattern('abastecimento:findByMaquina:*');
    await this.cacheService.deleteByPattern('abastecimento:findByPeriodo:*');

    return true;
  }
}
