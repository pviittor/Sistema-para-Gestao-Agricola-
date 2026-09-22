import { Injectable, Inject } from '../../core/di';
import { TYPES } from '../../core/di/types';
import { BaseRepository } from '../../core/repository/BaseRepository';
import { IFazendaRepository } from './IFazendaRepository';
import { ICacheService } from '../../core/cache/ICacheService';
import { ITenantService } from '../../core/tenant/ITenantService';
import Fazenda from '../../models/Fazenda';
import { PaginatedResult } from '../../core/repository/types';
import { FindOptions } from 'sequelize';
import Pessoa from '../../models/Pessoa';
import Municipio from '../../models/Municipio';

/**
 * Repositório para entidade Fazenda
 */
@Injectable()
export class FazendaRepository extends BaseRepository<Fazenda> implements IFazendaRepository {
  constructor(
    @Inject(TYPES.ICacheService) cacheService: ICacheService,
    @Inject(TYPES.ITenantService) tenantService: ITenantService
  ) {
    super(Fazenda, cacheService, tenantService);
  }

  /**
   * Busca todas as entidades paginadas
   */
  async findAllPaginated(page: number = 1, limit: number = 10): Promise<PaginatedResult<Fazenda>> {
    const offset = (page - 1) * limit;
    const tenantFilter = this.getTenantFilter();
    const cacheKey = `fazenda:list:${page}:${limit}:${JSON.stringify(tenantFilter)}`;

    const cached = await this.cacheService.get<PaginatedResult<Fazenda>>(cacheKey);
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
          model: Pessoa,
          as: 'pessoa',
          required: false,
        },
        {
          model: Municipio,
          as: 'municipio',
          required: false,
        },
      ],
    });

    const result: PaginatedResult<Fazenda> = {
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
   * Busca todas as entidades
   */
  async findAll(): Promise<Fazenda[]> {
    const tenantFilter = this.getTenantFilter();
    const cacheKey = `fazenda:list:all:${JSON.stringify(tenantFilter)}`;

    const cached = await this.cacheService.get<Fazenda[]>(cacheKey);
    if (cached !== null) {
      return cached;
    }

    const where: any = {};
    if (tenantFilter) {
      if (tenantFilter.tenantId) {
        where.tenantId = tenantFilter.tenantId;
      }
    }

    const result = await this.model.findAll({
      where,
      order: [['descricao', 'ASC']],
      include: [
        {
          model: Pessoa,
          as: 'pessoa',
          required: false,
        },
        {
          model: Municipio,
          as: 'municipio',
          required: false,
        },
      ],
    });

    await this.cacheService.set(cacheKey, result, this.DEFAULT_CACHE_TTL);
    return result;
  }

  /**
   * Busca uma entidade por ID
   */
  async findById(id: number | string): Promise<Fazenda | null> {
    const tenantFilter = this.getTenantFilter();
    const cacheKey = `fazenda:findById:${id}:${JSON.stringify(tenantFilter)}`;

    const cached = await this.cacheService.get<Fazenda>(cacheKey);
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
        {
          model: Pessoa,
          as: 'pessoa',
          required: false,
        },
        {
          model: Municipio,
          as: 'municipio',
          required: false,
        },
        {
          model: Pessoa,
          as: 'pessoaArrendamento',
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
   * Busca uma entidade
   */
  async findOne(options?: FindOptions): Promise<Fazenda | null> {
    const tenantFilter = this.getTenantFilter();
    const where: any = { ...(options?.where as any) };
    
    if (tenantFilter) {
      if (tenantFilter.tenantId) {
        where.tenantId = tenantFilter.tenantId;
      }
    }

    return await this.model.findOne({
      ...options,
      where,
    });
  }

  /**
   * Cria uma entidade
   */
  async create(data: Partial<Fazenda>): Promise<Fazenda> {
    const result = await this.model.create(data as any);
    await this.cacheService.delete('fazenda:list:*');
    await this.cacheService.delete('fazenda:findByPessoa:*');
    await this.cacheService.delete('fazenda:findByMunicipio:*');
    return result;
  }

  /**
   * Atualiza uma entidade
   */
  async update(id: number | string, data: Partial<Fazenda>): Promise<Fazenda> {
    const entity = await this.findById(id);
    if (!entity) {
      throw new Error('Fazenda não encontrada');
    }

    await entity.update(data as any);
    await this.cacheService.delete('fazenda:list:*');
    await this.cacheService.delete(`fazenda:findById:${id}`);
    await this.cacheService.delete('fazenda:findByPessoa:*');
    await this.cacheService.delete('fazenda:findByMunicipio:*');
    return entity;
  }

  /**
   * Deleta uma entidade
   */
  async delete(id: number | string): Promise<boolean> {
    const entity = await this.findById(id);
    if (!entity) {
      return false;
    }

    await entity.destroy();
    await this.cacheService.delete('fazenda:list:*');
    await this.cacheService.delete(`fazenda:findById:${id}`);
    await this.cacheService.delete('fazenda:findByPessoa:*');
    await this.cacheService.delete('fazenda:findByMunicipio:*');
    return true;
  }

  /**
   * Busca fazendas por pessoa (produtor)
   */
  async findByPessoa(idPessoa: number): Promise<Fazenda[]> {
    const tenantFilter = this.getTenantFilter();
    const cacheKey = `fazenda:findByPessoa:${idPessoa}:${JSON.stringify(tenantFilter)}`;
    
    const cached = await this.cacheService.get<Fazenda[]>(cacheKey);
    if (cached !== null) {
      return cached;
    }

    const where: any = { idPessoa };
    if (tenantFilter) {
      if (tenantFilter.tenantId) {
        where.tenantId = tenantFilter.tenantId;
      }
    }

    const result = await this.model.findAll({
      where,
      order: [['descricao', 'ASC']],
      include: [
        {
          model: Pessoa,
          as: 'pessoa',
          required: false,
        },
        {
          model: Municipio,
          as: 'municipio',
          required: false,
        },
      ],
    });

    await this.cacheService.set(cacheKey, result, this.DEFAULT_CACHE_TTL);
    return result;
  }

  /**
   * Busca fazendas por município
   */
  async findByMunicipio(idMunicipio: number): Promise<Fazenda[]> {
    const tenantFilter = this.getTenantFilter();
    const cacheKey = `fazenda:findByMunicipio:${idMunicipio}:${JSON.stringify(tenantFilter)}`;
    
    const cached = await this.cacheService.get<Fazenda[]>(cacheKey);
    if (cached !== null) {
      return cached;
    }

    const where: any = { idMunicipio };
    if (tenantFilter) {
      if (tenantFilter.tenantId) {
        where.tenantId = tenantFilter.tenantId;
      }
    }

    const result = await this.model.findAll({
      where,
      order: [['descricao', 'ASC']],
      include: [
        {
          model: Pessoa,
          as: 'pessoa',
          required: false,
        },
        {
          model: Municipio,
          as: 'municipio',
          required: false,
        },
      ],
    });

    await this.cacheService.set(cacheKey, result, this.DEFAULT_CACHE_TTL);
    return result;
  }
}
