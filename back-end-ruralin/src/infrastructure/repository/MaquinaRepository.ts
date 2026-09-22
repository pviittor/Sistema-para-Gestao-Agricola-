import { Injectable, Inject } from '../../core/di';
import { TYPES } from '../../core/di/types';
import { BaseRepository } from '../../core/repository/BaseRepository';
import { IMaquinaRepository } from './IMaquinaRepository';
import { ICacheService } from '../../core/cache/ICacheService';
import { ITenantService } from '../../core/tenant/ITenantService';
import { PaginatedResult } from '../../core/repository/types';
import Maquina from '../../models/Maquina';
import GrupoEquipamento from '../../models/GrupoEquipamento';
import Pessoa from '../../models/Pessoa';
import Produto from '../../models/Produto';
import Fazenda from '../../models/Fazenda';
import Usuario from '../../models/Usuario';

/**
 * Repositório para entidade Maquina
 */
@Injectable()
export class MaquinaRepository extends BaseRepository<Maquina> implements IMaquinaRepository {
  constructor(
    @Inject(TYPES.ICacheService) cacheService: ICacheService,
    @Inject(TYPES.ITenantService) tenantService: ITenantService
  ) {
    super(Maquina, cacheService, tenantService);
  }

  /**
   * Busca uma máquina por ID com todas as associações
   */
  async findById(id: number | string): Promise<Maquina | null> {
    const tenantFilter = this.getTenantFilter();
    if (!tenantFilter) {
      return null;
    }

    const cacheKey = `maquina:findById:${id}:${JSON.stringify(tenantFilter)}`;
    const cached = await this.cacheService.get<Maquina>(cacheKey);
    if (cached !== null) {
      return cached;
    }

    const where: any = { id_mqn: id };
    if (tenantFilter.tenantId) {
      where.tenantId = tenantFilter.tenantId;
    }

    const result = await this.model.findOne({
      where,
      include: [
        {
          model: GrupoEquipamento,
          as: 'grupoEquipamento',
          required: false,
        },
        {
          model: Pessoa,
          as: 'fornecedor',
          required: false,
        },
        {
          model: Pessoa,
          as: 'motorista',
          required: false,
        },
        {
          model: Pessoa,
          as: 'seguradora',
          required: false,
        },
        {
          model: Produto,
          as: 'combustivelMaquina',
          required: false,
        },
        {
          model: Fazenda,
          as: 'fazenda',
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
   * Busca todas as máquinas paginadas com associações resumidas
   */
  async findAllPaginated(page: number = 1, limit: number = 10): Promise<PaginatedResult<Maquina>> {
    const offset = (page - 1) * limit;
    const tenantFilter = this.getTenantFilter();
    const cacheKey = `maquina:list:${page}:${limit}:${JSON.stringify(tenantFilter)}`;

    const cached = await this.cacheService.get<PaginatedResult<Maquina>>(cacheKey);
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
      order: [['descricao', 'ASC']],
      include: [
        {
          model: GrupoEquipamento,
          as: 'grupoEquipamento',
          required: false,
        },
        {
          model: Fazenda,
          as: 'fazenda',
          required: false,
        },
      ],
    });

    const result: PaginatedResult<Maquina> = {
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
   * Busca uma máquina pela placa
   */
  async findByPlaca(placa: string): Promise<Maquina | null> {
    const tenantFilter = this.getTenantFilter();
    if (!tenantFilter) {
      return null;
    }

    const cacheKey = `maquina:findByPlaca:${placa}:${JSON.stringify(tenantFilter)}`;
    const cached = await this.cacheService.get<Maquina>(cacheKey);
    if (cached !== null) {
      return cached;
    }

    const where: any = { placa };
    if (tenantFilter.tenantId) {
      where.tenantId = tenantFilter.tenantId;
    }

    const result = await this.model.findOne({
      where,
      include: [
        {
          model: GrupoEquipamento,
          as: 'grupoEquipamento',
          required: false,
        },
        {
          model: Pessoa,
          as: 'fornecedor',
          required: false,
        },
        {
          model: Pessoa,
          as: 'motorista',
          required: false,
        },
        {
          model: Pessoa,
          as: 'seguradora',
          required: false,
        },
        {
          model: Produto,
          as: 'combustivelMaquina',
          required: false,
        },
        {
          model: Fazenda,
          as: 'fazenda',
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
   * Busca máquinas por grupo de equipamento
   */
  async findByGrupo(idGrupo: number): Promise<Maquina[]> {
    const tenantFilter = this.getTenantFilter();
    if (!tenantFilter) {
      return [];
    }

    const cacheKey = `maquina:findByGrupo:${idGrupo}:${JSON.stringify(tenantFilter)}`;
    const cached = await this.cacheService.get<Maquina[]>(cacheKey);
    if (cached !== null) {
      return cached;
    }

    const where: any = { idGrupoEquipamento: idGrupo };
    if (tenantFilter.tenantId) {
      where.tenantId = tenantFilter.tenantId;
    }

    const result = await this.model.findAll({
      where,
      order: [['descricao', 'ASC']],
      include: [
        {
          model: GrupoEquipamento,
          as: 'grupoEquipamento',
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
   * Sobrescreve update para usar id_mqn ao invés de id
   */
  async update(id: number | string, entity: Partial<Maquina>): Promise<Maquina> {
    const tenantFilter = this.getTenantFilter();
    if (!tenantFilter) {
      throw new Error('Tenant não identificado. Não é possível atualizar entidade sem tenantId.');
    }

    const where: any = { id_mqn: id };
    if (tenantFilter.tenantId) {
      where.tenantId = tenantFilter.tenantId;
    }

    const instance = await this.model.findOne({ where });

    if (!instance) {
      throw new Error('Máquina não encontrada');
    }

    const entityWithoutAudit = { ...entity };
    if ('tenantId' in entityWithoutAudit) {
      delete (entityWithoutAudit as any).tenantId;
    }
    if ('id_mqn' in entityWithoutAudit) {
      delete (entityWithoutAudit as any).id_mqn;
    }

    await instance.update(entityWithoutAudit);

    await this.cacheService.deleteByPattern('maquina:findById:*');
    await this.cacheService.deleteByPattern('maquina:list:*');
    await this.cacheService.deleteByPattern('maquina:findByPlaca:*');
    await this.cacheService.deleteByPattern('maquina:findByGrupo:*');

    return instance;
  }

  /**
   * Sobrescreve delete para usar id_mqn ao invés de id
   */
  async delete(id: number | string): Promise<boolean> {
    const tenantFilter = this.getTenantFilter();
    if (!tenantFilter) {
      throw new Error('Tenant não identificado. Não é possível deletar entidade sem tenantId.');
    }

    const where: any = { id_mqn: id };
    if (tenantFilter.tenantId) {
      where.tenantId = tenantFilter.tenantId;
    }

    const instance = await this.model.findOne({ where });

    if (!instance) {
      return false;
    }

    await instance.destroy();

    await this.cacheService.deleteByPattern('maquina:findById:*');
    await this.cacheService.deleteByPattern('maquina:list:*');
    await this.cacheService.deleteByPattern('maquina:findByPlaca:*');
    await this.cacheService.deleteByPattern('maquina:findByGrupo:*');

    return true;
  }

  /**
   * Sobrescreve create para invalidar caches relevantes
   */
  async create(entity: Partial<Maquina>): Promise<Maquina> {
    const result = await super.create(entity);

    await this.cacheService.deleteByPattern('maquina:list:*');
    await this.cacheService.deleteByPattern('maquina:findByPlaca:*');
    await this.cacheService.deleteByPattern('maquina:findByGrupo:*');

    return result;
  }
}
