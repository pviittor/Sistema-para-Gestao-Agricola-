import { Injectable, Inject } from '../../core/di';
import { TYPES } from '../../core/di/types';
import { BaseRepository } from '../../core/repository/BaseRepository';
import { IFluxoCaixaSimulacaoRepository } from './IFluxoCaixaSimulacaoRepository';
import { ICacheService } from '../../core/cache/ICacheService';
import { ITenantService } from '../../core/tenant/ITenantService';
import FluxoCaixaSimulacao from '../../models/FluxoCaixaSimulacao';
import FluxoCaixaSimulacaoItem from '../../models/FluxoCaixaSimulacaoItem';

/**
 * Repositório para entidade FluxoCaixaSimulacao
 *
 * Estende BaseRepository para fornecer métodos CRUD padrão e adiciona
 * métodos específicos para busca de simulações de fluxo de caixa.
 */
@Injectable()
export class FluxoCaixaSimulacaoRepository extends BaseRepository<FluxoCaixaSimulacao> implements IFluxoCaixaSimulacaoRepository {
  constructor(
    @Inject(TYPES.ICacheService) cacheService: ICacheService,
    @Inject(TYPES.ITenantService) tenantService: ITenantService
  ) {
    super(FluxoCaixaSimulacao, cacheService, tenantService);
  }

  /**
   * Busca simulações de um usuário em um tenant
   *
   * @param usuarioId - ID do usuário
   * @param tenantId - ID do tenant
   * @returns Promise que resolve com array de simulações do usuário
   */
  async findByUsuario(usuarioId: number, tenantId: number): Promise<FluxoCaixaSimulacao[]> {
    return this.model.findAll({
      where: { usuarioId, tenantId },
      include: [
        {
          model: FluxoCaixaSimulacaoItem,
          as: 'itens',
          required: false,
        },
      ],
      order: [['updatedAt', 'DESC']],
    });
  }

  /**
   * Busca uma simulação pelo ID com seus itens incluídos
   *
   * @param id - ID da simulação
   * @param tenantId - ID do tenant
   * @returns Promise que resolve com a simulação completa ou null se não encontrada
   */
  async findByIdWithItens(id: number, tenantId: number): Promise<FluxoCaixaSimulacao | null> {
    return this.model.findOne({
      where: { id, tenantId },
      include: [
        {
          model: FluxoCaixaSimulacaoItem,
          as: 'itens',
          required: false,
        },
      ],
    });
  }
}
