import { Op } from 'sequelize';
import { Injectable, Inject } from '../../core/di';
import { TYPES } from '../../core/di/types';
import { BaseRepository } from '../../core/repository/BaseRepository';
import { IHistoricoPrecoRepository } from './IHistoricoPrecoRepository';
import { ICacheService } from '../../core/cache/ICacheService';
import { ITenantService } from '../../core/tenant/ITenantService';
import HistoricoPreco from '../../models/HistoricoPreco';
import Produto from '../../models/Produto';
import Fazenda from '../../models/Fazenda';
import MovimentoEstoque from '../../models/MovimentoEstoque';
import Moeda from '../../models/Moeda';
import Usuario from '../../models/Usuario';

/**
 * Repositório para entidade HistoricoPreco
 */
@Injectable()
export class HistoricoPrecoRepository extends BaseRepository<HistoricoPreco> implements IHistoricoPrecoRepository {
  constructor(
    @Inject(TYPES.ICacheService) cacheService: ICacheService,
    @Inject(TYPES.ITenantService) tenantService: ITenantService
  ) {
    super(HistoricoPreco, cacheService, tenantService);
  }

  /**
   * Busca um histórico por ID com associações
   */
  async findById(id: number | string): Promise<HistoricoPreco | null> {
    const tenantFilter = this.getTenantFilter();
    if (!tenantFilter) {
      return null;
    }

    const where: any = { id_hist: id };
    if (tenantFilter.tenantId) {
      where.tenantId = tenantFilter.tenantId;
    }

    return await this.model.findOne({
      where,
      include: [
        {
          model: Produto,
          as: 'produto',
          required: false,
        },
        {
          model: Fazenda,
          as: 'fazenda',
          required: false,
        },
        {
          model: MovimentoEstoque,
          as: 'movimentoEstoque',
          required: false,
        },
        {
          model: Moeda,
          as: 'moeda',
          required: false,
        },
        {
          model: Usuario,
          as: 'usuarioCriador',
          required: false,
        },
      ],
    });
  }

  /**
   * Busca histórico de preços por produto
   */
  async findByProduto(idProduto: number): Promise<HistoricoPreco[]> {
    const tenantFilter = this.getTenantFilter();
    if (!tenantFilter) {
      return [];
    }

    const where: any = { idProduto };
    if (tenantFilter.tenantId) {
      where.tenantId = tenantFilter.tenantId;
    }

    return await this.model.findAll({
      where,
      order: [['data', 'DESC'], ['id_hist', 'DESC']],
      include: [
        {
          model: Produto,
          as: 'produto',
          required: false,
        },
        {
          model: Fazenda,
          as: 'fazenda',
          required: false,
        },
        {
          model: Moeda,
          as: 'moeda',
          required: false,
        },
      ],
    });
  }

  /**
   * Busca histórico de preços por produto e fazenda
   */
  async findByProdutoFazenda(idProduto: number, idFazenda: number): Promise<HistoricoPreco[]> {
    const tenantFilter = this.getTenantFilter();
    if (!tenantFilter) {
      return [];
    }

    const where: any = { idProduto, idFazenda };
    if (tenantFilter.tenantId) {
      where.tenantId = tenantFilter.tenantId;
    }

    return await this.model.findAll({
      where,
      order: [['data', 'DESC'], ['id_hist', 'DESC']],
      include: [
        {
          model: Produto,
          as: 'produto',
          required: false,
        },
        {
          model: Moeda,
          as: 'moeda',
          required: false,
        },
      ],
    });
  }

  /**
   * Busca histórico de preços por produto e período
   */
  async findByPeriodo(idProduto: number, dataInicio: string, dataFim: string): Promise<HistoricoPreco[]> {
    const tenantFilter = this.getTenantFilter();
    if (!tenantFilter) {
      return [];
    }

    const where: any = {
      idProduto,
      data: {
        [Op.between]: [dataInicio, dataFim],
      },
    };
    if (tenantFilter.tenantId) {
      where.tenantId = tenantFilter.tenantId;
    }

    return await this.model.findAll({
      where,
      order: [['data', 'DESC'], ['id_hist', 'DESC']],
      include: [
        {
          model: Produto,
          as: 'produto',
          required: false,
        },
        {
          model: Fazenda,
          as: 'fazenda',
          required: false,
        },
        {
          model: Moeda,
          as: 'moeda',
          required: false,
        },
      ],
    });
  }

  /**
   * Sobrescreve update para usar id_hist ao invés de id
   */
  async update(id: number | string, entity: Partial<HistoricoPreco>): Promise<HistoricoPreco> {
    const tenantFilter = this.getTenantFilter();
    if (!tenantFilter) {
      throw new Error('Tenant não identificado. Não é possível atualizar entidade sem tenantId.');
    }

    const where: any = { id_hist: id };
    if (tenantFilter.tenantId) {
      where.tenantId = tenantFilter.tenantId;
    }

    const instance = await this.model.findOne({ where });

    if (!instance) {
      throw new Error('Histórico de preço não encontrado');
    }

    const entityWithoutAudit = { ...entity };
    if ('tenantId' in entityWithoutAudit) {
      delete (entityWithoutAudit as any).tenantId;
    }
    if ('id_hist' in entityWithoutAudit) {
      delete (entityWithoutAudit as any).id_hist;
    }

    await instance.update(entityWithoutAudit);
    return instance;
  }

  /**
   * Sobrescreve delete para usar id_hist ao invés de id
   */
  async delete(id: number | string): Promise<boolean> {
    const tenantFilter = this.getTenantFilter();
    if (!tenantFilter) {
      throw new Error('Tenant não identificado. Não é possível deletar entidade sem tenantId.');
    }

    const where: any = { id_hist: id };
    if (tenantFilter.tenantId) {
      where.tenantId = tenantFilter.tenantId;
    }

    const instance = await this.model.findOne({ where });

    if (!instance) {
      return false;
    }

    await instance.destroy();
    return true;
  }
}
