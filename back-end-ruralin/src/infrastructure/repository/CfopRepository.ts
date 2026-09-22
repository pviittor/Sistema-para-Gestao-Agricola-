import { Injectable, Inject } from '../../core/di';
import { TYPES } from '../../core/di/types';
import { BaseRepository } from '../../core/repository/BaseRepository';
import { ICfopRepository } from './ICfopRepository';
import { ICacheService } from '../../core/cache/ICacheService';
import { ITenantService } from '../../core/tenant/ITenantService';
import Cfop from '../../models/Cfop';

/**
 * Repositório para entidade Cfop
 *
 * CFOP é uma entidade global (sem tenant). Todos os métodos herdados de
 * BaseRepository são sobrescritos para NÃO aplicar filtro de tenant.
 */
@Injectable()
export class CfopRepository extends BaseRepository<Cfop> implements ICfopRepository {
  constructor(
    @Inject(TYPES.ICacheService) cacheService: ICacheService,
    @Inject(TYPES.ITenantService) tenantService: ITenantService
  ) {
    super(Cfop, cacheService, tenantService);
  }

  // =========================================================================
  // Overrides — CFOP é global, não filtra por tenant
  // =========================================================================

  async findAllPaginated(page: number = 1, limit: number = 10): Promise<any> {
    const offset = (page - 1) * limit;
    const cacheKey = `cfop:list:${page}:${limit}`;
    const cached = await this.cacheService.get<any>(cacheKey);
    if (cached !== null) return cached;

    const { count, rows } = await this.model.findAndCountAll({
      where: { ativo: true },
      limit,
      offset,
      order: [['codigo', 'ASC']],
    });

    const result = {
      data: rows,
      page,
      limit,
      total: count,
      totalPages: Math.ceil(count / limit),
    };

    await this.cacheService.set(cacheKey, result, 86400);
    return result;
  }

  async findById(id: number | string): Promise<Cfop | null> {
    const cacheKey = `cfop:byId:${id}`;
    const cached = await this.cacheService.get<Cfop>(cacheKey);
    if (cached !== null) return cached;

    const result = await this.model.findByPk(Number(id));
    if (result) await this.cacheService.set(cacheKey, result, 86400);
    return result;
  }

  async create(entity: Partial<Cfop>): Promise<Cfop> {
    const result = await this.model.create(entity as any);
    await this.cacheService.deleteByPattern('cfop:list:*');
    await this.cacheService.delete('cfop:all');
    return result;
  }

  async update(id: number | string, entity: Partial<Cfop>): Promise<Cfop> {
    const instance = await this.model.findByPk(Number(id));
    if (!instance) {
      throw new Error('CFOP não encontrado');
    }
    await instance.update(entity);
    await this.cacheService.delete(`cfop:byId:${id}`);
    await this.cacheService.deleteByPattern('cfop:list:*');
    await this.cacheService.delete('cfop:all');
    return instance;
  }

  async delete(id: number | string): Promise<boolean> {
    const instance = await this.model.findByPk(Number(id));
    if (!instance) return false;
    await instance.destroy();
    await this.cacheService.delete(`cfop:byId:${id}`);
    await this.cacheService.deleteByPattern('cfop:list:*');
    await this.cacheService.delete('cfop:all');
    return true;
  }

  // =========================================================================
  // Métodos customizados
  // =========================================================================

  async findByCodigo(codigo: string): Promise<Cfop | null> {
    return this.model.findOne({ where: { codigo } });
  }

  async findAllNoPagination(): Promise<Cfop[]> {
    const cacheKey = 'cfop:all';
    const cached = await this.cacheService.get<Cfop[]>(cacheKey);
    if (cached !== null) return cached;

    const result = await this.model.findAll({
      where: { ativo: true },
      order: [['codigo', 'ASC']],
    });

    await this.cacheService.set(cacheKey, result, 86400);
    return result;
  }
}
