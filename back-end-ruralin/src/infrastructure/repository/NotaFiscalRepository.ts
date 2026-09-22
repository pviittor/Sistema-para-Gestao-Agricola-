import { Op, fn, col, literal } from 'sequelize';
import { Injectable, Inject } from '../../core/di';
import { TYPES } from '../../core/di/types';
import { BaseRepository } from '../../core/repository/BaseRepository';
import { INotaFiscalRepository } from './INotaFiscalRepository';
import { ICacheService } from '../../core/cache/ICacheService';
import { ITenantService } from '../../core/tenant/ITenantService';
import { PaginatedResult } from '../../core/repository/types';
import NotaFiscal from '../../models/NotaFiscal';
import Pessoa from '../../models/Pessoa';
import Usuario from '../../models/Usuario';
import ItemNotaFiscal from '../../models/ItemNotaFiscal';
import Produto from '../../models/Produto';

/**
 * Repositorio para entidade NotaFiscal
 */
@Injectable()
export class NotaFiscalRepository extends BaseRepository<NotaFiscal> implements INotaFiscalRepository {
  protected override readonly DEFAULT_CACHE_TTL = 300;

  constructor(
    @Inject(TYPES.ICacheService) cacheService: ICacheService,
    @Inject(TYPES.ITenantService) tenantService: ITenantService
  ) {
    super(NotaFiscal, cacheService, tenantService);
  }

  /**
   * Busca uma nota fiscal por ID com todas as associacoes
   */
  async findById(id: number | string): Promise<NotaFiscal | null> {
    const tenantFilter = this.getTenantFilter();
    if (!tenantFilter) {
      return null;
    }

    const cacheKey = `notaFiscal:findById:${id}:${JSON.stringify(tenantFilter)}`;
    const cached = await this.cacheService.get<NotaFiscal>(cacheKey);
    if (cached !== null) {
      return cached;
    }

    const where: any = { id_nf: id };
    if (tenantFilter.tenantId) {
      where.tenantId = tenantFilter.tenantId;
    }

    const result = await this.model.findOne({
      where,
      include: [
        {
          model: Pessoa,
          as: 'emitente',
          required: false,
        },
        {
          model: Pessoa,
          as: 'destinatario',
          required: false,
        },
        {
          model: Pessoa,
          as: 'empresa',
          required: false,
        },
        {
          model: Pessoa,
          as: 'transportadora',
          required: false,
        },
        {
          model: NotaFiscal,
          as: 'notaFiscalRef',
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
   * Busca todas as notas fiscais paginadas com associacoes resumidas
   */
  async findAllPaginated(page: number = 1, limit: number = 10): Promise<PaginatedResult<NotaFiscal>> {
    const offset = (page - 1) * limit;
    const tenantFilter = this.getTenantFilter();
    const cacheKey = `notaFiscal:list:${page}:${limit}:${JSON.stringify(tenantFilter)}`;

    const cached = await this.cacheService.get<PaginatedResult<NotaFiscal>>(cacheKey);
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
      order: [['data_emissao', 'DESC'], ['id_nf', 'DESC']],
      include: [
        {
          model: Pessoa,
          as: 'emitente',
          required: false,
        },
        {
          model: Pessoa,
          as: 'destinatario',
          required: false,
        },
        {
          model: Pessoa,
          as: 'empresa',
          required: false,
        },
      ],
    });

    const result: PaginatedResult<NotaFiscal> = {
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
   * Busca nota fiscal pela chave de acesso NF-e
   */
  async findByChaveAcesso(chaveAcesso: string): Promise<NotaFiscal | null> {
    const tenantFilter = this.getTenantFilter();
    if (!tenantFilter) {
      return null;
    }

    const where: any = { chave_acesso: chaveAcesso };
    if (tenantFilter.tenantId) {
      where.tenantId = tenantFilter.tenantId;
    }

    return await this.model.findOne({
      where,
      include: [
        {
          model: Pessoa,
          as: 'emitente',
          required: false,
        },
        {
          model: Pessoa,
          as: 'destinatario',
          required: false,
        },
        {
          model: Pessoa,
          as: 'empresa',
          required: false,
        },
      ],
    });
  }

  /**
   * Lista notas fiscais por periodo de emissao
   */
  async findByPeriodo(dataInicio: string, dataFim: string, tipo?: string, status?: string): Promise<NotaFiscal[]> {
    const tenantFilter = this.getTenantFilter();
    if (!tenantFilter) {
      return [];
    }

    const where: any = {
      data_emissao: {
        [Op.between]: [dataInicio, dataFim],
      },
    };
    if (tenantFilter.tenantId) {
      where.tenantId = tenantFilter.tenantId;
    }
    if (tipo) {
      where.tipo = tipo;
    }
    if (status) {
      where.status = status;
    }

    return await this.model.findAll({
      where,
      order: [['data_emissao', 'DESC'], ['id_nf', 'DESC']],
      include: [
        {
          model: Pessoa,
          as: 'emitente',
          required: false,
        },
        {
          model: Pessoa,
          as: 'destinatario',
          required: false,
        },
        {
          model: Pessoa,
          as: 'empresa',
          required: false,
        },
      ],
    });
  }

  /**
   * Lista notas fiscais por emitente
   */
  async findByEmitente(emitenteId: number, tipo?: string): Promise<NotaFiscal[]> {
    const tenantFilter = this.getTenantFilter();
    if (!tenantFilter) {
      return [];
    }

    const where: any = { emitenteId };
    if (tenantFilter.tenantId) {
      where.tenantId = tenantFilter.tenantId;
    }
    if (tipo) {
      where.tipo = tipo;
    }

    return await this.model.findAll({
      where,
      order: [['data_emissao', 'DESC'], ['id_nf', 'DESC']],
      include: [
        {
          model: Pessoa,
          as: 'emitente',
          required: false,
        },
        {
          model: Pessoa,
          as: 'destinatario',
          required: false,
        },
      ],
    });
  }

  /**
   * Lista notas fiscais por destinatario
   */
  async findByDestinatario(destinatarioId: number): Promise<NotaFiscal[]> {
    const tenantFilter = this.getTenantFilter();
    if (!tenantFilter) {
      return [];
    }

    const where: any = { destinatarioId };
    if (tenantFilter.tenantId) {
      where.tenantId = tenantFilter.tenantId;
    }

    return await this.model.findAll({
      where,
      order: [['data_emissao', 'DESC'], ['id_nf', 'DESC']],
      include: [
        {
          model: Pessoa,
          as: 'emitente',
          required: false,
        },
        {
          model: Pessoa,
          as: 'destinatario',
          required: false,
        },
      ],
    });
  }

  /**
   * Busca notas autorizadas que ainda nao movimentaram estoque
   */
  async findPendentesMovimentacao(tipo?: string): Promise<NotaFiscal[]> {
    const tenantFilter = this.getTenantFilter();
    if (!tenantFilter) {
      return [];
    }

    const where: any = {
      status: 'autorizada',
      estoque_movimentado: false,
      ativo: true,
    };
    if (tenantFilter.tenantId) {
      where.tenantId = tenantFilter.tenantId;
    }
    if (tipo) {
      where.tipo = tipo;
    }

    return await this.model.findAll({
      where,
      order: [['data_emissao', 'ASC'], ['id_nf', 'ASC']],
      include: [
        {
          model: Pessoa,
          as: 'emitente',
          required: false,
        },
        {
          model: Pessoa,
          as: 'destinatario',
          required: false,
        },
      ],
    });
  }

  /**
   * Busca notas autorizadas sem financeiro gerado
   */
  async findPendentesFinanceiro(tipo?: string): Promise<NotaFiscal[]> {
    const tenantFilter = this.getTenantFilter();
    if (!tenantFilter) {
      return [];
    }

    const where: any = {
      status: 'autorizada',
      financeiro_gerado: false,
      ativo: true,
    };
    if (tenantFilter.tenantId) {
      where.tenantId = tenantFilter.tenantId;
    }
    if (tipo) {
      where.tipo = tipo;
    }

    return await this.model.findAll({
      where,
      order: [['data_emissao', 'ASC'], ['id_nf', 'ASC']],
      include: [
        {
          model: Pessoa,
          as: 'emitente',
          required: false,
        },
        {
          model: Pessoa,
          as: 'destinatario',
          required: false,
        },
      ],
    });
  }

  /**
   * Soma de totais agrupados por tipo/periodo
   */
  async totalPorPeriodo(dataInicio: string, dataFim: string): Promise<{ tipo: string; total: number; qtd: number }[]> {
    const tenantFilter = this.getTenantFilter();
    if (!tenantFilter) {
      return [];
    }

    const where: any = {
      data_emissao: {
        [Op.between]: [dataInicio, dataFim],
      },
      ativo: true,
    };
    if (tenantFilter.tenantId) {
      where.tenantId = tenantFilter.tenantId;
    }

    const results = await this.model.findAll({
      where,
      attributes: [
        'tipo',
        [fn('SUM', col('vl_total')), 'total'],
        [fn('COUNT', col('id_nf')), 'qtd'],
      ],
      group: ['tipo'],
      raw: true,
    }) as any[];

    return results.map((r: any) => ({
      tipo: r.tipo,
      total: r.total ? Number(r.total) : 0,
      qtd: r.qtd ? Number(r.qtd) : 0,
    }));
  }

  /**
   * Busca nota fiscal por numero, serie e modelo
   */
  async findByNumeroSerie(numero: string, serie: string, modelo: string): Promise<NotaFiscal | null> {
    const tenantFilter = this.getTenantFilter();
    if (!tenantFilter) {
      return null;
    }

    const where: any = { numero, serie, modelo };
    if (tenantFilter.tenantId) {
      where.tenantId = tenantFilter.tenantId;
    }

    return await this.model.findOne({
      where,
      include: [
        {
          model: Pessoa,
          as: 'emitente',
          required: false,
        },
        {
          model: Pessoa,
          as: 'destinatario',
          required: false,
        },
        {
          model: Pessoa,
          as: 'empresa',
          required: false,
        },
      ],
    });
  }

  /**
   * Busca nota fiscal por ID incluindo todos os itens e seus produtos (para resposta completa)
   */
  async findByIdWithDetails(id: number): Promise<NotaFiscal | null> {
    const tenantFilter = this.getTenantFilter();
    if (!tenantFilter) {
      return null;
    }

    const where: any = { id_nf: id };
    if (tenantFilter.tenantId) {
      where.tenantId = tenantFilter.tenantId;
    }

    return this.model.findOne({
      where,
      include: [
        { model: Pessoa, as: 'emitente', required: false },
        { model: Pessoa, as: 'destinatario', required: false },
        { model: Pessoa, as: 'empresa', required: false },
        { model: Pessoa, as: 'transportadora', required: false },
        { model: Usuario, as: 'usuarioCriador', required: false },
        { model: NotaFiscal, as: 'notaFiscalRef', required: false },
        {
          model: ItemNotaFiscal,
          as: 'itens',
          required: false,
          include: [
            { model: Produto, as: 'produto', required: false },
          ],
        },
      ],
      order: [[{ model: ItemNotaFiscal, as: 'itens' }, 'numero_item', 'ASC']],
    });
  }

  /**
   * Sobrescreve create para invalidar caches relevantes
   */
  async create(entity: Partial<NotaFiscal>): Promise<NotaFiscal> {
    const result = await super.create(entity);

    await this.cacheService.deleteByPattern('notaFiscal:list:*');
    await this.cacheService.deleteByPattern('notaFiscal:findByPeriodo:*');
    await this.cacheService.deleteByPattern('notaFiscal:findByEmitente:*');
    await this.cacheService.deleteByPattern('notaFiscal:findByDestinatario:*');

    return result;
  }

  /**
   * Sobrescreve update para usar id_nf ao inves de id
   */
  async update(id: number | string, entity: Partial<NotaFiscal>): Promise<NotaFiscal> {
    const tenantFilter = this.getTenantFilter();
    if (!tenantFilter) {
      throw new Error('Tenant nao identificado. Nao e possivel atualizar entidade sem tenantId.');
    }

    const where: any = { id_nf: id };
    if (tenantFilter.tenantId) {
      where.tenantId = tenantFilter.tenantId;
    }

    const instance = await this.model.findOne({ where });

    if (!instance) {
      throw new Error('Nota fiscal nao encontrada');
    }

    const entityWithoutAudit = { ...entity };
    if ('tenantId' in entityWithoutAudit) {
      delete (entityWithoutAudit as any).tenantId;
    }
    if ('id_nf' in entityWithoutAudit) {
      delete (entityWithoutAudit as any).id_nf;
    }

    await instance.update(entityWithoutAudit);

    await this.cacheService.deleteByPattern('notaFiscal:findById:*');
    await this.cacheService.deleteByPattern('notaFiscal:list:*');
    await this.cacheService.deleteByPattern('notaFiscal:findByPeriodo:*');
    await this.cacheService.deleteByPattern('notaFiscal:findByEmitente:*');
    await this.cacheService.deleteByPattern('notaFiscal:findByDestinatario:*');

    return instance;
  }

  /**
   * Sobrescreve delete para usar id_nf ao inves de id
   */
  async delete(id: number | string): Promise<boolean> {
    const tenantFilter = this.getTenantFilter();
    if (!tenantFilter) {
      throw new Error('Tenant nao identificado. Nao e possivel deletar entidade sem tenantId.');
    }

    const where: any = { id_nf: id };
    if (tenantFilter.tenantId) {
      where.tenantId = tenantFilter.tenantId;
    }

    const instance = await this.model.findOne({ where });

    if (!instance) {
      return false;
    }

    await instance.destroy();

    await this.cacheService.deleteByPattern('notaFiscal:findById:*');
    await this.cacheService.deleteByPattern('notaFiscal:list:*');
    await this.cacheService.deleteByPattern('notaFiscal:findByPeriodo:*');
    await this.cacheService.deleteByPattern('notaFiscal:findByEmitente:*');
    await this.cacheService.deleteByPattern('notaFiscal:findByDestinatario:*');

    return true;
  }
}
