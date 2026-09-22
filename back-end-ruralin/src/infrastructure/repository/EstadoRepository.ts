import { Injectable, Inject } from '../../core/di';
import { TYPES } from '../../core/di/types';
import { BaseRepository } from '../../core/repository/BaseRepository';
import { IEstadoRepository } from './IEstadoRepository';
import { ICacheService } from '../../core/cache/ICacheService';
import { ITenantService } from '../../core/tenant/ITenantService';
import Estado from '../../models/Estado';
import { PaginatedResult } from '../../core/repository/types';

/**
 * Repositório para entidade Estado
 * 
 * Dados globais - sempre usa métodos sem filtro de tenant
 */
@Injectable()
export class EstadoRepository extends BaseRepository<Estado> implements IEstadoRepository {
  constructor(
    @Inject(TYPES.ICacheService) cacheService: ICacheService,
    @Inject(TYPES.ITenantService) tenantService: ITenantService
  ) {
    super(Estado, cacheService, tenantService);
  }

  /**
   * Busca uma entidade por ID (sem filtro de tenant - dados globais)
   */
  async findById(id: number | string): Promise<Estado | null> {
    return await this.findByIdWithoutTenant(id);
  }

  /**
   * Busca todas as entidades paginadas (sem filtro de tenant - dados globais)
   */
  async findAllPaginated(page: number = 1, limit: number = 10): Promise<PaginatedResult<Estado>> {
    const offset = (page - 1) * limit;
    const cacheKey = `estado:list:${page}:${limit}`;

    const cached = await this.cacheService.get<PaginatedResult<Estado>>(cacheKey);
    if (cached !== null) {
      return cached;
    }

    const { count, rows } = await this.model.findAndCountAll({
      limit,
      offset,
      order: [['nome', 'ASC']],
    });

    const result: PaginatedResult<Estado> = {
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
  async findAll(): Promise<Estado[]> {
    const cacheKey = 'estado:list:all';

    const cached = await this.cacheService.get<Estado[]>(cacheKey);
    if (cached !== null) {
      return cached;
    }

    const result = await this.findAllWithoutTenant({
      order: [['nome', 'ASC']],
    });

    await this.cacheService.set(cacheKey, result, this.DEFAULT_CACHE_TTL);
    return result;
  }

  /**
   * Busca uma entidade (sem filtro de tenant - dados globais)
   */
  async findOne(options?: any): Promise<Estado | null> {
    return await this.findOneWithoutTenant(options);
  }

  /**
   * Cria uma entidade (sem filtro de tenant - dados globais)
   */
  async create(data: Partial<Estado>): Promise<Estado> {
    const result = await this.model.create(data as any);
    await this.cacheService.delete('estado:list:*');
    return result;
  }

  /**
   * Atualiza uma entidade (sem filtro de tenant - dados globais)
   */
  async update(id: number | string, data: Partial<Estado>): Promise<Estado> {
    const entity = await this.model.findByPk(id);
    if (!entity) {
      throw new Error('Estado não encontrado');
    }

    await entity.update(data as any);
    await this.cacheService.delete('estado:list:*');
    await this.cacheService.delete(`estado:findById:${id}`);
    await this.cacheService.delete(`estado:findBySigla:*`);
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
    await this.cacheService.delete('estado:list:*');
    await this.cacheService.delete(`estado:findById:${id}`);
    await this.cacheService.delete(`estado:findBySigla:*`);
    return true;
  }

  /**
   * Busca um estado pela sigla
   */
  async findBySigla(sigla: string): Promise<Estado | null> {
    const cacheKey = `estado:findBySigla:${sigla.toUpperCase()}`;
    const cached = await this.cacheService.get<Estado>(cacheKey);
    if (cached !== null) {
      return cached;
    }

    const result = await this.model.findOne({
      where: {
        sigla: sigla.toUpperCase(),
      } as any,
    });

    if (result) {
      await this.cacheService.set(cacheKey, result, this.DEFAULT_CACHE_TTL);
    }

    return result;
  }
}
