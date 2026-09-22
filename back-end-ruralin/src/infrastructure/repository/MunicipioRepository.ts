import { Injectable, Inject } from '../../core/di';
import { TYPES } from '../../core/di/types';
import { BaseRepository } from '../../core/repository/BaseRepository';
import { IMunicipioRepository } from './IMunicipioRepository';
import { ICacheService } from '../../core/cache/ICacheService';
import { ITenantService } from '../../core/tenant/ITenantService';
import Municipio from '../../models/Municipio';
import Estado from '../../models/Estado';
import { PaginatedResult } from '../../core/repository/types';

/**
 * Repositório para entidade Municipio
 * 
 * Dados globais - sempre usa métodos sem filtro de tenant
 */
@Injectable()
export class MunicipioRepository extends BaseRepository<Municipio> implements IMunicipioRepository {
  constructor(
    @Inject(TYPES.ICacheService) cacheService: ICacheService,
    @Inject(TYPES.ITenantService) tenantService: ITenantService
  ) {
    super(Municipio, cacheService, tenantService);
  }

  /**
   * Busca uma entidade por ID (sem filtro de tenant - dados globais)
   */
  async findById(id: number | string): Promise<Municipio | null> {
    return await this.findByIdWithoutTenant(id);
  }

  /**
   * Busca todas as entidades paginadas (sem filtro de tenant - dados globais)
   */
  async findAllPaginated(page: number = 1, limit: number = 10): Promise<PaginatedResult<Municipio>> {
    const offset = (page - 1) * limit;
    const cacheKey = `municipio:list:${page}:${limit}`;

    const cached = await this.cacheService.get<PaginatedResult<Municipio>>(cacheKey);
    if (cached !== null) {
      return cached;
    }

    const { count, rows } = await this.model.findAndCountAll({
      limit,
      offset,
      order: [['nome', 'ASC']],
      include: [
        {
          model: Estado,
          as: 'estado',
          required: false,
        },
      ],
    });

    const result: PaginatedResult<Municipio> = {
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
   * Busca todas as entidades (sem filtro de tenant - dados globais)
   */
  async findAll(): Promise<Municipio[]> {
    const cacheKey = 'municipio:list:all';

    const cached = await this.cacheService.get<Municipio[]>(cacheKey);
    if (cached !== null) {
      return cached;
    }

    const result = await this.findAllWithoutTenant({
      order: [['nome', 'ASC']],
      include: [
        {
          model: Estado,
          as: 'estado',
          required: false,
        },
      ],
    });

    await this.cacheService.set(cacheKey, result, this.DEFAULT_CACHE_TTL);
    return result;
  }

  /**
   * Busca uma entidade (sem filtro de tenant - dados globais)
   */
  async findOne(options?: any): Promise<Municipio | null> {
    return await this.findOneWithoutTenant(options);
  }

  /**
   * Cria uma entidade (sem filtro de tenant - dados globais)
   */
  async create(data: Partial<Municipio>): Promise<Municipio> {
    const result = await this.model.create(data as any);
    await this.cacheService.delete('municipio:list:*');
    await this.cacheService.delete(`municipio:findByEstado:*`);
    return result;
  }

  /**
   * Atualiza uma entidade (sem filtro de tenant - dados globais)
   */
  async update(id: number | string, data: Partial<Municipio>): Promise<Municipio> {
    const entity = await this.model.findByPk(id);
    if (!entity) {
      throw new Error('Município não encontrado');
    }

    await entity.update(data as any);
    await this.cacheService.delete('municipio:list:*');
    await this.cacheService.delete(`municipio:findById:${id}`);
    await this.cacheService.delete(`municipio:findByEstado:*`);
    await this.cacheService.delete(`municipio:findByCodigoIBGE:*`);
    return entity;
  }

  /**
   * Deleta uma entidade (sem filtro de tenant - dados globais)
   */
  async delete(id: number | string): Promise<boolean> {
    const entity = await this.model.findByPk(id);
    if (!entity) {
      return false;
    }

    await entity.destroy();
    await this.cacheService.delete('municipio:list:*');
    await this.cacheService.delete(`municipio:findById:${id}`);
    await this.cacheService.delete(`municipio:findByEstado:*`);
    await this.cacheService.delete(`municipio:findByCodigoIBGE:*`);
    return true;
  }

  /**
   * Busca todos os municípios de um estado específico
   */
  async findByEstado(idEstado: number): Promise<Municipio[]> {
    const cacheKey = `municipio:findByEstado:${idEstado}`;
    const cached = await this.cacheService.get<Municipio[]>(cacheKey);
    if (cached !== null) {
      return cached;
    }

    const result = await this.model.findAll({
      where: {
        idEstado,
      } as any,
      order: [['nome', 'ASC']],
      include: [
        {
          model: Estado,
          as: 'estado',
          required: false,
        },
      ],
    });

    await this.cacheService.set(cacheKey, result, this.DEFAULT_CACHE_TTL);
    return result;
  }

  /**
   * Busca um município pelo código IBGE
   */
  async findByCodigoIBGE(codigoIBGE: number): Promise<Municipio | null> {
    const cacheKey = `municipio:findByCodigoIBGE:${codigoIBGE}`;
    const cached = await this.cacheService.get<Municipio>(cacheKey);
    if (cached !== null) {
      return cached;
    }

    const result = await this.model.findOne({
      where: {
        codigoIBGE,
      } as any,
      include: [
        {
          model: Estado,
          as: 'estado',
          required: false,
        },
      ],
    });

    if (result) {
      await this.cacheService.set(cacheKey, result, this.DEFAULT_CACHE_TTL);
    }

    return result;
  }
}
