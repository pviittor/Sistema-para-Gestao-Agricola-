import { Injectable, Inject } from '../../core/di';
import { TYPES } from '../../core/di/types';
import { BaseRepository } from '../../core/repository/BaseRepository';
import { IFluxoCaixaSimulacaoItemRepository } from './IFluxoCaixaSimulacaoItemRepository';
import { ICacheService } from '../../core/cache/ICacheService';
import { ITenantService } from '../../core/tenant/ITenantService';
import FluxoCaixaSimulacaoItem from '../../models/FluxoCaixaSimulacaoItem';

/**
 * Repositório para entidade FluxoCaixaSimulacaoItem
 *
 * Estende BaseRepository para fornecer métodos CRUD padrão e adiciona
 * métodos específicos para busca e remoção de itens por simulação.
 *
 * Entidade NÃO multi-tenant — o tenant é verificado pela simulação pai.
 */
@Injectable()
export class FluxoCaixaSimulacaoItemRepository extends BaseRepository<FluxoCaixaSimulacaoItem> implements IFluxoCaixaSimulacaoItemRepository {
  constructor(
    @Inject(TYPES.ICacheService) cacheService: ICacheService,
    @Inject(TYPES.ITenantService) tenantService: ITenantService
  ) {
    super(FluxoCaixaSimulacaoItem, cacheService, tenantService);
  }

  /**
   * Override findById — sem filtro de tenant (entidade não multi-tenant)
   */
  async findById(id: number | string): Promise<FluxoCaixaSimulacaoItem | null> {
    return this.model.findByPk(id);
  }

  /**
   * Override delete — sem filtro de tenant (entidade não multi-tenant)
   */
  async delete(id: number | string): Promise<boolean> {
    const instance = await this.model.findByPk(id);
    if (!instance) return false;
    await instance.destroy();
    return true;
  }

  /**
   * Busca todos os itens de uma simulação
   */
  async findBySimulacao(simulacaoId: number): Promise<FluxoCaixaSimulacaoItem[]> {
    return this.model.findAll({
      where: { simulacaoId },
      order: [['id', 'ASC']],
    });
  }

  /**
   * Remove todos os itens de uma simulação
   */
  async deleteBySimulacao(simulacaoId: number): Promise<number> {
    return this.model.destroy({ where: { simulacaoId } });
  }
}
