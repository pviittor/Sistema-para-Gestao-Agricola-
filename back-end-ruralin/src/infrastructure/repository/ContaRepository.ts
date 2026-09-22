import { Injectable, Inject } from '../../core/di';
import { TYPES } from '../../core/di/types';
import { BaseRepository } from '../../core/repository/BaseRepository';
import { IContaRepository } from './IContaRepository';
import { ICacheService } from '../../core/cache/ICacheService';
import { ITenantService } from '../../core/tenant/ITenantService';
import Conta from '../../models/Conta';
import { Op } from 'sequelize';

/**
 * Repositório para entidade Conta
 * 
 * Estende BaseRepository para fornecer métodos CRUD padrão e adiciona
 * métodos específicos para busca de contas.
 */
@Injectable()
export class ContaRepository extends BaseRepository<Conta> implements IContaRepository {
  /**
   * Construtor do repositório
   * 
   * Inicializa o BaseRepository com o modelo Conta, cacheService e tenantService.
   */
  constructor(
    @Inject(TYPES.ICacheService) cacheService: ICacheService,
    @Inject(TYPES.ITenantService) tenantService: ITenantService
  ) {
    super(Conta, cacheService, tenantService);
  }

  /**
   * Busca contas por tipo
   * 
   * @param tipo - Tipo da conta (BANCO ou CAIXA)
   * @returns Promise que resolve com array de contas do tipo especificado
   */
  async findByTipo(tipo: string): Promise<Conta[]> {
    const tenantId = this.tenantService.getCurrentTenantId();
    if (!tenantId) {
      return [];
    }

    const cacheKey = `conta:findByTipo:${tipo}:${tenantId}`;
    
    // Tentar buscar do cache
    const cached = await this.cacheService.get<Conta[]>(cacheKey);
    if (cached) {
      return cached;
    }

    // Buscar do banco
    const contas = await this.model.findAll({
      where: {
        tipo,
        tenantId,
        ativo: true,
      },
      order: [['nome', 'ASC']],
    });

    // Cachear resultado
    await this.cacheService.set(cacheKey, contas, 3600);

    return contas;
  }
}
